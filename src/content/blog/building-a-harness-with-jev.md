---
title: "用 Jev 搭 Agent Harness：面向决策而非生成文本的新模型"
description: "Jev 是为决策而非生成文本优化的 System One 模型；本文译自 Sydney Runkle / Hunter Lovell，讲如何用它搭 agent harness（路由与 Auto Mode）。"
pubDate: 2026-09-20
updatedDate: 2026-09-20
slug: "building-a-harness-with-jev"
category: null
tags: ["X转录", "Jev", "Agent", "LangChain", "笔记"]
status: published
draft: false
published: true
source: "https://www.langchain.com/blog/building-a-harness-with-jev"
author: "Sydney Runkle (@sydneyrunkle), Hunter Lovell"
---

来源：[LangChain 博客](https://www.langchain.com/blog/building-a-harness-with-jev) · [X Article](https://x.com/sydneyrunkle/status/2100754364545761643)（作者：Sydney Runkle (@sydneyrunkle), Hunter Lovell）

推荐：[Matt Canham](https://x.com/matthewcanham/status/2101098949205713304)

> **转载说明**
> 本文为中文转载翻译，仅作学习分享，版权归原作者 / LangChain 所有。核心观点附英文原文；代码示例保持原文。性能数字为厂商/原文表述，本站未独立验证。

Matt Canham 的推荐语：

> Jev is a new type of model that is optimized for making decisions, not generating text  
> This is the best article I’ve found so far breaking down how it works - required weekend reading imo

中文：Jev 是一类为**做决策**优化的新模型，而不是为生成文本；这是他目前看到最好的一篇拆解文章。

---

## 核心观点（中英对照）

1. **Agent 循环仍然贵且慢**  
   工具调用与结构化输出解决了「接口」，但循环里的每一次决策仍要再打一次大模型。  
   > But even with those in place, the agent loop is still slow and costly: every decision requires another model call.

2. **Jev 不是传统 LLM**  
   它不生成文本；TypeSafe AI 称之为 **System One** 模型：读状态，返回带类型的答案与概率。  
   > Jev is actually not a traditional LLM, it doesn’t generate text. It’s what the TypeSafe AI team calls a System One model.  
   > System One models are a class of AI models built to make fast, structured decisions that software can use directly. A System One model evaluates a state and returns typed answers and probabilities.

3. **用 RLCD 做校准决策**  
   训练方式是 reinforcement learning for calibrated decisions；应用侧用结果驱动下一步，不必每次都走完整聊天 LLM。  
   > It’s trained using reinforcement learning for calibrated decisions (RLCD). Your code uses those results to guide what an agent does next, without a full chat LLM call for each decision.

4. **调用形态：state + questions**  
   传入上下文（state）和关于该状态的问题；支持 Choice / Score / Noul 三类问题；同一次请求可并行问多个问题。  
   > To invoke a Jev model, you send it a state (the context) and questions about that state.  
   > System One models evaluate every question in a request in parallel. Adding questions barely changes the response time and costs only the tokens for the extra questions, which are cheap.

5. **定位：互补，不是替代**  
   LLM 负责开放推理与生成；Jev 负责快、便宜的结构化决策。  
   > use an LLM for open-ended reasoning and generation, and Jev for fast, structured decisions along the way.

6. **两个落地场景**  
   - **Model routing**：按任务难度/代价选模型  
   - **Auto Mode**：在工具执行前用 Jev 拦高风险动作（类似闭源 coding harness 里的危险动作分类，但可开放复用）  
   > AutoModeMiddleware uses Jev to check tool calls for risky decisions it may take, and block calls before the tool executes.  
   > Up until now, this classifier step has been locked away in the closed source parts of the harness.

7. **性能宣称（公司侧）**  
   分类任务上最高约 **200× 更快**、**400× 更便宜**（相对可比 LLM；以厂商报告为准）。  
   > The company reports up to 200x faster inference and 400x lower cost than comparable LLMs on classification tasks.

---

## 全文中文翻译

### 引言

Agents 在循环中运行：LLM 决定下一步，工具执行，模型评估结果，再继续，直到任务完成。

早期要把 Agents / LLMs 嵌进依赖结构化数据与可预期接口的软件里并不容易。后来出现了两个关键原语：

- **Tool calling**：让模型发出结构化请求，并收到结构化结果。  
- **Structured outputs**：让模型直接返回结构化结果。

即便如此，agent 循环仍然又慢又贵：每个决策都还要再打一次模型。

于是有了 **Jev**。它是 TypeSafe AI 发布的新模型。公司报告称，在分类任务上可比同类 LLM 最高约 **200 倍推理速度**、**400 倍成本优势**。

本文说明 Jev 怎么工作、它卡在 agent 循环的哪一段，以及如何和 LangChain 一起用。

### 关于 Jev

Jev 并不是传统 LLM，它**不生成文本**。TypeSafe AI 称之为 **System One** 模型：

> System One models are a class of AI models built to make fast, structured decisions that software can use directly. A System One model evaluates a state and returns typed answers and probabilities.  
> （System One：一类为软件可直接消费而建的、快速结构化决策模型；评估状态并返回带类型的答案与概率。）

它用 **RLCD**（reinforcement learning for calibrated decisions）训练。你的代码拿这些结果决定 agent 下一步，而不必每次决策都走完整聊天 LLM。

调用时传入 **state（上下文）** 和对它的 **questions**。文档里工单紧急度的单问题示例：

```json
{
  "model": "jev-latest",
  "state": "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing. I'm losing sales. Please help ASAP.",
  "questions": {
    "is_urgent": {
      "type": "noul",
      "instructions": "The message conveys urgency or time-sensitivity"
    }
  }
}
```

示例返回（节选）里 `noul: 0.999`，即约 99.9% 概率判定紧急，应用可据此排优先级。

支持的三类问题：

- **Choice**：从选项中选；返回各选项概率与整体置信度。  
- **Score**：按有序等级（如低/中/高）打分；返回连续分数、分布与置信度。  
- **Noul**：是非题；返回「陈述为真」的概率。

关键能力：同一 state 上可一次问多个问题。

> System One models evaluate every question in a request in parallel. Adding questions barely changes the response time and costs only the tokens for the extra questions, which are cheap.  
> （请求内问题并行评估；多问几个几乎不拉长响应时间，成本主要是额外问题的廉价 token。）

更多多问题工单示例见 TypeSafe Quickstart。

总结：与传统 LLM 不同，Jev 既不受文本生成束缚，也不受逐步串行决策束缚。

### 在 LangChain 里怎么用

LangChain 的 provider-agnostic 模型层很适合把 Jev 和海量其他集成并排放。

集成通过 `TypeSafeClassifier` 暴露：对 `.invoke()` 传入 state 与 questions，拿到的是分类结果，而不是聊天回复。

安装 `langchain-typesafe`，设置 `TYPESAFE_API_KEY`，然后：

```python
from langchain_typesafe import Noul, TypeSafeClassifier

classifier = TypeSafeClassifier()

response = classifier.invoke(
    state=(
        "The deploy failed twice and customers are seeing 500s. "
        "Can someone look now?"
    ),
    questions={
        "urgent": Noul(
            instructions="Does this need attention right now?"
        ),
    },
)

urgency = response.nouls["urgent"].noul
```

state 可以是文本、结构化数据或 LangChain messages，因此很容易在节点或 middleware hook 里，用 agent 已有上下文调用 Jev，也可以做成自定义 middleware / tools。

### 用例

Jev **不能**直接替代 LLM：它不生成文本，但能承接我们今天常用 LLM 做的分类类任务，且延迟与成本更低。更合理的分工是：LLM 做开放推理与生成，Jev 做沿途的快速结构化决策。

#### Model routing（模型路由）

简单查数不必用和疑难调试同一档模型。路由 middleware 让 Jev 评估请求，再按你定义的标准选模型：简单任务走快且便宜的，复杂任务走更强的。

```python
from langchain.agents import create_agent
from langchain_typesafe.experimental.middleware import (
    ModelChoice,
    ModelRouterMiddleware,
)

router = ModelRouterMiddleware(
    choices={
        "fast": ModelChoice(
            model="openai:luna",
            criteria="Direct lookups, extraction, and localized changes.",
        ),
        "powerful": ModelChoice(
            model="openai:sol",
            criteria="Architecture and high-stakes decisions.",
        ),
    },
    instructions="Choose the least costly model that can complete the task.",
)

agent = create_agent("openai:gpt-5.6-luna", middleware=[router])
```

路由根据最新用户消息选模型并贯穿整次 run；概率与置信度仍可留在 agent state。

#### Auto Mode（自动护栏）

Agents 本质上仍不可完全信任。坏指令（自然产生或攻击诱导）可能让它做出不该做的动作。

Claude / Codex / Cursor 等 coding harness 已内置「危险动作先分类再执行」的模式，逐步建立信任；但这层分类器以往锁在闭源 harness 里。

现在有了便宜且够快的分类模型，同一模式可以推广到所有 agents：

```python
from langchain.agents import create_agent
from langchain_typesafe.experimental.middleware import (
    AutoModeMiddleware,
)

guardrail = AutoModeMiddleware(tools=["bash"])

agent = create_agent("openai:gpt-5.6-luna", middleware=[guardrail])
```

`AutoModeMiddleware` 用 Jev 检查工具调用是否风险过高，并在执行前拦截。

### 起步

作者对 Jev 的可能性很兴奋，并提到已有案例：Browserbase 的 Kyle Jeong 用极低成本驱动 browser agents；Jarrod Watts 做实时交易 agent；Ryan Vogel 做大规模邮件分拣等。

新模型每周都有，但这一款反响格外大。欢迎在论坛、X 或 LangChain issues 上反馈与分享作品。

致谢：@huntlovell、@hwchase、@ccurme、@veryboldbagel、Nathan Drenzer 等。

---

**说明：** 代码示例保持原文；数字与性能为厂商/原文表述，转载未独立验证。
