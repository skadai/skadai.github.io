---
title: "Stanford MS&E435：Coding AI 与 Agent Cloud | Guillermo Rauch"
description: "Stanford MS&E435 课堂对谈笔记：Vercel 创始人 Guillermo Rauch 谈 Coding AI、Agent Cloud，以及软件免费之后部署、组合与治理的价值。"
pubDate: 2026-06-23
updatedDate: 2026-09-10
slug: "stanford-mse435-applications-coding-ai"
category: null
tags: ["youtube转录", "Stanford", "AI", "Coding", "笔记"]
status: published
draft: false
published: true
source: "https://www.youtube.com/watch?v=HA7lZd7zk3M"
---

来源：[YouTube 原视频](https://www.youtube.com/watch?v=HA7lZd7zk3M)（Stanford Online · MS&E435）

> Stanford MS&E435《Economics of the AI Supercycle》课堂对谈。嘉宾 Guillermo Rauch 是 Vercel 创始人、Next.js 创建者；主持人为 Stanford 讲师、Altimeter Capital 合伙人 Apoorv Agrawal。内容围绕 coding agents、Agent Cloud、软件生成、SaaS 重构、开放基础设施、token gateway、安全与未来价值分配。

> **观点与数字的归属**
> Vercel 估值、部署增长、市场占比、客服自动化比例、Amazon 延迟与转化率、芯片和市场判断等均按主持人或 Rauch 在课堂中的口头口径记录，未在本笔记中独立核验。关于 AGI、SaaS 生死、行业赢家和能源未来的判断属于嘉宾观点，不构成投资建议。

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/HA7lZd7zk3M"
    title="Stanford MS&E435：Coding AI 与 Agent Cloud | Guillermo Rauch"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</div>


## TL;DR

- Rauch 认为 coding agents 带来了软件创造者数量最大的扩张。代码本身会越来越便宜，真正形成价值的是把软件部署到用户面前、获得反馈，并持续运行、修复、扩容和保护它。
- 云的核心对象正在从页面转向 Agent：传统云服务短而同步地返回页面和像素，Agent Cloud 要支持持续数秒、数小时乃至全天的推理、工具调用和后台工作，并流式交付 token 与结果。
- “Agentic infrastructure”有三层含义：供 coding agent 部署软件；供开发者构建自己的 Agent；再由 Agent 自动运维、优化和治理这套云。
- Agent 不会每次从零发明整个软件世界。开源框架、清晰 API、CLI、MCP 和可组合组件像乐高积木，能减少 token 与上下文消耗，并更容易成为模型默认选择。
- AI Gateway 类似“token 的 CDN”：提供观测、故障切换、安全、缓存和路由。Sandbox 则像 Agent 的个人电脑，让模型运行代码和工具，也带来数据外泄与新型网络安全问题。
- Coding AI 不一定消灭所有 SaaS。最容易被替代的是通用呈现层和低质量、最低公分母式内部工具；数据库、系统记录、权限控制与可供 Agent 调用的接口仍能保留价值。
- 软件生成趋近免费后，会出现一次性软件、销售会议专用 demo 和企业高度定制的界面；同时复杂基础设施仍很难，未来甚至会形成 Agent 对 Agent 的 bug 报告、需求排序和修复闭环。
- Rauch 看好“以 token 速度运行”的开放、即时、自助和按量计费产品；静态内容聚合、把代码视作稀缺品的拖拽工具，以及必须长期联系销售才能使用的封闭软件会承受更大压力。

## 00:00｜Guillermo Rauch：从自学编程到 Vercel 与 Next.js

- Rauch 在 Buenos Aires 郊区长大，因为西班牙语软件资料稀少，通过阅读英文手册学习英语和编程，年少时就做远程 JavaScript 工作。
- 他中途离开高中，后来为满足赴美工作的 O-1 签证条件写了《Smashing Node.js》。他提醒学生，非传统路径既能带来优势，也会制造学历和移民方面的困难。
- 主持人介绍他创建了 Next.js，并把 Vercel 建成重要的开发者基础设施公司；视频的重点不是个人传奇，而是这套基础设施如何适应 coding agents。

## 02:15｜开源工具之上，建立可部署、可扩展的基础设施业务

- Rauch 说 Vercel 构建了 Next.js、AI SDK、shadcn 等开源生态，并在其上提供安全、扩展、部署页面和 Agent 的商业基础设施。
- 开源取向来自他早年对免费工具和信息的依赖。反直觉之处在于，免费软件并没有阻止公司建立大规模基础设施业务，反而让框架成为网络和模型训练语料的一部分。
- 他用 McDonald's、Porsche、OpenEvidence 和 Grok 等例子说明，用户未必知道自己正在间接使用 Vercel。

![](/blog/youtube/HA7lZd7zk3M/01-vercel-platform-scale-02m36s.png)

## 03:52｜最初的产品洞察：会写前端，不应等于会运维全球基础设施

- 创业前，Rauch 花数周部署一个采用 React、JavaScript 和 Kubernetes 的网站，感受到即使有经验的工程师也会被底层云复杂度拖慢。
- Vercel 最初服务的假设人群约为两千万 JavaScript 开发者：只要会构建用户体验，平台就代管负载均衡、全球性能、扩容与稳定性。
- 这一逻辑把“创作前端”和“运行生产系统”拆开，让更多人可以把想法真正交到用户手中。

## 05:56｜Coding agents 扩大了软件生产的总市场

- Rauch 把编程史描述为不断扩大访问权：从少数能接触大学主机的人，到现代开发者，再到现在能借助自然语言生成软件的大量非专业用户。
- 他的核心判断是，AI 带来的不是小幅生产率改进，而是软件创造者总量可能扩大 10 倍、20 倍乃至 100 倍。
- Vercel 从 2025 年 10 月后观察到部署量快速上升，Rauch 特别把转折与 Opus 4.5 等 coding model 的成熟联系起来。

![](/blog/youtube/HA7lZd7zk3M/02-deployments-opus45-07m00s.png)

- 他用“peanut butter and jelly”比喻 coding agent 与部署平台：Agent 负责大规模生成代码，基础设施负责让代码在现实中运行。

## 07:13｜写代码不稀缺，部署并接触用户才产生学习

- Rauch 认为，仅把源代码存进 GitHub 并不会自动创造价值；世界上已经有大量仓库难以运行。
- 真正的学习从用户接触可运行产品开始：使用、错误、留存和反馈会暴露需求是否成立。
- Coding agents 不像人类那样容易停留在“我的机器上能运行”。它们天然倾向于继续部署、测试和迭代，因此会放大对云资源的需求。

## 08:28｜从 Web Services 到 Agent Services

- 传统云的中心对象是页面、API 和运行人类代码的虚拟机；Rauch 认为今天用户最想创建和发布的对象逐渐变成 AI application 与 Agent。
- 他半开玩笑地说，如果 AWS 今天才创立，也许会叫 Amazon Agent Services。

![](/blog/youtube/HA7lZd7zk3M/03-traditional-vs-agent-cloud-08m34s.png)

- 传统 Web 追求近乎即时的 request/response。Rauch 引用 Amazon 的经验称，每增加 100 ms 延迟会降低约 1% 转化率；Agent 则可能思考几秒、几分钟、几小时甚至一整天。
- 因此 Agent Cloud 必须支持长时间后台运行、状态保存、流式进度和最终结果交付，而不是只优化短连接页面加载。

## 10:30｜Agent-written code 引发新的计算需求

- EC2 的弹性计算最初服务人类写的软件，需求上限受开发者数量约束。
- 当 Agent 同时生成、修复、保护和攻击软件时，计算量不再只与人类程序员数量相关；每个 Agent 都可能启动大量短暂环境并反复执行代码。
- 云交付的商品也从像素扩展到 token。按席位收费的 SaaS 经济会与按 token、按任务或按资源使用量计费并存。

## 12:15｜页面不会消失，人类界面可能反而更丰富

- Rauch 并不认为 Agent 会让视觉体验失去意义。人仍要查看结果、做决定，也仍会访问品牌和产品界面。
- 他用 Microsoft Encarta 与 Wikipedia 对比：早期数字百科有互动、沉浸式体验，后来的网页常退化成大段文字。
- 视频生成、3D 生成和即时渲染可能让 Web 再次变得更具表现力。Agent 在后台工作，pixel-based experience 负责把成果呈现给人。

## 13:28｜Agentic infrastructure 的三条边

- 第一条边是给 coding agent 提供部署基础设施：Claude Code、Codex、v0 等生成的软件需要安全、快速地运行。
- 第二条边是让组织构建自己的 Agent。Rauch 举出 AI-native school 的构想：产品的主体可能是服务教师和学生的 Agent，而不是一组相互链接的网页。
- 第三条边是基础设施本身由 Agent 自动管理：发现性能下降、配置资源、生成修复、提交 PR，甚至在验证效果后直接发布。

## 14:42｜模型的默认选择是一种新的分发渠道

- Coding agent 带有从训练数据和互联网内容中形成的 world model。Next.js、React 和 Vercel 长期积累的大量文档、示例与开源代码，使模型熟悉这些技术。
- Rauch 引用一份报告称，shadcn 在相关 UI 组件选择中达到 90.1%，Vercel 在样本中的前端部署选择为 86/86。

![](/blog/youtube/HA7lZd7zk3M/04-agent-defaults-15m30s.png)

- 这些数字来自嘉宾展示的报告，不能简单等同整个市场份额；但它揭示了新的增长机制：产品不仅争取人类开发者，还要适合 Agent 搜索、理解、组合和调用。
- Rauch 将这种生态称为 block economy。Agent 理论上可以每次重写内核和网络栈，但复用可靠积木更省 token、时间和风险。

## 16:50｜支持 Agent 与“token 的 CDN”

- Rauch 称 Vercel 自己的客服 Agent 已回答约 93% 的用户咨询，并让公司能向更多用户提供免费支持；团队还比较用户与 Agent、人工客服交互后的满意度。
- AI Gateway 被他类比为 token 的 CDN：来自不同模型提供商的 token 也需要观测、故障切换、安全、加速、缓存和负载均衡。

![](/blog/youtube/HA7lZd7zk3M/05-agent-infrastructure-blocks-18m01s.png)

- 语义路由可以把简单请求交给更小模型，例如无需动用昂贵前沿模型回答一句“you're welcome”；semantic cache 则减少重复推理。
- 这一类中间层把原来用于页面和像素的互联网基础设施经验，迁移到智能流和模型调用。

## 19:10｜Sandbox 是 Agent 的电脑，也是新的安全边界

- Rauch 说模型在 post-training 阶段会使用 Docker container 等小型计算环境；上线后，给 Agent 一台能运行代码和工具的电脑，往往能提高其实际能力。
- 类比新员工入职时领取预装软件的笔记本，Agent 也需要预置工具、权限、网络和数据访问。
- 但电脑革命带来了病毒、钓鱼与欺诈，Agent sandbox 同样可能被诱导泄漏或外传数据。围绕隔离、凭据、出站访问和行为治理，会出现新的网络安全产品。

## 20:45｜Self-driving cloud：从 PagerDuty 转向自动修复

- Rauch 用 Stripe 创始人听到“鸭叫”就因旧 pager ringtone 紧张的故事说明，传统大规模运维具有强烈的人力和心理成本。
- 他设想云像自动驾驶汽车：持续监控、调参、修复性能问题，并向工程师报告“已让系统快一倍，这是 PR 和实际转化效果”。
- 这不是声称人工运维已经消失；他明确承认今天仍要监控系统、处理故障，只是自动化边界会不断扩张。

## 22:16｜Meta、Notion 与“Agent 的 AWS”

- Rauch 称 Meta 在既有内部基础设施之外使用 Vercel，让使用 coding agents 的团队更快制作工具，并加速部分 Meta Superintelligence Labs 工作和 Meta.AI 的交付。这是供应商对客户案例的描述。
- Notion 则在从知识工具向 Agent 产品演进，例如课堂转录和整理可以成为后台 Agent。
- Vercel 的定位由此从前端部署平台扩展为全栈 Agent Cloud：从开发工具到运行、网关、沙箱和工作流。

## 24:14｜SaaS 不一定死亡，但“最低公分母软件”正在失去优势

- 传统 SaaS 需要产品经理和设计师寻找能服务最多客户的一套通用 UI，再让不同公司调整流程去适配产品。
- Coding AI 让高度定制的软件成本下降。Rauch 举例，一家公司的 CEO 用 v0 生成停车场管理软件，替换原产品并节省费用。

![](/blog/youtube/HA7lZd7zk3M/06-vibe-coded-parking-26m02s.png)

- Vercel 内部也重新制作了面向销售人员的 Salesforce 呈现层：用很小团队生成账户研究、商机信息和推介建议。
- 但他们仍复用 Salesforce 的数据库与工作流。Rauch 的判断不是“全部推倒”，而是 presentation layer 更可塑，system of record、ACL、稳定工作流和数据基础继续存在。
- 能提供 MCP、CLI、API 和 headless 接口的 SaaS 更容易成为 Agent 的积木；只提供封闭 UI 的产品更危险。

## 28:21｜一次性软件与 AI 的 reflexivity

- 软件可能只为一次销售会话存在：销售工程师在见客户前生成定制 demo，需求变化后直接丢弃重做。
- Rauch 因此说软件正在趋近免费或可抛弃，但这反而提升使用频率。用户一旦知道只需一个 prompt 就能用高保真软件表达想法，就很难回到纯幻灯片和口头描述。
- 他借用 Shopify CEO Tobi Lütke 的 “reflexivity of AI”：更低成本促使更多尝试，更多尝试又增加平台调用、部署和反馈。
- 同时，复杂 Agent 基础设施仍可能需要多个 Agent 与资深工程师共同核查一行代码。低端软件免费，不等于所有工程问题都变简单。

## 30:40｜客户与供应商之间将出现 Agent-to-Agent 反馈闭环

- 新用户甚至不知道 Vercel 是什么，是 coding agent 自动选择平台并完成部署；遇到错误后，用户只带来 Agent transcript。
- Rauch 设想未来由客户 Agent 直接向平台 Agent 提交 bug 和 feature request，平台 Agent 再根据 token 预算、期限和组织偏好排序并修复。
- Evals 会从人工反馈和失败轨迹中产生，软件迭代逐渐成为 Agent 对 Agent 的协作过程。

## 32:45｜为什么 Tailwind、React、Next.js 适合 Agent

- Rauch 认为默认选择并非单靠商业合作，而是长期开放内容、可用 API 和技术设计共同形成的结果。
- 他特别强调 Tailwind 的 local reasoning：组件样式与组件本身紧密绑定，移动到其他位置时仍可独立理解和复用。
- 这种代码在人类眼中可能冗长、不够优雅，却降低了跨文件依赖，更适合有限 context window 的模型。
- React 和 Next.js 也强调组件化、局部推理与 composability。Agent 无法把全世界代码都装进上下文，所以能独立理解的积木具有经济扩展性。

## 36:17｜为什么 Vercel 要覆盖整条 Agent 栈

- 主持人指出 Vercel 同时做 AI SDK、Gateway、Chat、Fluid Compute、Sandbox 和 Workflow，分别都足以形成独立公司。
- Rauch 的回答是“对真正重要的对象做完整栈”：如果 Agent 是关键软件类别，就不能只参与表层部署。
- 产品扩张仍受 dogfooding 约束。AI Gateway 复用了页面 CDN 的约 95% 核心能力；Sandbox 复用了每次部署都会创建的虚拟化与短暂计算环境。
- 他称 coding agent 流量快速增长时平台大体保持稳定，说明旧 Web 基础设施并非作废，而是能被重组成 Agent 产品。

## 40:11｜价值最终取决于是否交付有用结果

- 当前价值大量集中在模型以下的芯片、数据中心、电力和制冷。Rauch 认为上层能否获得价值，取决于 AI 是否真的创造可用产品和服务。
- Coding agents 是他眼中最有希望的方向之一，因为模型只有获得 sandbox、部署平台、域名和网络能力后，才能把代码变成现实结果。
- 域名是一个看似传统但重要的入口：人类和 Agent 都希望给作品命名，DNS 配置越简单，平台越可能成为想法落地的第一站。
- 安全、治理与 guardrails 仍有大量空白。他不认同“工程师已经结束”，反而称 coding agent 带来的需求让 Vercel 持续需要招聘工程师。

## 44:02｜谁会承压：静态内容、拖拽工具与封闭销售流程

- Rauch 对静态数据或内容聚合业务较悲观，以 Stack Overflow 类问答库为典型例子；模型能直接吸收并生成答案，原有访问模式被改变。
- 他也看空以“代码稀缺、普通人无法编程”为前提的 drag-and-drop builder。自然语言 coding agent 能提供更少约束、更贴合需求的结果。
- 另一类风险来自不开放的企业软件：Agent 希望直接接触原始数据和 API，而不是用三个月访谈需求、再等待多年销售流程。
- 他看好的产品特征是即时注册、消费计费、直接获得 token 或 API，并能以机器需求的速度扩容。

## 46:13｜从固定 rate limit 转向无法预估的 Agent 需求

- 人类团队过去可以假定“一家公司不会每分钟部署超过 100 次”，据此写入固定限额；Agent 平台的实际流量会轻易突破这些人为假设。
- Rauch 用“No more rate limits”作为内部挑衅式原则，意图让团队别把历史需求上限当成真理。
- 他也承认运营健康、防滥用和 KYC 仍要求限制与风控；不能让匿名用户瞬间制造无法回收的超级计算账单。
- 按量计费与更高容量相互配合：只要客户为资源付费，平台就应尽量减少阻止有效使用的任意障碍。

## 48:10｜如果不做 Vercel：太空与能源

- Rauch 会关注 space tech，理由与基础设施工程师的高可用思维一致：多行星像 multi-region、multi-zone 和多层 failover。
- 他也对裂变、聚变和地热等能源技术感兴趣，并把 AI 描述为双向转换：能源输入，智能输出。
- 这仍是个人愿景。课程在“如何让能源与计算支持更多智能”这一开放问题上结束。

## 一句话复盘

当 Coding AI 让代码和定制界面趋近免费，稀缺性会转向可组合的开放积木、可靠部署、长时间 Agent 运行、token 路由、安全治理和真实用户反馈；软件没有消失，而是在从静态产品变成持续生成、运行和自我改进的服务。
