---
title: '猜 5 个再验一遍：投机解码与 DSpark 草稿头'
description: 'decode 是带宽瓶颈，搬一次权重只写一个字太浪费。投机解码让草稿器先猜 5 个 token，再由主模型一次验证——DSpark 是三阶段（每阶段 128 专家取 3）、读取第 37–39 层注意力输入的小模型。还包括 AMD 上必须关掉自适应验证的两个具体检查，以及 --max-cudagraph-capture-size 里 128×(1+5) 的由来。'
pubDate: 2026-09-25T10:24:00+08:00
slug: "deepseek-deploy-10-speculative-decoding"
category: null
tags: ["DeepSeek", "vLLM", "模型部署", "推理加速", "术语科普"]
status: published
draft: false
published: true
source: "https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust"
---

来源：[vLLM Recipes · deepseek-ai/DeepSeek-V4.1-Flash](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust)（页面标注 Updated 2026-09-20）

> **说明**
> 本文是系列[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)的第 10 篇，面向只熟悉 vanilla transformer 的读者，把官方页面里的术语逐个拆开解释。文中所有数字、参数与命令均来自上述页面，未作独立核实。

## 一句话结论

decode 阶段每写一个字，都要把权重从显存里搬一遍——这是**带宽瓶颈**，不是算力瓶颈。
投机解码（speculative decoding）的招数是：**让一个便宜的草稿器先一口气猜出 5 个 token，
再让主模型用一次前向把 5 个一起验证**。验证一次的成本和生成一个字的成本几乎一样，
所以只要猜得够准，就相当于**一次搬运换来好几个字**。
这台模型用的草稿器叫 **DSpark**，它也是 V4.1 相对 V3/V4 的一个替换（原来的 MTP 模块被去掉了）。

## 为什么 decode 是带宽瓶颈

回忆第 4 篇：prefill 是"一次算一大片"，GPU 的算力被吃满；
decode 是"一次算一个字"，每个 token 都要读取全部激活权重（8B/16B 参数）。
结果就是：**算力用不满，带宽用满**——每写一个字，显存里的权重被搬一遍。

于是自然的问题是：**既然搬一次权重只写一个字太浪费，能不能一次写好几个？**

能，但有个前提：**你得先知道要写什么。** 直接一次输出 5 个字会降低质量（模型没有机会逐字调整），
所以投机解码换了个思路——**先猜，再验**：

```
① 草稿器（便宜）  ：给出 5 个候选 token             ← 一次小前向
② 主模型（昂贵）  ：一次前向，验证这 5 个候选        ← 和生成 1 个字几乎是同一次搬运
③ 从前往后比对   ：相同的部分直接接受（可能是 5 个、3 个、1 个，甚至 0 个）
④ 第一个被否决的位置，用主模型的分布重新采样，继续下一轮
```

**关键收益**：第 ② 步的成本几乎固定。接受的长度越长，平均每个 token 的成本越低。
这个"平均接受长度"就是**接受长度（acceptance length）**，也是投机解码唯一的绩效指标。

## DSpark 长什么样

官方页面在 Overview 里给了它的结构：

> **DSpark 草稿头**：三个阶段（每阶段 **128 个路由专家**，激活 **3 个**）起草一个 **5 token 的块**，
> 读取第 **37–39 层**的注意力输入，最后一个阶段上带有一个**马尔可夫偏置头**和一个**置信度头**。

逐句解释：

- **三个阶段、每阶段 128 专家取 3**：草稿器自己也是个小 MoE，而且很稀疏（3/128）——
  毕竟它的任务只是"猜"，不需要那么准。
- **读取第 37–39 层的注意力输入**：它不重新理解全文，而是**偷看主模型最后几层的中间状态**。
  既然主模型已经算到 39 层了，"下一个词大概是什么" 的信息就在那儿，直接拿来用最省。
- **马尔可夫偏置头**：给相邻 token 之间的转移加偏好（"猜出 `北京` 之后，下一个更可能是 `时间` 而不是 `算法`"）。
- **置信度头**：给这一轮的猜测打个分——**知道自己什么时候不靠谱**，这对是否值得验证很关键。

## 部署视角：三个必须知道的坑

**① 草稿器不是免费的，它占参数。**
> 草稿器的专家会给加载量增加大约 **14B 参数**。

所以"投机解码免费加速"是错的：你要多装 14B，换来的是更快的 decode。
另外提醒一句：官方账本里的 552B 主干**不包含**这 14B。

**② NVIDIA 与 AMD 的差别就在"自适应验证"。**
- NVIDIA：投机解码会**同时打开自适应验证**（adaptive verification）——按置信度决定验证多长，省一点算力。
- AMD：**vLLM 目前拒绝这个开关**，生成的命令会显式设 `enable_adaptive_verification:false`，改为**验证整个 5 token 块**。
  页面给了两个具体的失败检查：indexer 的辅助函数 `supports_device_cpu_query_lens_mismatch()` 返回 False，
  以及 `DeepseekV41ROCMAiterSparseSWABackend` 报告的是 `UNIFORM_BATCH` 而不是 `ALWAYS`。
  官方的态度很谨慎：**只有在用真实标志成功启动过一次之后，才去掉这个 AMD 覆盖。**

**③ 基准里的"synthetic acceptance"不是真实服务配置。**
官方基准命令里有两个模式：

```json
{"method":"dspark","num_speculative_tokens":5,"draft_sample_method":"probabilistic",
 "rejection_sample_method":"block","enable_adaptive_verification":false}
```

- `rejection_sample_method: "block"` + `EVAL_ONLY=true`：**真实的块拒绝**，用于准确率评测，也是官方建议的日常服务模式。
- `rejection_sample_method: "synthetic"` + `synthetic_acceptance_length: 3.51`：**假装接受长度是 3.51**，
  纯吞吐量测量用的。**别拿它跑真实流量**——它模拟的是"猜得准"的理想情况。

## 还有一个连锁反应：CUDA graph 要留位置

投机解码的 token 也走模型的 decode 路径，所以**图捕获的大小要把它算进去**。官方的算法很直白：

```
128 × (1 + 5) = 768      # 128 是批内序列数，1 是"真实下一个 token"，5 是草稿 token
→ --max-cudagraph-capture-size 1024     # 向上取整到 1024
```

**这就是"调参"和"机制"的关系**：不理解 1+5 是哪来的，就调不对这个参数。

顺带说一句：第 12 篇的 **PD 分离**布局里，DSpark 必须在 prefill 和 decode 两个池子里都跑，
**这样被传输的 KV 才保持兼容**——投机解码不是"decode 池自己的事"。

## 三个常见误解

**你以为：投机解码是"用小模型代替大模型"，会降低质量。**
实际上：草稿只是**提议**，最终输出由主模型验证并采样决定。
配合正确的拒绝采样（rejection sampling），**输出分布与不用草稿时一致**——它是"同质量的加速"，不是"降级换速度"。

**你以为：猜 5 个就能快 5 倍。**
实际上：加速比取决于**接受长度**。如果真实接受长度是 3.51，收益大约是 3.5 倍减去草稿器自身的开销，
再算上验证失败要重采样——**而且这 3.51 是基准里的合成数字**，你自己的流量是多少，只能自己测。
官网的原话就是："接受率取决于工作负载，所以在围绕它规划部署规模之前，先在自己的流量上实测。"

**你以为：V4.1 和 V4 的投机方案一样。**
实际上：**V4.1 去掉了 V3 和 V4 随主干一起训练的 MTP 模块**，DSpark 是这个 checkpoint 唯一的投机方法。

## 术语卡片

| 术语 | 中文 | 一句话定义 |
|---|---|---|
| speculative decoding | 投机解码 | 用便宜草稿器先猜多个 token，再由主模型批量验证 |
| draft head | 草稿头 | 产生候选 token 的小模型，这里是 DSpark（3 阶段，5 token 块） |
| acceptance length | 接受长度 | 每轮被接受的 token 数，投机解码的核心绩效指标 |
| adaptive verification | 自适应验证 | 按置信度决定一次验证多长；NVIDIA 上默认开，AMD 上被拒绝 |
| rejection sampling | 拒绝采样 | 用主模型分布修正草稿提议，保证输出分布不变 |
| MTP | 多 token 预测 | V3/V4 随主干训练的额外预测模块，V4.1 已移除 |
| `--max-cudagraph-capture-size` | 图捕获上限 | 要覆盖 128 ×(1+5) 的 decode 批，故取 1024 |

## 小结

1. **decode 是带宽瓶颈**，投机解码用"猜 5 个、验一次"把一次权重搬运服务多个 token。
2. **DSpark 是唯一方案**（MTP 已移除），额外约 14B 参数；效果取决于**你自己的**接受长度。
3. **AMD 上要关掉自适应验证**（vLLM 尚未支持），基准里的 synthetic 接受长度只是测量手段，不是服务配置。

下一篇：[《并行三兄弟：TP / DP / EP(DEP)》](/posts/deepseek-deploy-11-parallelism-tp-dp-ep/)——一张卡装不下 511 GB 时，到底该怎么切。

---

**系列目录**：[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)

上一篇：[《BF16/FP8/MXFP4/MXFP8/UE8M0：数字格式与 511GB 显存账本》](/posts/deepseek-deploy-09-number-formats-memory/)
