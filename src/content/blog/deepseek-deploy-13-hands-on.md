---
title: '上手篇：把 V4.1-Flash 跑起来'
description: '从零到发出第一个请求的完整清单：镜像只能选 nightly、环境变量照抄哪几行、启动参数逐条拆解、验证为什么必须发两条请求（正确答案 323）、thinking 默认开着会把小 max_tokens 的请求变成空回复、四个性能旋钮、内核生态速查（FlashInfer/CuTeDSL/DeepGEMM/AITER/MFMA/gfx942/gfx950/CUDA graph/torch.compile）、硬件选型与 KV cache offloading。'
pubDate: 2026-09-25T10:27:00+08:00
slug: "deepseek-deploy-13-hands-on"
category: null
tags: ["DeepSeek", "vLLM", "模型部署", "上手指南", "术语科普"]
status: published
draft: false
published: true
source: "https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust"
---

来源：[vLLM Recipes · deepseek-ai/DeepSeek-V4.1-Flash](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust)（页面标注 Updated 2026-09-20）

> **说明**
> 本文是系列[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)的第 13 篇，面向只熟悉 vanilla transformer 的读者，把官方页面里的术语逐个拆开解释。文中所有数字、参数与命令均来自上述页面，未作独立核实。

## 一句话结论

前面十二篇讲的是"为什么"，这篇讲"怎么做"：**选镜像 → 设环境变量 → 启动 → 验证 → 调参**。
全程只能在 Docker 里跑（没有 pip wheel），第一次启动会慢到你以为它挂了（超时设了 3600 秒），
而且**有两个会让人误判"模型坏了"的坑**：thinking 默认开着（effort 50），以及只发文本请求验证不完整。
下面每一步都对应官方页面上的原文。

## 第 0 步：镜像——没有 pip wheel，只有 nightly

> 官方原文：*没有任何 pip wheel 能服务这个架构，所以 Install 区块只提供 Docker。*

| 平台 | 镜像 | 备注 |
|---|---|---|
| NVIDIA | `vllm/vllm-openai:nightly` | 架构经 [PR #56228](https://github.com/vllm-project/vllm/pull/56228) 合入 `main`，**2026-09-10 之后的任何 nightly 都能跑**；发布当天的 `deepseekv41-flash-0909` 标签已不需要 |
| AMD | `vllm/vllm-openai-rocm:nightly` | 还包含 [PR #56503](https://github.com/vllm-project/vllm/pull/56503)——把 mHC 的 delayed pre block 从 eager Torch 移到 AITER，**晚于 0909 标签**（第 7 篇） |

要求 vLLM **0.30.0+**。AMD 上还有一个容易忽略的开关：生成的命令会设 `VLLM_USE_BREAKABLE_CUDAGRAPH=1`，
因为**这个模型不支持 `torch.compile`**，而 ROCm 的稀疏 SWA 后端**只支持 uniform-batch 的 CUDA graph**；
没有 breakable CUDA graph，默认的 `FULL_AND_PIECEWISE` 会在图捕获阶段直接崩掉。

## 第 1 步：环境变量（照抄这一段）

```bash
# 通用
export VLLM_ENGINE_READY_TIMEOUT_S=3600   # 首次加载很久，官方为此设置

# AMD 额外（官方基准命令里的那一组）
export VLLM_ROCM_USE_AITER=1 VLLM_ROCM_USE_AITER_MOE=1
export AITER_TRITON_LOG_LEVEL=ERROR       # 去掉 gfx950 上刷屏的 "Gluon unavailable" 警告
export VLLM_USE_BREAKABLE_CUDAGRAPH=1     # 见上文：不支持 torch.compile 的必然要求
export OMP_NUM_THREADS=1 PYTHONUNBUFFERED=1
```

**为什么要单独说 `VLLM_ENGINE_READY_TIMEOUT_S`**：511 GB 权重从磁盘搬进显存，
加上内核编译/预热，第一次启动等很久是正常的。**如果你用的是默认超时，容器会在加载完成前被判超时而重启**，
于是你看到的现象是"反复重启、永远起不来"——**这不是模型坏了，是超时太短。**

另外：**Rust OpenAI frontend 是默认选项**，官方建议遇到不支持的功能或兼容性问题时切回 Python。
基准命令里用 `VLLM_USE_RUST_FRONTEND=1` 显式打开。

## 第 2 步：启动命令，逐参数拆解

AMD MI355X 基准服务器的核心启动参数（完整版见系列附录的全译）：

| 参数 | 含义 | 为什么是这个值 |
|---|---|---|
| `--tensor-parallel-size 4` | 张量并行 4 卡 | MI355X 基准配置（第 11 篇；默认其实是 TP2 + Engram offload） |
| `--language-model-only` | 纯文本模式 | 跳过 ViT 和 aligner，显存让给 KV（第 3 篇） |
| `--tokenizer-mode deepseek_v41` | 分词器模式 | 这个架构专用；基础参数里就带着 |
| `--tool-call-parser deepseek_v41 --enable-auto-tool-choice` | 工具调用 | 打开工具调用解析 |
| `--reasoning-parser deepseek_v41` | 推理内容解析 | 把 thinking 轨迹和正文分开 |
| `--moe-backend aiter` | MoE 后端 | **只给名字**，让 vLLM 自选 Composable Kernel 的 a8w4 专家；写死 `aiter_triton_mxfp4_bf16` 会把 Triton 内核钉住 |
| `--gpu-memory-utilization 0.9` | 显存利用率 | 给运行时留 10% 余量 |
| `--speculative-config "$SPEC_CONFIG"` | 投机解码 | DSpark，5 token 块（第 10 篇） |
| `--max-model-len 1048576` | 上下文上限 | 开到顶（第 8 篇） |
| `--max-num-seqs 128` | 并发上限 | 见下一节 |
| `--max-cudagraph-capture-size 1024` | 图捕获上限 | `128 × (1+5) = 768` 向上取整（第 10 篇） |
| `--max-num-batched-tokens 16384` | 每轮 token 预算 | prefill 吞吐与 decode 延迟的平衡点 |
| `--disable-uvicorn-access-log` | 关访问日志 | 压测时减少噪声 |

**两个 AMD 专属的坑：**

1. **别把 MoE 内核写死。** 命名 `aiter_triton_mxfp4_bf16` 会把 Triton 的 W4A16 `_moe_gemm_a16w4` 钉死；
   只写 `aiter` 才让 vLLM 去挑 Composable Kernel 的 a8w4 专家（也就是 MI355X 基准里用的那个）。
2. **ROCm 还需要 `--no-swa-bounded-replay`**（由共享的 AMD override 提供）。

## 第 3 步：验证——两条请求，缺一不可

```bash
curl http://localhost:8000/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"deepseek-ai/DeepSeek-V4.1-Flash",
       "messages":[{"role":"user","content":"What is 17*19? Return only the integer."}]}'
```

**正确答案是 `323`。** 然后**再发一条带图片的请求**——视觉塔是独立执行路径，
只发文本的冒烟测试根本覆盖不到它（第 3 篇）。

## 第 4 步：思考预算与工具调用（最容易误判的一段）

这台模型有两个 thinking 模式和一个**数值型推理预算**，通过 `chat_template_kwargs` 传：

| key | 取值 |
|---|---|
| `thinking` / `enable_thinking` | 布尔值；两个都传时必须一致 |
| `reasoning_effort` | `low`(25)、`high`(50)、`xhigh`(75)、`max`(100)，**或 1–100 的整数** |

三个必须记住的细节：

- **两个 key 都不设时，thinking 是开启的，且 effort 为 50**——也就是"什么都不配"反而最啰嗦。
  后果很具体：一个 `max_tokens` 很小的请求会把预算全花在推理轨迹上，
  返回**空的 `content` 和 `finish_reason=length`**。**这看起来像模型坏了，其实不是。**
  要么显式设 `thinking: false`，要么给足预算。
- **`"minimal"` 和 `"medium"` 会被拒绝**——它们不属于这个模型的取值集合；顶层的 `"none"` 表示关闭。
  在 thinking 模式下，预算会以 `Reasoning Effort: N` 前缀渲染进 prompt，**只在第一轮出现**。
- **API 和开源侧的档位映射不一样**：DeepSeek API 把 `low`/`high`/`max` 映射到 50/75/100，
  而 vLLM 把 `low`/`high`/`xhigh`/`max` 映射到 25/50/75/100。
  **在 API 上按 `high` 调好的请求，在这里跑的是 effort 50**；要严格对齐就传整数。

调参的性价比：官方公布的评测用的是 `temperature=1.0`、`top_p=0.95`、effort 100、`max_tokens` 至少 256K；
而技术报告指出 **effort 60–80 就能以不到一半的 token 拿回大部分准确率**——**`max` 留给硬任务**。
工具调用则包在 **DSML 标签块**里（不是 JSON 代码块），工具返回结果在 `<tool_result>` 标签中。

## 第 5 步：四个性能旋钮（一次只动一个）

| 旋钮 | 往大调 | 往小调 |
|---|---|---|
| `--max-num-seqs` | 并发上限高，吞吐上升 | 批小了延迟更稳、显存更省 |
| `--max-num-batched-tokens` | prefill 吞吐上升 | decode 延迟更稳 |
| `--max-cudagraph-capture-size` | 覆盖更大的 decode 批（含草稿 token） | 省图显存和启动时间 |
| `--max-model-len` | 支持更长的请求 | 调度的 KV 预留更小，能承载更多并发 |

官方的建议就一句：**从默认值开始，一次只调一个。**

## 内核生态速查：那一串名字到底是什么

| 名字 | 是什么 | 在本模型的角色 |
|---|---|---|
| FlashInfer | 高性能注意力内核库（含 autotune/JIT） | PD 分离时被 `--kernel-config` 关闭 |
| CuTeDSL | CUTLASS 的 Python DSL 编译路径 | warmup 在 PD 分离布局里被关掉 |
| DeepGEMM | DeepSeek 的 FP8 GEMM 库 | `VLLM_DEEP_GEMM_WARMUP=skip` 可跳过其预热 |
| AITER | AMD 的 AI 内核库 | `--moe-backend aiter`、`VLLM_ROCM_USE_AITER=1` |
| MFMA | AMD GPU 的矩阵乘加指令 | **gfx942 没有 FP4 MFMA** → MXFP4 专家只能走 Triton |
| gfx942 / gfx950 | AMD GPU 架构代号 | MI325X 是 gfx942（piecewise 图捕获会段错误，只能捕获 FULL_DECODE_ONLY）；MI355X 是 gfx950 |
| CUDA graph / piecewise | 把 kernel 序列固化成图以省启动开销 | 本模型只能走 uniform-batch 图，AMD 需 breakable CUDA graph |
| `FLASHINFER_MLA_SPARSE_DSV41` / `FLASHMLA_MEGA_ATTN_DSV41` | 稀疏注意力专用内核开关 | Blackwell 上按方案二选一 |
| `deep_gemm_mega_moe` | MoE 计算后端 | Blackwell DEP 配置指定它 |
| `torch.compile` | PyTorch 编译加速 | **本模型不支持** |

## 硬件选型速查

| 你的卡 | 官方默认 | 一句话理由 |
|---|---|---|
| 8×H200（1128 GB） | TP4 + Engram CPU offload | 每卡留 38.5 GiB KV，约 2000 万 token，不需要调度上限 |
| 4×MI355X（288 GiB） | TP2 + Engram offload（TP4 时可让 Engram 常驻） | 288 GiB 上 TP2 放不下 Engram 表 |
| 4×MI325X（256 GB） | TP4 + Engram offload | TP2 装得下但 KV 池最小 |
| GB200 NVL4 tray（768 GB） | TP4，或 1P1D（PD 分离） | 官方验证过的两套布局；**PD 分离那套是纯文本的** |
| B200/B300/GB200/GB300 | TP2 + Engram offload，或 DEP4/DEP8 | 追求高交互性改用 TP4 |

**注意最后一行里那句"PD 分离那套是纯文本的"**：官方验证过的 GB200 运行（TP4 和 1P1D）都开了
`--language-model-only`。也就是说，**你要复现官方基准，就得接受纯文本**；
要用视觉能力，那些数字就不能照抄。

## KV cache offloading：什么时候值得一试

需要包含 [PR #57145](https://github.com/vllm-project/vllm/pull/57145) 的构建。官方验证的配置是
4×H200、TP4、Python frontend、`--enforce-eager`、`--max-model-len 16384`、`--max-num-seqs 16`、
`--max-num-batched-tokens 8192`（DeepSeek 侧用 `--gpu-memory-utilization 0.95`），
并把 KV 分层到 **8 GiB 的 CPU 层 + 文件系统**（`blocks_per_chunk: 1`、持久化 `root_dir`、8 个读写线程、`PYTHONHASHSEED=0`）。

结果：重启服务器后，三次 CPU 层重载、三次文件系统重载全部通过，**重载后的响应与冷启动输出一致（包括 reasoning 字段）**；
五发 GSM8K 诊断 **31/32**。官方自己也强调：**这是小样本，不是完整基准**，
而且结果只覆盖这个纯文本配置，不代表命令构建器里更大的 tier/chunk 默认值。

**什么时候用**：长上下文、低并发的场景（离线文档分析、批处理）——用延迟换容量。
**什么时候别用**：追求 TTFT 的在线对话。

## 三个常见误解

**你以为：起不来就是镜像或模型坏了。**
实际上：先看超时（`VLLM_ENGINE_READY_TIMEOUT_S`），再看 thinking 预算，
再看 AMD 的 breakable CUDA graph 和 MoE 内核命名——**这四个是绝大多数"看起来坏了"的真凶。**

**你以为：调参可以一次改一堆。**
实际上：这四个旋钮互相耦合（并发影响 KV 占用，图捕获影响启动），一次只动一个，否则你分不清是谁的功劳。

**你以为：把官方基准命令抄过来就是最优配置。**
实际上：官方明确说了验证证据只适用于那个固定配置，不代表任意 nightly 镜像或你的流量。
**基准是"参考实验"，不是"生产推荐"。**

## 术语卡片（本篇新增）

| 术语 | 一句话定义 |
|---|---|
| `VLLM_ENGINE_READY_TIMEOUT_S` | 引擎就绪超时；本模型需设 3600，否则首次加载会被判超时 |
| Rust OpenAI frontend | vLLM 默认的 OpenAI 兼容前端实现，可切回 Python |
| DSML | 本模型工具调用的标签格式（不是 JSON 代码块） |
| breakable CUDA graph | 允许打断的 CUDA 图模式；AMD 上跑本模型的必要条件 |
| `--moe-backend aiter` | 让 vLLM 自选 AMD MoE 内核，而不是钉死某一个 |
| KV cache offloading | 把 KV 分层放到 CPU 内存/文件系统，用延迟换容量 |

## 全系列小结

十三篇（加一篇官方页面全译附录）讲完，这台模型的部署逻辑其实可以压缩成五句话：

1. **容量靠 MoE 和 Engram 堆（552B + 196B），速度靠稀疏（8B/16B 激活）**——装得下是第一难题。
2. **长上下文靠三件套**：两级稀疏注意力（算得起）+ KV 压缩到 890 字节/token（存得下）+ YaRN 外推（位置不乱）。
3. **数字格式和显存账本必须算清**：MXFP4 专家 + FP8 其余 + 21.9 GiB 的块 scale，总量 511 GB。
4. **速度靠投机解码（DSpark）和并行切分（TP/DP/EP）**，前者吃接受率，后者吃互连带宽。
5. **部署靠 nightly 镜像 + 耐心（超时 3600）+ 正确的思考预算**；PD 分离是官方验证过的进阶布局，NIXL 搬 KV。

**最后一个提醒**：本篇所有数字都来自官方页面 2026-09-20 版本——
这个模型还很新，页面会更新，**上线前请对照附录里的原文再核一遍**。

（全文完。系列附录：《vLLM DeepSeek-V4.1-Flash 部署说明中文全译》）

---

**系列目录**：[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)

上一篇：[《PD 分离、NIXL 与 vllm-router：prefill 和 decode 为什么分居》](/posts/deepseek-deploy-12-pd-disaggregation/)
