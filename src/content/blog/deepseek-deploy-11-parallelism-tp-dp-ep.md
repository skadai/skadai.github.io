---
title: '并行三兄弟：TP / DP / EP(DEP)'
description: '一张卡装不下 511 GB 时必须切，但切法有三种：TP 切层内权重（每层都要通信）、DP 复制模型切数据（不省显存）、EP 把专家分卡（all-to-all）。对比 H200 / MI355X / MI325X / Blackwell 的默认配置，看同一份模型为什么在不同卡上得出完全不同的答案，以及 DEP 一次性打开了哪四样东西。'
pubDate: 2026-09-25T10:25:00+08:00
slug: "deepseek-deploy-11-parallelism-tp-dp-ep"
category: null
tags: ["DeepSeek", "vLLM", "模型部署", "并行", "术语科普"]
status: published
draft: false
published: true
source: "https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust"
---

来源：[vLLM Recipes · deepseek-ai/DeepSeek-V4.1-Flash](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust)（页面标注 Updated 2026-09-20）

> **说明**
> 本文是系列[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)的第 11 篇，面向只熟悉 vanilla transformer 的读者，把官方页面里的术语逐个拆开解释。文中所有数字、参数与命令均来自上述页面，未作独立核实。

## 一句话结论

一张卡装不下 511 GB，所以必须切——但"切"有三种完全不同的切法：
**TP 切每一层的权重**（每层都要跨卡通信）、**DP 复制整个模型、切数据**（不解决装不下的问题）、
**EP 把专家分给不同的卡**（MoE 专用，用 all-to-all 通信换容量）。
**DEP = 数据并行 + 专家并行**，是 Blackwell 上官方推荐的做法。
选哪种，本质上是在"显存够不够"和"通信贵不贵"之间做交易——**所以同一份模型在不同卡上的默认配置完全不同**。

## 三种切法，三张图

```
TP（Tensor Parallel）：把每一层的权重切开，多卡合算一层
  卡0: [W 的前半]   卡1: [W 的后半]     ← 每层算完要 all-reduce 汇总，通信频繁

DP（Data Parallel）：每张卡都放一整套模型，各算各的数据
  卡0: [完整模型] 数据A    卡1: [完整模型] 数据B     ← 显存没有省，吞吐翻倍

EP（Expert Parallel）：把 384 个专家分给不同的卡
  卡0: [专家 1-96]   卡1: [专家 97-192] ...   ← token 要 all-to-all 送到专家所在的卡

DEP（Data + Expert Parallel）：数据并行 + 专家并行拼起来
```

**一句话记住三者的区别：TP 切"层内"，DP 切"数据"，EP 切"专家"。**

## 为什么不能只用 DP：参数量就是答案

DP 听上去最省心——每张卡一份模型，不涉及复杂的通信模式。但它有个致命问题：
**每张卡都要装下整个 511 GB 的权重**。单卡 141 GB（H200）或者 288 GiB（MI355X）都装不下，
所以 DP 单独用是不可能的；**必须先用 TP/EP 把权重摊开。**

而 TP 的代价就写在图里：**每一层算完都要跨卡汇总一次**。层数越多、TP 越大，通信次数越多，
对卡间互连（NVLink / 节点内带宽）的要求越高。这就是为什么 **TP 基本只在节点内做**，
而官方的 PD 分离布局在 8 卡节点上从 TP4 变成 **TP8**（第 12 篇）——**它用的是同一台机器里的卡**。

**TP 不是越大越好**：TP 越大，单卡权重越少（好事），但通信越多（坏事）。
这个平衡点由"卡有多大"和"互连有多快"共同决定——所以各平台的默认值不一样。

顺带回顾第 3 篇的一个特例：**视觉编码器（ViT）反而不做 TP，而做数据并行**。
因为它只有 32 层、hidden 1024，小到"TP 的通信成本比它省下的计算还多"。
**同样的取舍逻辑，在 ViT 上的答案是 DP，在主干上的答案是 TP。**

## 各平台默认配置一览（官方页面整理）

| 平台 | 默认方案 | 关键数字 |
|---|---|---|
| **H200**（141 GB） | **TP4** + Engram CPU offload | 每卡 23.6 GiB 挪到主机内存，留下 **81.2 GiB 常驻权重 + 38.5 GiB KV**（约 2000 万 token）；这个规模不需要调度器上限 |
| **MI355X**（288 GiB） | **TP2** + Engram CPU offload | Engram 表 TP4 时每卡 **47.2 GiB**、TP2 时 **94.4 GiB**；TP2 时卡上放不下，所以搬到 pinned host memory。**TP2 让每台服务器 GPU 数减半，于是每节点服务器数翻倍** |
| **MI355X 若用 TP4** | 显存够 → 让 Engram 常驻 | 传 `--tensor-parallel-size 4` 与 `--engram-config '{"cpu_offload":false}'` |
| **MI325X**（256 GB） | **TP4** + Engram CPU offload | TP4 每卡约 81 GiB 常驻权重，TP2 约 145 GiB；TP2 装得下，但**KV 池是全部方案里最小的**（所以默认不用） |
| **Blackwell**（B200/B300/GB200/GB300） | **TP2** + Engram offload，或 **DEP** | DEP 用满硬件 GPU 数：**GB200/GB300 tray 上 DEP4，B200/B300 节点上 DEP8** |

## DEP 到底开了什么

官方对 Blackwell 的 DEP 配置列得很清楚，它一次性打开四样东西：

- `--enable-expert-parallel`：**把专家分到不同的卡上**（这是 DEP 的本体）；
- `FLASHMLA_MEGA_ATTN_DSV41`：为稀疏注意力准备的专用内核（第 5 篇的机制，第 13 篇讲内核）；
- `--kernel-config '{"moe_backend":"deep_gemm_mega_moe"}'`：指定 MoE 的计算后端；
- `--engram-config '{"embedding_across_dp":true}'`：**Engram 的查表跨数据并行组进行**——
  因为专家已经分卡了，Engram 也得跟着跨卡对齐，否则每个 DP 副本都会重复查一遍同一张表。

它还统一设置了这些（TP2 和 DEP 两种配置都设）：
`indexer_kv_dtype: mxfp4`、`indexer_sparse_logits: true`、`--kv-cache-dtype fp8`、`--max-num-seqs 128`，
推理统一用 `--reasoning-parser deepseek_v41`。

**注意最后那句关于尺寸的话**：官方说 TP2 下"调度器限制与工作负载相关"，
所以要按自己的服务画像去定 `--max-num-batched-tokens` 和 `--max-cudagraph-capture-size`；
而**要追求高交互性（低延迟），就用 `--tensor-parallel-size 4`**——
卡多了通信多，但每张卡要扛的 KV 和批更少，延迟更稳。这就是同一套硬件的两种服务取向。

## 三个常见误解

**你以为：TP 越大，速度越快。**
实际上：TP 越大，单卡显存压力越小（能开更长上下文、更大批），但**每层通信次数不变而数据量变化**，
延迟未必更低。官方在 Blackwell 上的建议是"高交互性用 TP4"，
它在 MI355X 上却默认 TP2——**因为 TP2 能换到"每节点两倍的服务器数"，这是吞吐/成本取向**。

**你以为：并行方案可以随便挑。**
实际上：**显存决定下限**。H200 上不 offload Engram 就装不下 TP4；MI325X 上 TP2 能装但 KV 太小；
MI355X 上 TP4 直接就能让 Engram 常驻。顺序永远是：先看卡，再看互连，再看服务取向。

**你以为：EP 是"多卡版的 DP"。**
实际上：EP 的通信是 **all-to-all**（token 要送到它选中的专家所在的卡），
和 TP 的 all-reduce 是两种完全不同的模式。这也是为什么 DEP 必须同时指定 MoE 后端和 Engram 的跨 DP 行为——
**专家分卡之后，参数的"归属"变了，配套的东西都得跟着改。**

## 术语卡片

| 术语 | 中文 | 一句话定义 |
|---|---|---|
| TP | 张量并行 | 把每层权重切开、多卡合算一层，每层需跨卡汇总 |
| DP | 数据并行 | 每卡一份完整模型、各算各的数据；不解决显存不足 |
| EP | 专家并行 | 把 MoE 的专家分到不同卡上，token 通过 all-to-all 送达 |
| DEP | 数据 + 专家并行 | DP 与 EP 的组合，Blackwell 上按 GPU 数取 DEP4 / DEP8 |
| all-reduce / all-to-all | — | 两种典型的集合通信：前者汇总结果，后者把数据分发到不同卡 |
| `--enable-expert-parallel` | 专家并行开关 | 打开 EP（DEP 配置的基础） |
| `--engram-config` | Engram 配置 | 控制 Engram 表的 offload 与跨 DP 行为 |

## 小结

1. **TP 切层内、DP 切数据、EP 切专家**；装不下 511 GB 必须靠 TP 或 EP，DP 单独救不了。
2. **各平台默认值不同**，因为取舍点不同：H200 TP4、MI355X TP2、MI325X TP4、Blackwell TP2 或 DEP4/DEP8。
3. **DEP 不只是"多开一个开关"**：专家分卡后，内核、Engram 跨 DP 行为、调度上限都要一起改。

下一篇：[《PD 分离、NIXL 与 vllm-router：prefill 和 decode 为什么分居》](/posts/deepseek-deploy-12-pd-disaggregation/)——官方唯一"验证通过"的那套黑科技布局。

---

**系列目录**：[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)

上一篇：[《猜 5 个再验一遍：投机解码与 DSpark 草稿头》](/posts/deepseek-deploy-10-speculative-decoding/)
