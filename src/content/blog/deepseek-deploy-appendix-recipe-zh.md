---
title: '附录：vLLM DeepSeek-V4.1-Flash 部署说明中文全译'
description: 'vLLM Recipes 官方页面 deepseek-ai/DeepSeek-V4.1-Flash 的逐节中文翻译：从 Overview、Context length、Images，到 Prerequisites、Verifying、Performance tuning，以及 MI355X / MI325X / H200 / Blackwell 的并行配置与 KV cache offloading。命令、参数、链接保持原样，是整个系列的事实底稿。'
pubDate: 2026-09-25T10:05:00+08:00
slug: "deepseek-deploy-appendix-recipe-zh"
category: null
tags: ["DeepSeek", "vLLM", "模型部署", "技术翻译"]
status: published
draft: false
published: true
source: "https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust"
---

来源：[vLLM Recipes · deepseek-ai/DeepSeek-V4.1-Flash](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust)（页面标注 Updated 2026-09-20）

> 原文：https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash?hardware=h100&frontend=rust
> 页面标题：`deepseek-ai/DeepSeek-V4.1-Flash | vLLM Recipes`；页面标注：**Updated 2026-09-20**
> 翻译说明：命令、参数名、代码、链接保持原样；GiB/GB、bytes 等计量单位不作换算，按原文保留。
>
> **说明**
> 这是官方页面《DeepSeek-V4.1-Flash》的逐节中文翻译，原文版权归 vLLM 项目所有，译文仅供个人学习参考；命令、参数、链接保持原样。它是系列《关于deepseek部署你要知道的一切》的事实底稿，系列文章里的每个数字都可以在这里找到出处。

## 概览（Overview）

DeepSeek-V4.1 是一个视觉-语言（vision-language）混合专家（MoE）模型：
**552B 主干参数，外加 196B 的 Engram 记忆；每个 prompt token 激活 8B，每个 output token 激活 16B**；
40 层 transformer，hidden size 5120，在文本栈前面还有一个 32 层的 ViT 和一个 aligner。
相比 V4，有六点不同：

- **因果编码器-解码器（Causal encoder-decoder）。** 这 40 层拆成 20 层编码器和 20 层解码器，
  解码器的全局 KV 是从编码器的最终隐藏状态投影出来的，而不是逐层计算得到的。
  因此 prefill 只跑编码器那一半——这就是"8B prefill / 16B decode"这个划分的来源。
- **两级稀疏注意力（Two-tier sparse attention）。** 每一层都在一个 128 token 的滑动窗口上做注意力。
  携带压缩比的层会额外加入压缩 KV latent，回溯到更远的位置，由学习得到的 softmax 门控做池化。
  另有一个小型的侧注意力——即 **indexer（索引器）**，继承自 V3.2-Exp——为这些 latent 打分，
  每条 query 保留最好的 512 个，并先经过一个候选阶段预筛（选出 2048 个大小为 8 的块）。
  只有四个层（第 2、8、14、20 层）真正压缩自己的 KV，其余层读取这份缓存。
  V4.1 只使用压缩比 1 和 2，而 V4 用的是 4 和 128。
- **Engram n-gram 记忆。** 第 1 层和第 14 层各拥有一张约 384M 行 × 256 维的哈希表，
  用输入的 2-gram、3-gram、4-gram 哈希去查表，并通过一个学习得到的门写入残差流。
  仅这两张表就有 **196.6B 参数（约 183 GiB）**——要为它们预留容量，它们除专家之外压过一切。
- **超连接（Hyper-Connections）。** 残差流以 4 份并行的副本承载；每个子层从流中推导出
  自己的 pre / post / combine 系数，其中 combine 矩阵通过 20 次 Sinkhorn 迭代被做成双随机矩阵。
- **DSpark 草稿头（DSpark draft head）。** 三个阶段（每阶段 128 个路由专家，激活 3 个）
  起草一个 5 token 的块，读取第 37–39 层的注意力输入，最后一个阶段上带有一个马尔可夫偏置头和一个置信度头。
- **MXFP4/MXFP8 混合 checkpoint。** 路由专家的权重是 MXFP4；其余一切是 MXFP8 块量化，
  全程使用 UE8M0 scale。Embedding 和 LM head 是 BF16。

路由上，每个 token 从 384 个专家中选 6 个，外加 1 个共享专家，用 `sqrtsoftplus` 打分并带 `noaux_tc` 偏置——
并且**对落在图像 span 内的 token 使用一套单独的路由偏置**，这样视觉 token 和文本 token 就不会争抢同一批专家。

## 上下文长度（Context length）

1,048,576 tokens，通过 YaRN、factor 16，从 65,536 token 的训练窗口外推得到。
压缩 KV 使用它自己的 RoPE theta（160,000）做旋转，因为一个 latent 代表多个 token，
所以它的位置彼此间隔比原始流更大。

## 图像（Images）

图像以 `<|deepseek_image|>` span 的形式进入 prompt；span 中的每个位置都携带 image token id，
而每个位置的**角色**（start / newline / end / image）由 processor 提供。
视觉塔是一个 32 层的 ViT，hidden size 1024，patch 14，带一个 3× 下采样的 aligner，
每张图上限 1024 个 token（最小 295,936 像素）。**每张提示中的图片数量没有限制。**
合并后的 embedding 以 `inputs_embeds` 的形式进入文本模型，位置在超连接流展开之前；
同时原始 token id 仍然继续流动，这样路由器才能应用图像路由偏置。

勾选 **Encoder parallel** 可让 ViT 走数据并行（`--mm-encoder-tp-mode data`）而不是张量并行：
在 32 层 / hidden 1024 的规模下，编码器已经小到"TP 通信成本高于它省下的计算"，
对多图请求可以显著降低 TTFT。它与 **Text only** 互斥。

## 推理与工具调用（Reasoning and tool calling）

两种 thinking 模式，以及一个**数值型推理预算（numeric reasoning budget）**，而不是离散的档位。
通过 `chat_template_kwargs` 传入：

| key | 取值 |
|---|---|
| `thinking` / `enable_thinking` | 布尔值；如果两个都传，它们必须一致 |
| `reasoning_effort` | `low`（25）、`high`（50）、`xhigh`（75）、`max`（100），**或 1–100 的整数** |

顶层 OpenAI 的 `reasoning_effort` 字段同样有效，其中 `"none"` 表示关闭 thinking。
`"minimal"` 和 `"medium"` 会被拒绝——它们不属于这个模型的取值集合。

注意：DeepSeek API 把自己的 `low` / `high` / `max` 档位映射到 50 / 75 / 100，
而开源 prompt encoder（因而也是 vLLM）把 `low` / `high` / `xhigh` / `max` 映射到 25 / 50 / 75 / 100。
一个在 API 上按 `high` 调好的请求，在这里会以 effort 50 运行；如果需要严格对齐，就传整数。

> **两个 key 都不设时，thinking 是开启的，且 effort 为 50。** 也就是"什么都不配"反而最啰嗦：
> 一个 `max_tokens` 很小的请求会把预算全花在推理轨迹上，返回空的 `content` 和 `finish_reason=length`。
> 这看起来像模型坏了，其实不是。要么显式设 `thinking: false`，要么给足预算。

在 thinking 模式下，预算会以 `Reasoning Effort: N` 前缀的形式渲染进 prompt，且只在第一轮出现。

```python
resp = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-V4.1-Flash",
    messages=[{"role": "user", "content": "What is 17*19?"}],
    extra_body={"chat_template_kwargs": {"thinking": True, "reasoning_effort": 25}},
)
```

DeepSeek 公布的评测数字使用 `temperature=1.0`、`top_p=0.95`、effort 100，以及至少 256K 的 `max_tokens`。
技术报告指出，60–80 的 effort 就能以不到一半的 token 找回大部分准确率，所以 `max` 留给困难任务。

工具调用被包在 DSML 标签块里，而不是 JSON 代码块；工具返回结果包裹在 `<tool_result>` 标签中。

## 投机解码（Speculative decoding）

DSpark 是这个 checkpoint 唯一的投机方法。V4.1 去掉了 V3 和 V4 随主干一起训练的 MTP 模块。
**投机解码**启用一个 5 token 的块。在 NVIDIA 上它还会打开自适应验证（见功能说明）。
在 AMD 上，vLLM 目前拒绝自适应验证。生成的命令会设置
`enable_adaptive_verification:false` 并验证整个块。`maybe_create_adaptive_verification_manager`
中有两项检查在 ROCm 上失败：indexer 辅助函数 `supports_device_cpu_query_lens_mismatch()` 为 False，
以及 `DeepseekV41ROCMAiterSparseSWABackend` 报告的是 `AttentionCGSupport.UNIFORM_BATCH`
而不是 `ALWAYS`。只有在用真实标志启动成功之后，才去掉这个 AMD 覆盖。
接受率取决于工作负载，所以在围绕它规划部署规模之前，先在自己的流量上实测。
草稿器的专家会给加载量增加大约 14B 参数。

## 纯文本服务（Serving text-only）

勾选 **Text only** 会加上 `--language-model-only`，从而完全跳过视觉编码器。
只要工作负载是文本，它都值得开：它把 ViT 和 aligner 从加载中拿掉，把那些显存让给 KV cache。
它与 `encoder_parallel` 互斥。在 GB200 上验证通过的运行（TP4 和 1P1D）都是纯文本的。

## Prefill/Decode 分离（Prefill/Decode disaggregation）

**Prefill/Decode Disaggregation** 策略是在 GB200 NVL4 上验证过的 1P1D 布局：
每个角色一个 tray（4 张 GPU），每个池子内 TP4，KV 通过 NIXL 交接，
前面由 `vllm-router --vllm-pd-disaggregation` 作为前端。
两个池子都通过 `--kernel-config` 关闭 FlashInfer autotune 加 JIT 以及 CuTeDSL warmup，
跳过 DeepGEMM warmup（`VLLM_DEEP_GEMM_WARMUP=skip`），并把 `--max-num-seqs` 限制在 32。
在 8 卡节点上，同样的布局变成每个角色 TP8。

打开**投机解码**时，DSpark 会在两个池子里都运行，这样传输的 KV 保持兼容。

## 显存（Memory）

checkpoint 磁盘上大约 **511 GB**（476 GiB），拆解如下：

| 组件 | 条目数 | 存储 |
|---|---:|---:|
| 路由专家 + DSpark 专家（MXFP4） | 557.2B | 259.5 GiB |
| Engram 表（FP8） | 196.6B | 183.1 GiB |
| 注意力、dense 投影、路由器（FP8） | 7.4B | 6.9 GiB |
| Embedding + LM head（BF16）、norm（FP32） | 2.0B | 3.9 GiB |
| UE8M0 块 scale | 23.6B | 21.9 GiB |

DeepSeek 给出的 552B 主干数字覆盖路由专家、注意力与 embedding；
Engram 表、约 14B 的 DSpark 草稿器和块 scale 都在这个口径之外。

`vram_minimum_gb: 614` 是这个总量乘以 schema 的 1.2 余量系数。
它装得下一个 GB200 NVL4 tray（768 GB）跑 TP4，或者一台 8 卡 H200 节点（1128 GB）并留出 KV cache 的空间。

KV cache 在预算中只占很小一部分。压缩 latent 在各层之间共享，并且被训练为以 FP4 存储，
DeepSeek 把由此得到的全局 KV 定为**每 token 890 字节**，约为 V4-Flash 的四分之一；
按这个口径，一个完整的 1M token prompt 的全局 KV 不到 1 GB，另加每层固定的 128 token 滑动窗口。
决定容量上限的是权重和批大小，而不是 cache——不过，在假设某个上下文/批大小能装下之前，仍然要实测。

## 前置条件（Prerequisites）

- 一个（vLLM 0.30.0+ 的）镜像；没有任何 pip wheel 能服务这个架构，所以 Install 区块只提供 Docker。
  在 NVIDIA 上是 `vllm/vllm-openai:nightly`：该架构在
  [vllm-project/vllm#56228](https://github.com/vllm-project/vllm/pull/56228) 合入 `main`，
  因此 2026-09-10 之后的任何 nightly 都能服务它，发布当天的 `deepseekv41-flash-0909` 标签不再需要。
  在 AMD 上是 `vllm/vllm-openai-rocm:nightly`，它还包含
  [vllm-project/vllm#56503](https://github.com/vllm-project/vllm/pull/56503)——那项改动把 mHC 的 delayed pre block
  从 eager Torch 参考实现移到 AITER 上，时间上晚于 0909 标签。
- 命令构建器中默认选中 Rust OpenAI frontend。如果遇到不支持的功能或兼容性问题，切换到 Python。
- 首次加载会很久：`VLLM_ENGINE_READY_TIMEOUT_S=3600` 就是为此设置的。
- 在 AMD 上，生成的命令会设 `VLLM_USE_BREAKABLE_CUDAGRAPH=1`。DeepSeek-V4.1-Flash 不支持 `torch.compile`，
  而 ROCm 的稀疏 SWA 后端只支持 uniform-batch 的 CUDA graph。没有 breakable CUDA graph，
  默认的 `FULL_AND_PIECEWISE` 会在捕获阶段直接崩掉。
- 在 AMD 上，生成的命令传 `--moe-backend aiter` 而不是指定具体内核。指定
  `aiter_triton_mxfp4_bf16` 会把 Triton 的 W4A16 `_moe_gemm_a16w4` 内核钉死；
  而只给这个名字，则让 vLLM 去选择 Composable Kernel 的 a8w4 专家——也就是下面 MI355X 基准里用的那个。
  它还会设置 `AITER_TRITON_LOG_LEVEL=ERROR`，以去掉 AITER 每次调用都打的 "Gluon unavailable" 警告，
  这个警告在 gfx950 上是持续不断的，会刷满服务器日志。
- 在 MI355X 上，**Tensor Parallel** 会继承 vLLM 的调度器限制。如有需要，按你的流量和显存预算
  调 `--max-num-seqs`。下面的基准配置为了可复现性记录了一个显式上限。
- 在 AMD 上，勾选**投机解码**也会设置 `enable_adaptive_verification:false`。vLLM 目前拒绝真实的标志：
  `DeepseekV41IndexerBackend.supports_device_cpu_query_lens_mismatch()` 为 False，
  且 `DeepseekV41ROCMAiterSparseSWABackend` 报告的是 `UNIFORM_BATCH` 而非 `ALWAYS`。
  DSpark 仍会每轮起草 5 个 token。

## 验证（Verifying）

先把服务跑起来，然后发**一条文本请求和一条图片请求**——视觉塔是一条独立路径，纯文本的冒烟测试覆盖不到它：

```bash
curl http://localhost:8000/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"deepseek-ai/DeepSeek-V4.1-Flash",
       "messages":[{"role":"user","content":"What is 17*19? Return only the integer."}]}'
```

正确答案是 `323`。

## 性能调优（Performance tuning）

从 vLLM 的默认值开始，针对你的工作负载一次只调一个参数：

- `--max-num-seqs`：如果正在运行的序列上限造成了排队、且显存允许，就调高它；
  如果更大的批伤害了延迟或显存占用，就调低。
- `--max-num-batched-tokens`：通过调整每个调度迭代的 token 预算，在 prefill 吞吐、
  decode 延迟与显存占用之间取平衡。
- `--max-cudagraph-capture-size`：覆盖预期的 decode 批大小（包含 DSpark 草稿 token），
  同时把图显存和启动开销算进去。下面的基准把 `128 * (1 + 5) = 768` 向上取整到 1024。
- `--max-model-len`：按你的 prompt 加输出长度来设定上下文上限。

### MI355X 基准服务器

下面这条可运行的命令，与 [InferenceX #3058](https://github.com/SemiAnalysisAI/InferenceX/pull/3058)
在 [commit `559ef756`](https://github.com/SemiAnalysisAI/InferenceX/blob/559ef7560a74d0fb8da64fdfc0c357ad2fc33c4f/benchmarks/single_node/agentic/dsv41flash_fp4_mi355x_vllm_mtp.sh)
中的服务器参数与执行环境一致。它使用四张 MI355X GPU 和固定版本的镜像。
请为你的主机设置 `ROCR_VISIBLE_DEVICES` 和 `PORT`；如有需要，把 `HF_HOME` 设为一个已存在的可写 Hugging Face 缓存。
吞吐模式使用合成接受率（synthetic acceptance），仅用于基准测量。
在这条命令之前执行 `export EVAL_ONLY=true` 可获得真实的块拒绝（block rejection），
InferenceX 的准确率评测就是这么做的；日常服务也请使用那个模式。

```bash
docker run --rm -i --network host --ipc host \
  --device /dev/kfd --device /dev/dri --group-add video \
  --security-opt seccomp=unconfined --workdir /tmp \
  -v "${HF_HOME:-$HOME/.cache/huggingface}:/root/.cache/huggingface" \
  -e ROCR_VISIBLE_DEVICES="${ROCR_VISIBLE_DEVICES:-0,1,2,3}" \
  -e PORT="${PORT:-8000}" -e EVAL_ONLY="${EVAL_ONLY:-false}" \
  --entrypoint /bin/bash \
  vllm/vllm-openai-rocm:nightly-eed1f3d0c6043bd494424a22443ee198dd56f657 -s <<'BASH'
set -eo pipefail
export HIP_VISIBLE_DEVICES="$ROCR_VISIBLE_DEVICES"
export VLLM_ROCM_USE_AITER=1 VLLM_ROCM_USE_AITER_MOE=1
export AITER_TRITON_LOG_LEVEL=ERROR VLLM_USE_BREAKABLE_CUDAGRAPH=1
export OMP_NUM_THREADS=1 VLLM_ENGINE_READY_TIMEOUT_S=3600
export VLLM_USE_RUST_FRONTEND=1 PYTHONUNBUFFERED=1 GPU_COUNT=4
MODEL=deepseek-ai/DeepSeek-V4.1-Flash
hf download "$MODEL"
if [[ "$EVAL_ONLY" == true ]]; then
  SPEC_CONFIG='{"method":"dspark","num_speculative_tokens":5,"draft_sample_method":"probabilistic","rejection_sample_method":"block","enable_adaptive_verification":false}'
else
  SPEC_CONFIG='{"method":"dspark","num_speculative_tokens":5,"draft_sample_method":"probabilistic","rejection_sample_method":"synthetic","synthetic_acceptance_length":3.51,"enable_adaptive_verification":false}'
fi
exec vllm serve "$MODEL" --served-model-name "$MODEL" \
  --host 0.0.0.0 --port "$PORT" --tensor-parallel-size 4 \
  --language-model-only \
  --tokenizer-mode deepseek_v41 \
  --tool-call-parser deepseek_v41 --enable-auto-tool-choice \
  --reasoning-parser deepseek_v41 \
  --moe-backend aiter \
  --gpu-memory-utilization 0.9 \
  --speculative-config "$SPEC_CONFIG" \
  --max-model-len 1048576 \
  --max-num-seqs 128 \
  --max-cudagraph-capture-size 1024 \
  --max-num-batched-tokens 16384 \
  --disable-uvicorn-access-log
BASH
```

AgentX 扫测使用的任务并发为 1、2、4、8、16 和 32，KV 常驻 GPU，
并设置 `WEKA_LOADER_OVERRIDE=semianalysis_cc_traces_weka_062126`。
5 token 的 DSpark 使用黄金接受长度 3.51。复现环境与结果见
[InferenceX #3058](https://github.com/SemiAnalysisAI/InferenceX/pull/3058) 及其
[固定 master 配置](https://github.com/SemiAnalysisAI/InferenceX/blob/559ef7560a74d0fb8da64fdfc0c357ad2fc33c4f/configs/amd-master.yaml#L1761)。
上面的命令只是把服务器起起来；回放客户端由 InferenceX 的 harness 提供。
验证证据只适用于那个固定下来的基准配置，不适用于未来任意一个 `:nightly` 镜像，
也不适用于通用命令所继承的调度器限制。

## MI355X 张量并行（MI355X Tensor Parallel）

在 MI355X 上，**Tensor Parallel** 默认是 **TP2** 加 Engram CPU offload（`--engram-config '{"cpu_offload":true}'`）。
Engram 表在 TP4 下每卡消耗 47.2 GiB 设备显存，在 TP2 下是 94.4 GiB；
在 288 GiB 的卡上，TP2 的这个数字没法与一半 checkpoint 并存，所以这些表会搬到 pinned host memory。
TP2 让每台服务器的 GPU 数减半，因而每个节点的服务器数翻倍。
若用 TP4，请传 `--tensor-parallel-size 4` 与 `--engram-config '{"cpu_offload":false}'`，让这些表留在显存里。

这个 offload 只在带有 [vllm-project/vllm#57491](https://github.com/vllm-project/vllm/pull/57491)
的构建上能在 gfx950 上正常解析——那个 PR 把两个 `is_cuda()` 判断放宽为 `is_cuda_alike()`。
那些构建还会通过 `VLLM_PLE_CPU_OFFLOAD` 默认打开 `cpu_offload`，所以要显式设置，不要继承默认值。

ROCm 另外还需要 `--no-swa-bounded-replay`，由共享的 AMD override 提供；原因见那里的注释。

## MI325X 张量并行（MI325X Tensor Parallel）

在 MI325X 上，**Tensor Parallel** 采用 recipe 默认的 **TP4**，并把 Engram 表 offload 到 pinned host memory
（`--engram-config '{"cpu_offload":true}'`）。256 GB 的卡在 TP4 下每卡约留下 81 GiB 常驻权重，
TP2 下约 145 GiB；TP2 装得下，但 KV 池是本 recipe 所有方案里最小的，
所以这里默认用 TP4，而不是 MI355X 在其更大的 288 GiB 卡上所用的 TP2。
若要用 TP2，请传 `--tensor-parallel-size 2`。

MI325X 是 gfx942，它与 gfx950 有两点关键差异。它没有 FP4 MFMA，所以 MXFP4 专家要走 Triton 内核，
设备显存用在 KV 上比用在常驻 Engram 表上更划算。它在 piecewise 图捕获时每个 worker 都会段错误，
所以本 recipe 设置 `VLLM_USE_BREAKABLE_CUDAGRAPH=0`，只捕获完整的 decode 图
（`--compilation-config '{"cudagraph_mode":"FULL_DECODE_ONLY"}'`）；prefill 走 eager 执行。

这个 offload 只在带有 [vllm-project/vllm#57491](https://github.com/vllm-project/vllm/pull/57491)
的构建上能在 gfx942 上正常解析，和 MI355X 需要的是同一个 gate。
那些构建同样会通过 `VLLM_PLE_CPU_OFFLOAD` 默认打开 `cpu_offload`，所以要显式设置，不要继承默认值。

ROCm 另外还需要 `--no-swa-bounded-replay`，由共享的 AMD override 提供；原因见那里的注释。

## H200 张量并行（H200 Tensor Parallel）

在 H200 上，**Tensor Parallel** 使用默认的 TP4 加 Engram CPU offload
（`--engram-config '{"cpu_offload":true}'`）。Engram 表搬到 pinned host DRAM，通过 UVA 读取，所以输出不变。
在 141 GB 的卡上，正是这个 offload 让 TP4 变得可行：它把每卡 23.6 GiB 移出 GPU，
留下 81.2 GiB 常驻权重和每 GPU 38.5 GiB 的 KV（约 20M token）。在这个副本规模下不需要调度器上限。

## Blackwell TP 与 DEP（Blackwell TP and DEP）

在 B200、B300、GB200 与 GB300 上，**Tensor Parallel** 使用 **TP2**，配合 `FLASHINFER_MLA_SPARSE_DSV41`
与 Engram CPU offload（`--engram-config '{"cpu_offload":true}'`），
后者把 Engram 表搬到 pinned host DRAM 并通过 UVA 读取；输出不变。
**Data + Expert Parallel** 则使用硬件的 GPU 数量：GB200/GB300 tray 上为 DEP4，B200/B300 节点上为 DEP8。
它启用 `--enable-expert-parallel`、`FLASHMLA_MEGA_ATTN_DSV41`、
`--kernel-config '{"moe_backend":"deep_gemm_mega_moe"}'`，以及
`--engram-config '{"embedding_across_dp":true}'`。

两种配置都把 `indexer_kv_dtype` 设为 `mxfp4`、`indexer_sparse_logits` 设为 `true`、
`--kv-cache-dtype fp8`，并把 `--max-num-seqs` 设为 128。推理使用 `--reasoning-parser deepseek_v41`。

每个 Blackwell SKU 都有一个精确到 GPU 的 override，优先级高于共享的 Blackwell 默认值。
B300 保持它已有的 CUDA Graph 捕获配置（`--max-cudagraph-capture-size 8190`）、
`--max-num-batched-tokens 8192` 和 `--max-num-seqs 256`；B200、GB200 与 GB300 增加 Engram CPU offload，
其余继承共享的 Blackwell 设置。在 TP2 下调度器限制与工作负载相关，所以要按你自己的服务画像来定
`--max-num-batched-tokens` 和 `--max-cudagraph-capture-size`。若要在其中任何一个平台上追求高交互性，
使用 `--tensor-parallel-size 4`。

## KV cache offloading

offload 需要包含 [vllm-project/vllm#57145](https://github.com/vllm-project/vllm/pull/57145) 的构建。
验证使用 [deepseek-ai/DeepSeek-V4.1-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash) 在 4×H200（TP4）上、
vLLM commit `d1b4028d7e`、Python frontend、`--enforce-eager`、`--max-model-len 16384`、
`--max-num-seqs 16`、`--max-num-batched-tokens 8192`。DeepSeek 侧的验证使用 `--gpu-memory-utilization 0.95`。
验证使用 `TieringOffloadingSpec`：CPU 层共 8 GiB，`blocks_per_chunk: 1`，
一个持久的文件系统 `root_dir`，八个读写线程，以及 `PYTHONHASHSEED=0`。
重启服务器后，三次 CPU 层重载和三次文件系统重载均通过。
重载后的响应与冷启动输出一致，包括 reasoning 字段。
五发 GSM8K 诊断得分为 31/32；这只是小样本，不是完整基准。
这些结果覆盖的是这个纯文本配置，而不是命令构建器里更大的 tier/chunk 默认值，也不是其他变体。

## 参考（References）

- [Model card](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash)
- [Technical report](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf)
- [DeepSeek-V4-Flash recipe](/deepseek-ai/DeepSeek-V4-Flash) — 它所背离的那个 V4 兄弟版本
- [DeepSeek-V3.2-Exp recipe](/deepseek-ai/DeepSeek-V3.2-Exp) — indexer 最早出现的地方

---

**系列目录**：[《关于deepseek部署你要知道的一切》](/series/deepseek-deploy/)

上一篇：[《上手篇：把 V4.1-Flash 跑起来》](/posts/deepseek-deploy-13-hands-on/)
