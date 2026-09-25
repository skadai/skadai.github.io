---
title: '它到底有多大：552B、196B、8B/16B 三个数字分别是什么'
description: '拆开 DeepSeek-V4.1-Flash 的三个核心数字：552B 主干、196B Engram 记忆、每 prompt token 激活 8B / 每 output token 激活 16B。为什么容量按总量付费、速度按激活量算账，为什么 511 GB 权重只能用 Docker 跑，以及"1M 上下文"到底要不要 1M 显存。'
pubDate: 2026-09-25T10:00:00+08:00
slug: "deepseek-deploy-01-model-overview"
category: null
tags: ["DeepSeek", "vLLM", "模型部署", "MoE", "术语科普"]
status: published
draft: false
published: true
source: "https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust"
---

来源：[vLLM Recipes · deepseek-ai/DeepSeek-V4.1-Flash](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust)（页面标注 Updated 2026-09-20）

> 前置知识：知道 transformer 是什么即可
>
> **说明**
> 本文是系列[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)的第 1 篇，面向只熟悉 vanilla transformer 的读者，把官方页面里的术语逐个拆开解释。文中所有数字、参数与命令均来自上述页面，未作独立核实。

![系列封面：以书库形态呈现的服务器、被点亮的少数专家模块，以及代表长上下文的光带](/blog/deepseek-deploy/cover.jpg)

## 一句话结论

DeepSeek-V4.1-Flash 不是一个"装满 552B 个参数的盒子"，而是一个**由几块不同用途的部件拼起来的系统**：
552B 是语言主干（backbone）的容量，196B 是外挂的词组记忆（Engram），而每生成一个 token，
真正参与计算的只有 8B（读 prompt 时）到 16B（写答案时）那么一点点。**容量按"总量"付费，速度按"激活量"算账**——
这句话是后面所有部署参数的总纲。

## 先把三个数字讲成人话

想象一家有 384 位专家的咨询公司：

- **552B（backbone 主干参数）**：公司里所有专职顾问加起来的知识量。它决定了模型"能装下多少东西"，
  主要装在显存里，是一笔固定开销。
- **196B Engram memory**：公司档案室里的一本巨型"词组小抄"，记录了几亿条常见词组搭配。
  它不参与"思考"，只在需要时被查阅——所以它可以放在 CPU 内存里，需要时再取（第 6 篇细讲）。
- **8B / 16B（激活参数）**：每处理一个 token，真正被叫进会议室的顾问人数。
  读 prompt 的每个 token 叫 8B，写答案的每个 token 叫 16B。这决定了**算力和显存带宽**的实际消耗速度。

三个数字的比值大约是 94 : 1——这就是这类模型的"省钱原理"：知识规模靠容量堆，单次计算靠稀疏化省。

## 它长什么样：一份参数清单

| 项目 | 数值 |
|---|---|
| 类型 | 视觉-语言（vision-language）MoE |
| 主干参数 | 552B |
| Engram 记忆 | 196B |
| 激活参数 | 每个 prompt token 8B，每个 output token 16B |
| 层数 / 隐藏维度 | 40 层 transformer，hidden size 5120 |
| 视觉部分 | 前置 32 层 ViT + aligner |
| 上下文长度 | 1,048,576 tokens（即 1M，靠 YaRN factor 16 从 65,536 训练窗口外推） |
| 专家路由 | 384 个专家中取 6 个，外加 1 个 shared expert |
| 权重文件大小 | 约 511 GB（476 GiB） |
| 页面给出的最小显存 | `vram_minimum_gb: 614` |

（这些数字的来源、含义和部署含义，会在这个系列的后续文章里逐个拆开。）

## 为什么"激活参数"能远小于"总参数"

两个机制在起作用，它们分别是本系列第 2 篇和第 5 篇的主题，这里先用一句话建立直觉：

1. **MoE（混合专家）**：40 层里那些原本又厚又大的前馈网络（FFN），被切成了 384 份"专家"。
   每个 token 只走其中 6 份 + 1 份所有人共用的。像公司有 384 位顾问，但每单只叫 6 位。
2. **稀疏注意力**：注意力本来要让每个 token 和前面所有 token 互看一遍；这里改成大多数时候只看
   "最近 128 个 token"的小窗口，远处信息靠压缩后的摘要（latent）来看。像读一本书时只看当前段落，
   远处的章节靠读书笔记。

## 那为什么 8B 是"读"，16B 是"写"

这是 V4.1 相对 V4 最结构性的改动：**因果编码器-解码器（causal encoder-decoder）**。
40 层被切成前 20 层"编码器"和后 20 层"解码器"，而且**解码器的全局 KV 直接从编码器最后一层的隐藏状态投影出来**，
不是一层一层重新算的。

结果就是：读 prompt（prefill）时只需要跑前半截编码器，激活 8B；写答案（decode）时两截都要参与，激活 16B。
对部署的人来说，这意味着**"输入"和"输出"的成本曲线不一样**，长输入的账要单独算。

## 部署视角：三个数字怎么变成钱

- **显存**：你得先装下 511 GB 的权重，再留出 KV cache 和运行时开销，所以页面给的起点是 614 GB
  （这是总需求乘了 1.2 的余量系数）。一张 GB200 NVL4 tray（768 GB）用 TP4 装得下；
  一台 8 卡 H200 节点（1128 GB）装得下还有余量给 KV cache。
- **速度**：激活 8B/16B 是"每次要搬多少数据"的近似，直接关系到能跑多快。这也是为什么会有投机解码（第 10 篇）
  和一堆并行与内核优化。
- **启动**：模型从磁盘到显存要走一遍完整加载，页面因此专门设了 `VLLM_ENGINE_READY_TIMEOUT_S=3600`——
  第一次启动等一小时是正常的，别急着 kill 掉它，它不是挂了。

## 三个常见误解

**你以为：552B 参数 = 需要 552B 的算力。**
实际上：算力按激活的 8B/16B 走，552B 决定了你要买多大的"仓库"（显存/内存），不决定每步多慢。

**你以为：1M 上下文 = 需要能装 1M token 的显存。**
实际上：KV cache 是压缩存储的，官方给出的全局 KV 是 **890 bytes per token**，
满打满算 1M token 的全局 KV 还不到 1 GB（另加每层固定 128 token 的滑窗）。真正占地方的是权重和并发批大小。

**你以为：官方有 pytorch 权重，`pip install vllm` 就能跑。**
实际上：这个架构不在任何 pip wheel 里，**只能用 Docker 镜像跑**（NVIDIA 用 `vllm/vllm-openai:nightly`，
AMD 用 `vllm/vllm-openai-rocm:nightly`），并且需要 vLLM 0.30.0 以上的构建。

## 术语卡片

| 术语 | 中文 | 一句话定义 |
|---|---|---|
| MoE | 混合专家 | 把 FFN 切成多份，每个 token 只激活其中少数几份 |
| backbone | 主干 | 真正负责语言计算的主体参数（此处 552B） |
| Engram memory | Engram 记忆 | 用哈希表存 n-gram 词组搭配的外挂记忆（此处 196B） |
| active parameters | 激活参数 | 单个 token 实际参与计算的参数量 |
| checkpoint | 权重文件 | 磁盘上的模型文件，约 511 GB |
| prefill / decode | 预填充 / 解码 | 读 prompt 的阶段 / 逐字写答案的阶段 |

## 小结

记住三句话，这个系列后面就都好读了：

1. **552B 是仓库，196B 是档案室，8B/16B 是每次真正干活的人手。**
2. **8B 和 16B 不一样，是因为 V4.1 把模型切成了编码器和解码器两截。**
3. **部署的第一个硬约束不是算力，是显存：先装下 511 GB，再谈调优。**

下一篇：[《384 个专家里只叫醒 6 个：MoE 与路由入门》](/posts/deepseek-deploy-02-moe-routing/)——我们钻进第一块拼图，看看"专家"到底是怎么被挑出来的。

---

**系列目录**：[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)
