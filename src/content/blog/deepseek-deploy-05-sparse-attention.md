---
title: '两级稀疏注意力：滑窗、压缩 KV latent 与 indexer'
description: '1M 上下文凭什么可行：每层 128 token 滑窗看近处，压缩 KV latent 看远处，indexer 用 2048 块粗筛 + 512 精筛决定"该看哪里"。还有两个关键细节——只有第 2、8、14、20 层真正写摘要、其余 36 层共享，以及压缩 KV 为什么要用自己的一套 RoPE theta。'
pubDate: 2026-09-25T10:04:00+08:00
slug: "deepseek-deploy-05-sparse-attention"
category: null
tags: ["DeepSeek", "vLLM", "模型部署", "注意力机制", "术语科普"]
status: published
draft: false
published: true
source: "https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust"
---

来源：[vLLM Recipes · deepseek-ai/DeepSeek-V4.1-Flash](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust)（页面标注 Updated 2026-09-20）

> **说明**
> 本文是系列[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)的第 5 篇，面向只熟悉 vanilla transformer 的读者，把官方页面里的术语逐个拆开解释。文中所有数字、参数与命令均来自上述页面，未作独立核实。

## 一句话结论

标准注意力是"每个 token 和前面所有 token 都算一遍"，成本随长度平方增长。
V4.1 的做法是把它拆成**两级**：近处老老实实看一眼（128 token 滑窗），
远处不逐个看，而是看**压缩摘要**（compressed KV latent）——并且先用一个小型索引器（indexer）
在摘要里挑出最相关的少数几个，再让主干注意力只看这些。
效果好到什么程度：**1M 上下文下，每个 token 的全局 KV 只占 890 字节**（第 4 篇）。

## 先复习：注意力贵在哪

在 vanilla transformer 里，注意力的成本是 **O(N²)**：序列长度翻倍，注意力计算量翻四倍。
但真正让长上下文"不可行"的往往不是算力，而是**显存**：每个 token 都要留下 Key 和 Value，
序列一长，KV cache 就撑爆显存。

所以长上下文有两条独立的优化路线：

- **省算力**：少算一些注意力（稀疏注意力）——本模型走的就是这条。
- **省显存**：把 KV 压小（压缩 KV）——本模型也走这条，而且做到了极致。

V4.1 把两条路线合并在一个架构里，分成了"两级"。

## 第一级：每层都有的 128 token 滑窗

> 每一层都在一个 **128 token 的滑动窗口**上做注意力。

这是最朴素也最有效的一招：**每个 token 只和最近 128 个 token 精确互看。**

- 成本从 O(N²) 降到 O(N × 128)，**线性**。
- 直觉上很合理：写文章时，你决定下一个词，最依赖的往往是最近几句话的语法和语气。
- 代价也很明显：**第 1000 个 token 和第 1 个 token 之间的直接联系被切断了**。

那远处的信息怎么办？靠第二级。

## 第二级：压缩 KV latent（远处的"读书笔记"）

> 携带压缩比的层会额外加入**压缩 KV latent**，回溯到更远的位置，由学习得到的 softmax 门控做池化。

翻译成人话：**把若干个远端的 token 压成一个向量（latent）**，让注意力去看这个摘要。
这里的"压缩比（compression ratio）"就是"几个 token 压成一个"：

- 压缩比 1：基本一对一（不压缩）；
- 压缩比 2：两个 token 压成一个；
- （V4 用过 4 和 128，V4.1 精简成 1 和 2。）

两个魔鬼细节：

**细节一：只有 4 个层真正做压缩。**
> 只有第 2、8、14、20 层真正压缩自己的 KV，其余层读取这份缓存。

也就是说，40 层里只有这 4 层承担"写读书笔记"的工作，其他 36 层直接读同一份笔记。
这就是第 4 篇里"压缩 latent 在各层之间共享"的含义——**共享是 KV 能小到 890 字节/token 的核心原因**。

**细节二：softmax 门控不是简单平均。**
"池化"不是把两个 token 的向量加一加除二，而是由一个**学习得到的 softmax 门控**来决定
"这两个 token 各贡献多少"。哪些信息该被保留进摘要，是模型训练时学出来的。

## indexer：在摘要里做"预筛选"

有了压缩摘要之后，还有第二个问题：**摘要也很多**。1M token 的上下文，即使压到 1/2，
也还有 50 万份。每层都让主干注意力把 50 万份摘要算一遍，就等于没优化。

于是有了 **indexer（索引器）**：

> 一个小的**侧注意力**——即 indexer，继承自 V3.2-Exp——为这些 latent 打分，
> 每条 query 保留最好的 **512** 个，并先经过一个候选阶段预筛（选出 **2048** 个大小为 **8** 的块）。

拆开看这条流水线（数字就是上面的）：

1. 对每条 query，分别在 2048 个"大小为 8 的块"上打分——这一步是**粗筛**，便宜；
2. 选出的候选里，再精细打分，只保留**最好的 512 个** latent；
3. 主干注意力只在这 512 个 + 最近 128 个滑窗 token 上做真正的注意力。

打个比方：你在 50 万页的资料里找答案，不会逐页精读。
你先看书目（用便宜的分数粗筛出 2048 个章节），再从那里面挑出最相关的 512 页（精筛），
最后只精读这 512 页——而最近几页你本来就一直摊在桌上（滑窗）。

注意"indexer 继承自 V3.2-Exp"这句话的分量：**这不是 V4.1 的新发明，而是被验证过的成熟部件。**
在工程上，这意味着它已经在内核、并行、量化等各个层面被适配过。

## 一处容易踩的细节：压缩 KV 有自己的 RoPE theta

> 压缩 KV 使用它自己的 RoPE theta（160,000）做旋转，因为一个 latent 代表多个 token，
> 所以它的位置彼此间隔比原始流更大。

RoPE（旋转位置编码）是告诉模型"谁在谁前面"的机制（第 8 篇细讲）。
压缩 latent 代表的是**一段** token 而不是一个 token，所以它标记的位置天然更"稀疏"。
用和原文流相同的 theta 会让位置关系失真，因此压缩 KV 单独用 160,000 的 theta。
**一句话：不同的时间刻度，要用不同的尺子。**

## 部署视角：这些设计影响你哪些参数

- **`--max-model-len`**：可以真的开到 1048576，因为 KV 和算力都被压到了可承受范围。
- **`--max-num-batched-tokens`**：稀疏注意力让长 prompt 的 prefill 变得可行，
  但 prefill 依然是算力密集的，这个参数控制它和 decode 怎么分 GPU。
- **AMD/Blackwell 的专属设置**：页面上出现的 `FLASHINFER_MLA_SPARSE_DSV41`、
  `FLASHMLA_MEGA_ATTN_DSV41`、`indexer_kv_dtype: mxfp4`、
  `indexer_sparse_logits: true`——这些都是在**为这套稀疏注意力选内核**（第 13 篇）。
  注意 `indexer_kv_dtype` 是 mxfp4：**连索引器自己的 KV 也是 4 bit 的**。
- **AMD 上的限制**：ROCm 的稀疏 SWA 后端只支持 uniform-batch 的 CUDA graph，
  所以 AMD 命令需 `VLLM_USE_BREAKABLE_CUDAGRAPH=1`；MI325X 更狠，
  piecewise 图捕获会段错误，只能捕获完整 decode 图、prefill 走 eager（第 13 篇）。

## 三个常见误解

**你以为：稀疏注意力 = 丢信息、效果一定变差。**
实际上：省掉的注意力是"模型自己学出来不重要"的那些位置，而且粗筛+精筛保留了 512 个最相关的。
效果好不好最终要看评测，但这套机制不是粗暴截断。

**你以为：压缩 KV 就是有损压缩，像 JPEG 一样掉画质。**
实际上：模型是**带着这套压缩训练出来的**——它知道远处的信息会以摘要形式存在，
所以会把该保留的写进摘要。这是"训练时就接受压缩"，不是"部署时才压"。

**你以为：indexer 是每个 token 都跑一遍的重活。**
实际上：它被刻意做得又小又便宜（侧注意力 + 分块粗筛），
因为它的唯一任务是"决定后面该看哪里"，不是生成内容。

## 术语卡片

| 术语 | 中文 | 一句话定义 |
|---|---|---|
| sliding-window attention | 滑动窗口注意力 | 每层只精确回看最近 128 个 token |
| compressed KV latents | 压缩 KV 潜变量 | 把多个远端 token 压成一个向量，供注意力读取 |
| compression ratio | 压缩比 | 几个 token 压成一个 latent（V4.1 用 1 和 2） |
| indexer | 索引器 | 小型侧注意力，为每条 query 从 latent 中挑出最相关的 512 个 |
| softmax gate | softmax 门控 | 学习得到的权重，决定压缩时各 token 贡献多少 |
| RoPE theta | 旋转位置编码底数 | 控制位置编码的"时间刻度"，压缩 KV 用 160,000 |

## 小结

1. **两级结构**：近处 128 token 精确看，远处看压缩摘要。
2. **只有第 2、8、14、20 层写摘要，其余 36 层共享**——这是 KV 小到 890 字节/token 的关键。
3. **indexer 决定"该看哪里"**：2048 块粗筛 → 512 个精筛 → 主干注意力只看这些，
   而这一切都是 vLLM 用不同内核实现出来的（GPU 架构不同，可选内核不同）。

下一篇：[《Engram：给模型配一本 384M 行的词组小抄》](/posts/deepseek-deploy-06-engram/)——我们去看那 196B 参数、
可以放进 CPU 内存的"外挂记忆"到底是什么。

---

**系列目录**：[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)

上一篇：[《注意力与 KV cache：为什么「长上下文」本质是显存问题》](/posts/deepseek-deploy-04-attention-kv-cache/)
