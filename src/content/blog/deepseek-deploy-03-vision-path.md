---
title: '模型也会看图：ViT、aligner、图像 token 与 Encoder parallel'
description: '一张图片如何从像素变成向量、再插进文本序列：32 层 ViT、patch 14、3× 下采样 aligner、每图 1024 token 上限。顺带讲清两个互斥的部署开关（--language-model-only 与 Encoder parallel），以及为什么验证服务时必须发一条图片请求。'
pubDate: 2026-09-25T10:02:00+08:00
slug: "deepseek-deploy-03-vision-path"
category: null
tags: ["DeepSeek", "vLLM", "模型部署", "多模态", "术语科普"]
status: published
draft: false
published: true
source: "https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust"
---

来源：[vLLM Recipes · deepseek-ai/DeepSeek-V4.1-Flash](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust)（页面标注 Updated 2026-09-20）

> **说明**
> 本文是系列[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)的第 3 篇，面向只熟悉 vanilla transformer 的读者，把官方页面里的术语逐个拆开解释。文中所有数字、参数与命令均来自上述页面，未作独立核实。

## 一句话结论

"视觉-语言模型"不是给模型开了一只新眼睛，而是**把图片先翻译成一段和文字同构的向量序列，再喂给同一个语言模型**。
图片和文字的区别，只在"翻译器"不同：图片走的是一台 32 层 ViT + 一个 aligner，文字走的是 embedding 查表。
理解了这条流水线，你就理解了部署时两个关键开关（`--language-model-only` 和 Encoder parallel）为什么存在、
以及为什么**只发文本请求的验证是不完整的**。

## 一张图片的旅行：从像素到 token

**第 1 站：切块（patch）。** ViT 不会一个像素一个像素看，而是把图切成 14×14 像素的小方块（patch 14），
每块当作一个"字"。这就像把一张照片拆成马赛克格子，每格一个编号。

**第 2 站：ViT 编码。** 32 层 ViT（hidden size 1024）把这些图块编码成一串向量。
它的结构和文本侧的 transformer 一样，只是维度小得多（1024 对 5120）。

**第 3 站：aligner 压缩。** 一个带 **3× 下采样**的 aligner 把图块向量合并、降采样，
把数量压到原来的约 1/9，同时对维度做对齐——毕竟要给 5120 维的文本模型用。

**第 4 站：进入文本模型。** 压缩后的向量以 `inputs_embeds` 的形式插入到文本序列中，
和文字 token 的向量排在一起，从此不再区分。

## 图片在 prompt 里长什么样

图片在 prompt 中占一段特殊区间，用 `<|deepseek_image|>` 标记：

```
<|deepseek_image|> ... 图片占位 ... <|deepseek_image|>
```

细节是这样的：**span 里的每一个位置都携带 image token id**，而每个位置的角色
（start / newline / end / image）由 processor 提供。也就是说，
一段图片在序列里被铺成"多行多列"的网格：有起点、有换行、有终点、有普通图块位。
模型通过这些角色标记，知道"这些向量属于同一张图、彼此的行列关系是什么"。

三个具体规格：

| 规格 | 数值 |
|---|---|
| 每张图最多占多少 token | 1024 |
| 最小像素 | 295,936 像素（≈ 544 × 544） |
| 每张提示的图片数量 | **不限**（页面上明确写了 no limit on images per prompt） |

（按 patch 14 加 3× 下采样推算，一个视觉 token 大致对应 42×42 像素的图块；
1024 token 的上限大致相当于千像素级的大图。这里关注结论就够：**单图信息量有上限，图片张数没有上限**。）

## 一个容易被忽略的细节：向量进去了，id 也留着

页面上这句话值得单独拿出来讲：

> 合并后的 embedding 以 `inputs_embeds` 进入文本模型，位置在超连接流展开**之前**；
> 同时原始 token id 仍然继续流动，这样路由器才能应用图像路由偏置。

为什么？回忆第 2 篇：图像 token 有一套专属的路由偏置。
路由发生在文本模型的每一层里，它需要知道"我现在处理的是不是图片位置"。
可是经过 aligner 之后，向量已经变成了普通浮点数，看不出身世。所以设计上**让两路信息并行流动**：
一路是给模型算的向量，另一路是给路由器看的身份标签。
这就是"架构上多留了一根线"的典型例子——工程上多花的成本，换来路由行为可控。

## 部署开关：两个勾选框，三种现实

官方页面给了两个互斥的选项，必须理解它们的区别：

**`--language-model-only`（页面上的 "Text only"）——把视觉通路整个拆掉。**
如果你的业务全是文本，勾上它，ViT 和 aligner 就不加载了，省下的显存直接给 KV cache 用。
注意：**官方在 GB200 上验证通过的两套配置（TP4 与 1P1D）都是 text-only 的**，
如果你要复现官方基准，就得接受纯文本。

**`--mm-encoder-tp-mode data`（页面上的 "Encoder parallel"）——把视觉编码器改成数据并行。**
默认情况下，视觉编码器会和语言模型一样做张量并行（TP）：把每一层的权重切开、多卡协作算一层。
但对 ViT 来说这**不划算**：它只有 32 层、hidden 1024，本身很小，而 TP 每层都要跨卡通信，
通信开销可能比省下的计算还多。改成数据并行（每张卡独立处理不同的图片）后，
**多图请求的 TTFT（首次响应时间）可以显著下降**。

一句话总结这两个开关的取舍：

- 全文本 → 拆掉视觉（`--language-model-only`）；
- 有图片、且经常一次发多张 → 让视觉编码器数据并行（`--mm-encoder-tp-mode data`）；
- 两者**互斥**，不能同时开。

## 部署提醒：验证必须发一条图片请求

官方页面在 "Verifying" 一节明确提醒：视觉塔是一条**独立的执行路径**。
你先发一条纯文本请求（正确答案是 `323`）确认服务活着，但那只验证了语言部分；
**必须再发一条带图请求**，否则你并不知道 ViT 和 aligner 那条路是否正常——
而它恰恰是最容易因为镜像版本、内核支持、显存碎片出问题的地方。

## 三个常见误解

**你以为：图片会先被"总结成一段文字"，再交给语言模型。**
实际上：图片从不经过文字。它被编成一串向量，直接和文字向量拼接在同一个序列里。

**你以为：图片数量不受限，所以显存也不受限。**
实际上：不限张数 = 不限"span 个数"；但每张图最多 1024 个 token，张数一多，
上下文会被图片迅速吃掉，而且 ViT 的计算量线性增长。（是的，1M 上下文是给这种情况用的。）

**你以为：既然只做文本，视觉参数不激活就不占显存。**
实际上：不激活 ≠ 不加载。默认情况下 ViT 权重依然会被加载进显存；
只有显式加 `--language-model-only` 才会真正跳过它。

## 术语卡片

| 术语 | 中文 | 一句话定义 |
|---|---|---|
| ViT | 视觉 Transformer | 把图片切块后当作序列编码的 transformer（此处 32 层、hidden 1024） |
| patch | 图块 | 图片被切成的 14×14 像素小块，相当于视觉的"字" |
| aligner | 对齐器 | 把视觉向量压缩（3× 下采样）并对齐到文本维度的模块 |
| `<\|deepseek_image\|>` span | 图像区间 | prompt 中标记图片占位的区间，内部每个位置都有角色（start/newline/end/image） |
| `inputs_embeds` | 输入嵌入 | 直接把向量喂给模型的入口，图片就是这样进入文本模型的 |
| TTFT | 首 token 时间 | Time To First Token，从发出请求到收到第一个字的时间 |
| Encoder parallel | 编码器并行 | 让视觉编码器做数据并行而非张量并行 |

## 小结

1. **图片 = 被翻译成向量的序列**，走的是一条独立于文本的执行路径。
2. **单图最多 1024 token，张数不限**；向量和 token id 两条线并行流动，后者专供路由使用。
3. **两个开关互斥**：`--language-model-only` 拆掉视觉，Encoder parallel 让视觉变数据并行；
   验证服务时**一定要发一条带图的请求**。

下一篇：[《注意力与 KV cache：为什么"长上下文"本质是显存问题》](/posts/deepseek-deploy-04-attention-kv-cache/)——从这里开始，我们进入这个系列的重头戏。

---

**系列目录**：[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)

上一篇：[《384 个专家里只叫醒 6 个：MoE 与路由入门》](/posts/deepseek-deploy-02-moe-routing/)
