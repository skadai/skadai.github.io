---
title: 'PD 分离、NIXL 与 vllm-router：prefill 和 decode 为什么分居'
description: 'prefill 吃算力、decode 吃带宽，混跑会互相踩脚。官方唯一验证过的进阶布局就是把它们物理隔离：GB200 NVL4 上每角色一台 tray、池内 TP4、KV 经 NIXL 交接、前面由 vllm-router 分发，并把并发限制在 32。还包括为什么这台模型的 KV 小到可以搬，以及开投机解码必须两个池子一起开的原因。'
pubDate: 2026-09-25T10:26:00+08:00
slug: "deepseek-deploy-12-pd-disaggregation"
category: null
tags: ["DeepSeek", "vLLM", "模型部署", "PD 分离", "术语科普"]
status: published
draft: false
published: true
source: "https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust"
---

来源：[vLLM Recipes · deepseek-ai/DeepSeek-V4.1-Flash](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust)（页面标注 Updated 2026-09-20）

> **说明**
> 本文是系列[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)的第 12 篇，面向只熟悉 vanilla transformer 的读者，把官方页面里的术语逐个拆开解释。文中所有数字、参数与命令均来自上述页面，未作独立核实。

## 一句话结论

prefill 是算力密集型（一次算一大片输入），decode 是带宽密集型（一次搬一遍权重写一个字）。
把这两种活儿塞进同一张卡，它们会互相踩脚：一个长 prompt 的 prefill 会让正在出字的对话卡顿。
**PD 分离（prefill/decode disaggregation）**的做法是干脆分成两组机器：
**1P1D = 一个 prefill 池 + 一个 decode 池**，中间用 **NIXL** 把 KV 搬过去，
最前面用 **vllm-router** 分发请求。官方在这台模型上**唯一"验证通过"的就是这套布局**——代价是多一套网络传输和路由。

## 先讲清"互相踩脚"是怎么回事

一台默认的 vLLM 服务器会把两种情况混在一个批次里跑：

- **prefill 请求**：用户刚发来一篇 20 万 token 的文档，需要一次性算完 → **吃满算力**；
- **decode 请求**：另一个用户在等流式输出，需要一个个吐字 → **吃显存带宽**。

问题是，它们共享同一块 GPU。prefill 一进来，正在 decode 的请求就得排队等——
**用户侧的感受就是"刚才还好好的，突然卡了一下"**。反过来，为了照顾 decode 的延迟，
prefill 又不敢开太猛，长 prompt 的 TTFT 就变长。

**两边的诉求天生矛盾：prefill 想要大 chunk（吞吐），decode 想要小 batch（延迟）。**
PD 分离的基本动机就是：**别在同一张卡上调解这个矛盾，直接物理隔离。**

## 官方验证过的那套 1P1D 布局

页面对这套配置的描述非常具体，逐条拆开：

> **Prefill/Decode Disaggregation** 策略是在 **GB200 NVL4** 上验证过的 **1P1D** 布局：
> 每个角色一个 tray（**4 张 GPU**），每个池子内 **TP4**，KV 通过 **NIXL** 交接，
> 前面由 **`vllm-router --vllm-pd-disaggregation`** 作为前端。

翻译成部署图：

```
                    ┌──────────────────────┐
   请求 ─────────→  │  vllm-router (前端)  │
                    └───────┬───────┬──────┘
                            │       │
              ┌─────────────▼──┐ ┌──▼─────────────┐
              │ Prefill 池     │ │ Decode 池      │
              │ 4 GPU, TP4     │ │ 4 GPU, TP4     │
              └────────┬───────┘ └───────▲────────┘
                       │   KV 经 NIXL 传输
                       └─────────────────┘
```

- **1P1D**：「1 个 Prefill + 1 个 Decode」。这是拓扑记法，和"P 池几个副本、D 池几个副本"是两件事，可以各自扩容。
- **NIXL**：NVIDIA 的传输库，负责把 prefill 阶段算出来的 KV 缓存交给 decode 池。
  **这是整套方案的技术核心**——KV 不能重算（否则白拆），只能搬。
- **vllm-router**：前置路由，带 `--vllm-pd-disaggregation` 开关。
  它知道哪些请求该先送 prefill、KV 什么时候就绪、什么时候能转给 decode。

## 为什么"搬 KV"这件事在这里可行

如果把 KV 想象成几十 GB 的庞然大物，跨机器搬它当然不现实。但这台模型的 KV 特别小：

- 全局 KV 是 **890 字节/token**（第 9 篇），**1M token 的 prompt 全局 KV 不到 1 GB**；
- 而且它本来就是压缩 + FP4 存储的。

**这是"架构设计让部署方案变得可行"的典型案例**：如果 KV 是几 GB/万 token 的量级，
PD 分离在同样的网络上根本不成立。

## 官方在这套布局上还做了三件事

> 两个池子都通过 `--kernel-config` 关闭 **FlashInfer autotune 加 JIT** 以及 **CuTeDSL warmup**，
> 跳过 **DeepGEMM warmup**（`VLLM_DEEP_GEMM_WARMUP=skip`），并把 `--max-num-seqs` 限制在 **32**。

逐条读：

1. **关掉 autotune / JIT / warmup**——这三样都发生在启动阶段（挑最优内核、编译内核、预热 GEMM）。
   页面没说原因，合理的解读是：**PD 分离部署本来就要保证两套池子以可预期的方式启动**，
   而这些机制会带来额外的启动时间和不确定性。（这是解读，不是页面结论。）
2. **`--max-num-seqs 32`**——把每个池子的并发压到 32。
   这是个"**延迟优先**"的选择：批越小，每个 token 的延迟越稳，**这是面向交互式服务的保守配置**。
3. **8 卡节点怎么办**：官方说了——"同样的布局变成**每个角色 TP8**"。
   也就是不增加池子数量，而是把每个池子内的卡数从 4 张提到 8 张。

## 一个容易被忽略的联动：投机解码要在两个池子里都跑

> 打开**投机解码**时，DSpark 会在两个池子里都运行，这样传输的 KV 保持兼容。

这句话解释了 PD 分离最重要的一条隐性要求：**两边的"模型状态"必须一致。**
如果 prefill 池跑了 DSpark 的草稿层、decode 池没跑，那么 prefill 算出来的 KV（包含了草稿头的中间状态）在 decode 池里就对不上了。
所以**要开就两边一起开**——这也是为什么第 10 篇强调基准配置里 DSpark 的开关是成对出现的。

## 三个常见误解

**你以为：PD 分离 = 部署两个模型。**
实际上：**还是同一个模型、同一份权重**，只是把它们放在不同的池子里，各干一半的活。
拆分点是"工作阶段"，不是"模型"。

**你以为：拆开一定更快。**
实际上：收益取决于你的流量形态。
**长 prompt + 高并发（比如文档分析、Agent 长上下文）收益最明显**；
如果是短输入、短输出的聊天，prefill 本来就不大，拆了反而多一套传输和路由开销。

**你以为：官方既然"验证通过"，那就是推荐配置。**
实际上：官方在基准那一段说得很清楚——"验证证据只适用于那个固定下来的基准配置，
不适用于未来任意一个 `:nightly` 镜像，也不适用于通用命令所继承的调度器限制"。
**"验证过"的意思是"这条路上有脚印"，不是"你照抄就行"。**

## 术语卡片

| 术语 | 中文 | 一句话定义 |
|---|---|---|
| prefill/decode disaggregation | PD 分离 | 把预填充和解码拆到不同机器/池子，避免互相干扰 |
| 1P1D | 1 预填充 + 1 解码 | 一个 prefill 池 + 一个 decode 池的拓扑记法 |
| NIXL | — | NVIDIA 的传输库，用于在池子之间搬 KV 缓存 |
| vllm-router | — | 前置路由组件，`--vllm-pd-disaggregation` 模式下分发请求、协调 KV 就绪 |
| `--kernel-config` | 内核配置 | 指定内核行为（这里用来关闭 autotune / JIT / warmup） |
| `VLLM_DEEP_GEMM_WARMUP=skip` | 跳过 DeepGEMM 预热 | 跳过 FP8 GEMM 库的启动预热 |
| TP4 / TP8 | 张量并行度 | 每个池子内用 4 张或 8 张卡做张量并行 |

## 小结

1. **prefill 吃算力、decode 吃带宽**，混跑会互相干扰；PD 分离用物理隔离换取两边的稳定性。
2. **NIXL 搬 KV、vllm-router 做分发**；这套布局在 GB200 NVL4 上被官方验证（每角色一台 tray、TP4、最大 32 并发）。
3. **要开投机解码就两个池子一起开**，否则传输的 KV 不兼容；8 卡节点上同样的布局变成 TP8。

下一篇（本系列最后一篇）：[《上手篇：把 V4.1-Flash 跑起来》](/posts/deepseek-deploy-13-hands-on/)——镜像、环境变量、启动命令逐参数拆解、验证 323、思考预算、调优旋钮、内核生态与硬件选型，一次收口。

---

**系列目录**：[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)

上一篇：[《并行三兄弟：TP / DP / EP(DEP)》](/posts/deepseek-deploy-11-parallelism-tp-dp-ep/)
