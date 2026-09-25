---
title: '注意力与 KV cache：为什么「长上下文」本质是显存问题'
description: 'prefill 吃算力、decode 吃带宽：从 TTFT 讲到 KV cache 为什么随长度和并发线性增长。以及这个模型的反直觉之处——890 字节/token 让上下文几乎不再是显存问题，真正吃显存的是权重和批大小；顺带说清 --max-model-len、--max-num-seqs、--max-num-batched-tokens 该怎么排优先级，KV offloading 为什么是"用延迟换容量"。'
pubDate: 2026-09-25T10:03:00+08:00
slug: "deepseek-deploy-04-attention-kv-cache"
category: null
tags: ["DeepSeek", "vLLM", "模型部署", "KV cache", "术语科普"]
status: published
draft: false
published: true
source: "https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust"
---

来源：[vLLM Recipes · deepseek-ai/DeepSeek-V4.1-Flash](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust)（页面标注 Updated 2026-09-20）

> **说明**
> 本文是系列[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)的第 4 篇，面向只熟悉 vanilla transformer 的读者，把官方页面里的术语逐个拆开解释。文中所有数字、参数与命令均来自上述页面，未作独立核实。

## 一句话结论

"把上下文从 128K 提到 1M" 这件事，真正的账不在于注意力公式有多复杂，而在于**每个 token 都要留下自己的键值缓存（KV cache）**，
而这笔缓存会随上下文长度和并发数线性增长、死死钉在显存里。
有意思的是：**在这台模型上，KV 反而是相对便宜的那一项**——它把每个 token 的全局 KV 压到了 **890 字节**。
所以你做容量规划时，第一顺位是权重（511 GB），第二顺位是批大小，最后才是上下文长度。

## 先把两个阶段拆清楚：prefill 与 decode

LLM 服务不是"输入一段、输出一段"的黑盒，它内部是两个性质完全不同的阶段：

**Prefill（预填充）**：把你整段 prompt（可能是 200K token 的文档）一次性喂进去，算出所有位置的缓存。
这个阶段是**大矩阵乘法**，GPU 利用率高，但它必须先跑完全部输入，第一个字才会出来。
用户感知到的等待时间叫 **TTFT**（Time To First Token，首 token 时间）。

**Decode（解码）**：开始一个字一个字往外写。每写一个 token，就要把前面所有 token 的 KV 读一遍，
再写回一个新的 KV。这个阶段**算力用得少、显存带宽用得多**，所以是"带宽瓶颈"。

关键区别在于：**prefill 的时间主要花在算，decode 的时间主要花在搬数据。**
这就是为什么在 V4.1 上，读 prompt（8B 激活）比写答案（16B 激活）便宜——
激活参数越少，每个 token 需要搬运的权重就越少。

## KV cache 到底是什么，为什么它必须常驻

在标准注意力里，每个 token 都要算出 Query、Key、Value 三个向量。
写第 N 个 token 时，它要和前 N−1 个 token 的 Key 做点积，然后按权重去取它们的 Value。

问题来了：**前 N−1 个 token 的 Key 和 Value 不能重算**——重算一遍就是 O(N²) 的浪费。
所以工程上把它们存下来，这就是 KV cache。

它有几个特点，每一条都很烦：

1. **它是"每条请求 × 每个 token"的开销。** 100 个用户同时问 10 万 token 的长文档，
   那就是 100 × 10 万 = 一千万个 token 的缓存要同时驻留。
2. **它随上下文长度线性增长。** 上下文翻倍，缓存翻倍。
3. **它不能被换出显存而不付出代价。** 一旦换到 CPU 内存，每次 decode 都要走 PCIe 把 KV 搬回来，
   decode 阶段本来就是带宽瓶颈，搬 KV 会直接拖慢出字速度。

所以那句老话成立：**上下文长度的上限，通常是显存上限，而不是模型能力上限。**

## 但这个模型把 KV 做得非常小

这是官方页面上最容易被低估的一句话：

> KV cache 在预算中只占很小一部分。压缩 latent 在各层之间共享，并且被训练为以 FP4 存储，
> DeepSeek 把由此得到的全局 KV 定为**每 token 890 字节**，约为 V4-Flash 的四分之一；
> 按这个口径，一个完整的 1M token prompt 的全局 KV 不到 1 GB，另加每层固定的 128 token 滑动窗口。

拆开看：

- **890 字节/token**：对比一下，一个普通 BF16 模型（比如 32 层、hidden 4096）的 KV 通常是
  每层 2 × hidden × 2 字节，32 层就是几百 KB 每 token。890 字节小了两三个数量级。
- **压缩 latent 在各层之间共享**：只有第 2、8、14、20 层真正压缩自己的 KV，其余层读同一份缓存
  （第 5 篇会讲为什么可以这样）。
- **用 FP4 存储全局 KV**：这是"训练时就按这个精度训练"的设计，不是部署时临时量化。
- **1M token 的全局 KV < 1 GB**：这句话的意义是——**在 V4.1-Flash 上，"上下文"几乎不是显存问题**。

于是容量规划的顺序变了：

| 优先级 | 占显存的东西 | 大致量级 | 你能怎么动它 |
|---|---|---|---|
| 1 | 权重 | ~511 GB（含 Engram 183 GiB） | 只能换硬件、多卡切分，或把 Engram 挪到 CPU 内存 |
| 2 | 并发批大小 | 随 `--max-num-seqs` 增长 | 调参数 |
| 3 | KV cache | 每 token 890 字节 | 一般情况下不用太操心 |

官方给的例子很直观：H200（141 GB）跑 TP4 加 Engram CPU offload 后，
每卡留下 81.2 GiB 常驻权重和 **38.5 GiB KV（约 2000 万 token）**。
2000 万 token 的 KV 容量远超单条请求的可能长度——它反映的是**高并发**能力。

## 但别忘了那"固定的 128 token 滑窗"

页面里有个容易忽略的尾巴：全局 KV 之外，**每层还有固定的 128 token 滑动窗口**。
它不随上下文长度增长（永远 128），但它乘以层数（40）、乘以并发请求数，仍然是一笔固定开销。
更重要的是：它解释了为什么**上下文极长时，模型"记得住"近处、而远处靠摘要**——
远方的信息被压进了那些共享的 latent 里（第 5 篇）。

## 三个旋钮与它们的真实含义

- **`--max-model-len`**：单个请求最长能有多长（这里可以开到 1048576）。
  它决定了单条请求的 KV 上限，不影响并发数。
- **`--max-num-seqs`**：同时有多少条请求在跑。**这是 KV 总量的主要放大器**。
  高交互场景（`--max-num-seqs 128` 甚至更高）换来的是更高的 KV 占用和更平的延迟曲线。
- **`--max-num-batched-tokens`**：每个调度迭代允许处理多少 token。
  它决定 prefill 和 decode 怎么分享 GPU：往大调，prefill 吞吐上涨、decode 延迟变差；反之亦然。

调参的通用顺序是：先定 `--max-model-len`（业务需要多长），再定 `--max-num-seqs`（要服务多少并发），
最后用 `--max-num-batched-tokens` 在吞吐和延迟之间找平衡。**一次只动一个**——这是官方给的忠告。

## 当显存还是不够：把 KV 搬到 CPU 和磁盘

官方专门有一节 **KV cache offloading**：把 KV 缓存分层（GPU → CPU 内存 → 文件系统），
用的时候再换回来。验证配置是 4×H200、TP4、`--max-model-len 16384`、`--max-num-seqs 16`，
8 GiB 的 CPU 层、`blocks_per_chunk: 1`、8 个读写线程。
结果是：重启服务器后三次 CPU 层重载、三次文件系统重载全部通过，**重载后的响应与冷启动输出一致**（包括 reasoning 字段）。
五发 GSM8K 诊断得分 31/32——官方自己强调这是小样本，不是完整基准。

这也是本篇最重要的实践结论：**KV offload 是"用延迟换容量"的交易，不是免费的午餐。**
它适合长上下文、低并发的场景（比如离线文档分析），不适合追求 TTFT 的在线对话。

## 三个常见误解

**你以为：1M 上下文 = 只要显存够，就能随便开。**
实际上：还取决于 `--max-num-seqs` 和你的并发。100 条并发 × 1M token 是另一个量级的账。

**你以为：KV cache 越大越好，反正越多越能接活。**
实际上：KV 占用挤掉的是权重和运行时空间。显存不够时，vLLM 会先拒绝请求或降级，
`--gpu-memory-utilization 0.9` 就是用来给运行时留出余量的。

**你以为：decode 慢是算力不够。**
实际上：decode 基本是**显存带宽瓶颈**——每写一个字都要把权重和 KV 搬一遍。
这也解释了为什么后面的投机解码（第 10 篇）能生效：它让一次搬运服务更多 token。

## 术语卡片

| 术语 | 中文 | 一句话定义 |
|---|---|---|
| prefill | 预填充 | 一次性算完整个 prompt 的阶段，算力密集，决定 TTFT |
| decode | 解码 | 逐 token 生成的阶段，带宽密集 |
| TTFT | 首 token 时间 | 用户发出请求到收到第一个字的时间 |
| KV cache | 键值缓存 | 存下每个 token 的 Key/Value，避免二次计算，随上下文和并发线性增长 |
| sliding window | 滑动窗口 | 每层固定只回看最近 128 个 token 的注意力范围 |
| KV offloading | KV 卸载 | 把 KV 缓存分层放到 CPU 内存/磁盘，用延迟换容量 |

## 小结

1. **prefill 吃算力，decode 吃带宽**；TTFT 主要来自 prefill。
2. **KV cache 是长上下文的经典瓶颈**，但 V4.1-Flash 把它压到 890 字节/token，1M token 不到 1 GB。
3. **真正的容量瓶颈是权重（511 GB）和并发批大小**；上下文几乎是最不用担心的那一项——
   但每层 128 token 的滑窗、以及高并发下的乘法效应，仍然要计入。

下一篇：[《两级稀疏注意力：滑窗、压缩 KV latent 与 indexer》](/posts/deepseek-deploy-05-sparse-attention/)——我们钻进"为什么 KV 能这么小"的核心，
看看 1M 个 token 是怎么做到每个 token 不用互相看一遍的。

---

**系列目录**：[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)

上一篇：[《模型也会看图：ViT、aligner、图像 token 与 Encoder parallel》](/posts/deepseek-deploy-03-vision-path/)
