---
title: "How we built Grok Bot in a month | Roman Ugarte (SpaceXAI)"
description: "Lenny's Podcast 笔记：SpaceXAI 的 Roman Ugarte 讲述四周做出 Grok Bot——隔离小团队、云-first、每个 bot 一台电脑，以及从 has 转向 can 的产品哲学。"
pubDate: 2026-09-08
updatedDate: 2026-09-10
slug: "how-we-built-grok-bot"
category: null
tags: ["youtube转录", "Grok Bot", "Agent", "产品"]
status: published
draft: false
published: true
source: "https://www.youtube.com/watch?v=maSdsTLaMuU"
---

来源：[YouTube 原视频](https://www.youtube.com/watch?v=maSdsTLaMuU)（Lenny's Podcast · Roman Ugarte）


> **来源说明**
> 本文根据 YouTube 英文自动字幕整理。Kimi WebBridge 在页面中发现并确认了 `en` 自动字幕轨道，因 YouTube 页面字幕面板未正常显示，最终用 yt-dlp 将同一字幕资源保存为 VTT，再整理成可读文本。文中关于产品效果、公司文化和竞争格局的判断，均按主持人 Lenny Rachitsky 与受访者 Roman Ugarte 的表述归纳，未作独立验证；自动字幕偶有将 “Grok Bot” 识别为相近拼写的情况，本文已按正式名称统一。

## TL;DR

- Roman 说，Grok Bot 由一个与公司其他团队物理和沟通上都相对隔离的小组孵化，从第一行代码到内部可用原型约四周，再用约三周推向公开发布。小团队的价值在于每天能快速完成大量相互关联的微小决策。
- 团队没有把知识工作能力塞进 Cursor，而是从零设计独立产品：面向非技术用户、云-first、每个 bot 都像拥有自己的电脑，并把复杂工具调用藏在后台。
- 早期约两周内，核心团队亲自 onboarding 两三百名用户。目的不仅是修复卡点，也是在不诱导用户的前提下验证行为模式，例如多个专业 bot 之上出现一个负责分派任务的 “chief of staff”。
- 产品哲学不是 “Grok Bot now has…”（又多了一个按钮），而是 “Grok Bot can now…”（现在能完成什么工作）。团队主动 unship 功能、减少像素，把资源集中在可靠登录、浏览器操作和完整完成任务等后台能力。
- Roman 将产品的长期形态描述为一组长期存在、拥有记忆、工具和独立运行环境的 AI colleagues。真正的跃迁不是替用户做完 90%，而是能放心交付、回来即可验收的 100% 委托体验。
- 对团队和创业者，他强调持续重做产品、把未来几个月才可能实现的能力提前拉到今天；护城河通常由用户痴迷、分发和数据反馈在过程中“发现”，而不是先从战略图倒推。

## 一、四周从空白页做到内部产品（02:09–08:40）

Roman 回忆，团队一直想把在开发者 agent 上积累的经验带到更广泛的 knowledge work，但没有从既有界面继续叠加功能，而是从空白页开始。

- 核心团队只有几个人，在办公室单独区域工作，也使用私密 Slack 频道。
- 从第一行代码到公司内部发布可用原型约一个月。
- 他认为，隔离并非为了神秘，而是为了让同一小群人每天快速处理大量产品细节；如果一开始就用大团队围绕 6–12 个月路线图协调，很可能无法形成现在的一致体验。
- 内部全员发布后，不只是工程师，其他职能也开始把日常 agentic tasks 从聊天工具迁到 Grok Bot。团队把这视作第一次现实压力测试，随即转向面向大量外部用户的扩容和发布准备。

![01-origin-story](/blog/youtube/maSdsTLaMuU/01-origin-story.svg)

## 二、为何不把它做成 Cursor 的一个标签页（08:40–11:20）

把 Grok Bot 做成独立产品并非显而易见。Roman 承认，coding agents 本来也能处理不少非编程工作，但现有产品会带来几类包袱：

- 开发工具的界面和品牌会让非技术用户感到门槛；
- 每出现一种工作形态就增加一个 tab，容易把不同团队的组织结构直接“发货”给用户；
- 多种产品理念挤在同一屏幕里，很难形成面向知识工作的完整体验。

因此团队选择控制新产品的每一个像素，以“一致、简单、强大”的 bot-native experience 为目标。Roman 也保留了开放性：未来可能把其他产品中的用户和工作流带进来，但起点必须是知识工作本身，而不是旧界面的延伸。

## 三、亲自 onboarding 近三百名用户（11:20–14:29）

内部原型之后，团队约用两周亲自 onboarding 两三百人。前几次体验并不顺利：电脑环境启动太慢、流程令人困惑等问题，会让核心团队在电话里直接感受到用户的等待。这样的现场压力使问题从“以后优化”变成“明天下一场 onboarding 前必须修好”。

这批用户也不只包括熟悉 AI 产品的意见领袖。Roman 特别提到一位咖啡店主：对方把 Grok Bot 用于小企业运营，能反馈 Shopify 集成、商品文案等内部 dogfooding 很难暴露的问题。团队借此主动离开 Silicon Valley AI bubble，理解非开发者和主流商业用户。

一个自然出现的组织方式是：用户先建立 5–10 个负责不同工作泳道的 bot，随后把表现最好的一个“晋升”为 chief of staff，由它接收请求并把任务分派给其他 bot。团队没有在 onboarding 时灌输这种用法，而是观察外部用户是否也会自行形成同样模式；验证后才在产品中适度鼓励，同时避免把它做成不可逆的唯一结构。

## 四、隐藏内部机制，并主动删掉功能（14:29–23:50）

Roman 认为，用户不需要看到 agent 的每个 tool call、点击动作或连续思维文本，就像不会要求同事逐秒汇报按了哪个按钮。Grok Bot 只提供适量进度更新和正在工作的状态；用户反馈显示，他们可能想看待办事项或粗粒度优先级，但并不想阅读冗长的内部过程。

从内部 beta 到公开发布约三周，团队的主要工作之一是 **unshipping**：移除早期为了调试而暴露的模型内部信息、具体记忆和偏开发者的观测界面。

![02-unshipping](/blog/youtube/maSdsTLaMuU/02-unshipping.svg)

另一项工作是让产品 “just work”。这并不主要表现为发布更多菜单，而是反复改善几个后台瓶颈，例如：

- bot 能否可靠登录网站；
- 是否能看清浏览器页面并准确点击 Salesforce 等系统中的控件；
- 一条真实业务工作流能否从开始走到完成，而不是中途卡住。

Roman 说，销售团队尤其能体现 computer use 的价值：许多销售软件缺少可靠 API 或 MCP，过去的 AI 工具会卡在流程中；给 bot 一台可操作的“电脑”后，它更像新加入团队、拿到笔记本即可工作的助手。团队用具体失败案例推动基础设施改进，每解决一类问题，就会立刻解锁一批原本无法完成的任务。

## 五、从 “has” 转向 “can”（23:50–30:02）

招聘团队是另一个早期重度用户。Roman 描述了一种 always-on sourcing 工作流：持续查看会议网站的新论文 PDF，识别新的合著者，写入表格，研究背景，再检查公司内部是否有人与候选人相识并请求引荐。AI 负责大规模搜集和整理，人类招聘者集中精力建立关系、说服候选人。

团队用一句话检查产品工作是否值得做：如果无法写出有说服力的发布说明，用户也不会直接感受到变化，可能就不该做。更具体地说，产品语言应从：

- “Grok Bot now **has** …”：又有一个按钮、下拉框或配置页；
- 转为 “Grok Bot **can now** …”：现在能可靠完成一种新工作。

自动化是例子。传统产品要求用户打开侧栏、选择 trigger 和 action；Grok Bot 倾向于让用户直接说“每天早上 8 点提醒我”，后台自行建立例程。Roman 称平台上绝大多数自动化都通过自然语言创建。这里的核心不是取消一切控制，而是让不需要用户理解的能力尽量“不占像素”。

## 六、两个关键决定：云-first 与每个 bot 的电脑（30:02–35:54）

Roman 把突破归因于两个早期决定。

第一，运行环境全部放在云端。用户不必判断任务运行在本机还是云端，也不必让家里的电脑保持唤醒。bot 拥有跨设备一致的状态，可以从手机发起任务，未来甚至可以直接通话交办；它被视为独立存在的持续工作实体。

第二，bot 不只是一个云端 agent loop，还拥有自己的电脑。人类并不只通过 API 工作，也要看屏幕、点击像素、填写网页。Roman 用团队 onboarding 作类比：不会让新同事永远和自己挤在同一台电脑上、共享全部凭据，因此 AI colleague 也应有独立工作环境。

“从零开始”让团队可以重新组合这些 primitives，而不必迁就旧产品的沉没成本。他也说，许多想法并非团队凭空发明；OpenClaw 等产品已经验证了“给模型足够工具”和“把 agent 当作持续存在的帮手”这两种心智模型。Grok Bot 的工作，是把需要 Mac mini、VPN 或专业设置的做法产品化，降低到普通个人和企业可以采用的程度，并让用户无须知道 skills、slash commands 等底层抽象。

## 七、colleague-pilled：把产品问题改写成人的协作问题（35:54–47:14）

Grok Bot 的愿景是让每个人拥有一支同时帮助工作与生活的 AI bot 团队：它们能自主行动、接受方向调整，但不需要被微观管理。

![03-colleague-pilled](/blog/youtube/maSdsTLaMuU/03-colleague-pilled.svg)

团队把这种判断框架称为 **colleague-pilled**。当两种产品方案都有道理时，先暂时离开 SaaS 功能讨论，问一句：“如果是真人同事，我希望他在这个情境里怎么做？”Roman 认为，这经常能让团队快速形成共识，再倒推产品、模型和基础设施要求。

例如语音体验不应只是持续语音聊天，更像 Slack 协作中的临时 huddle：平时异步沟通，需要时快速通话、互相分享屏幕，澄清后再回到异步执行。

关于工作与个人场景，Roman 预计许多人会保留不同 bot 和权限边界，企业也有充分理由隔离数据；但“委托低杠杆工作”这一底层问题在两类场景中相近，所以他倾向于用同一个产品承载，而不是做两套完全不同的软件。主持人随后指出，真正的难题会是防止工作与个人信息交叉污染，并建立安全感。

## 八、长期记忆、角色泳道与主动型 chief of staff（47:14–53:35）

Roman 预计，随着 computer use 变得可靠，用户最终不应再进入远程虚拟机接管操作；“电脑”仍是概念上的能力，但会被产品界面抽象掉。

相比每项任务都新建 chat，Grok Bot 更强调长期存在的 agent：

- 每个 bot 对应一个稳定角色或工作泳道；
- 保留与用户长期互动的记忆，并随时间更了解用户；
- 同时使用 API、MCP 和自己的电脑；
- 不只是一次性会话，也可以和其他 bot 协作。

访谈提到一个递归式 QA 用法：在某个 bot 的电脑中运行 Grok Bot，让 QA bot 按固定工作流测试新版本、把结果写入 Notion，并和过去版本比较。这类用法把心智模型从“带连接器的 AI chat”提升为“有电脑的同事”，从而扩大用户愿意交办的任务范围。

![04-chief-of-staff](/blog/youtube/maSdsTLaMuU/04-chief-of-staff.svg)

Roman 自己还把 bot 当作 **infovore**：让它持续摄取 Slack、邮件、X 上的产品提及、内部 QA 结果等信息；普通信息进入每日摘要，真正紧急的事项才即时通知，甚至由 bot page 用户。目标是让 chief of staff 主动保护人的注意力，而不是永远等待人发起对话。要做到这一点，关键是足够低的误报率和逐渐建立的信任。

## 九、从个人 aha moment 扩散到企业（53:35–1:00:44）

Roman 把知识工作 AI 的扩散路径类比早期 Cursor：先由早期采用者在个人项目中体验巨大加速，随后因为无法忍受公司里的旧工作方式，而要求组织正式采用。

他强调公司希望构建的不是 demoware，而是能被数百万人使用、真正改变团队的实用 AI。个人生活中的新奇案例有传播价值，但下一步重点是 bot 如何进入企业系统、理解复杂组织历史、共享或隔离记忆，并与真人团队协作。

受访者将当时的 SpaceXAI 工作概括为三个支柱：

1. 面向专业软件开发的 Cursor 与 Grok Build；
2. 面向通用知识工作的 Grok Bot；
3. 训练更强通用模型的工作。

按照 Roman 的说法，共同目标是“有用的 AI”，强调 applied mindset，而不是只追逐抽象口号。这里是他对组织战略的陈述，并非本文的独立判断。

## 十、为什么 100% 与 90% 是两类体验（1:00:44–1:03:30）

Roman 的核心观点是：一个能完成 100% 工作的 AI，与只能把工作推进到 90% 的 AI，在体验上不是线性差距，而是类别差异。

如果委托后仍要持续想着它是否会失败、何时需要介入、最后还得自己收尾，那么人并没有真正卸下任务，认知负担仍然存在。真正的 delegation 更像把球传给可信任的同事：给出上下文后可以转身处理别的事情，稍后回来直接看完整结果。Roman 说，Grok Bot 是他第一次在非编程任务中持续感到这种“可以不再想它”的体验；同时也承认产品仍有大量可靠性提升空间。

## 十一、速度、持续重做与两条公司价值观（1:03:30–1:11:45）

Roman 从 Cursor 约 15 人时加入，经历团队扩展到超过一千人并成为更大组织的一部分。他认为 startup feeling 不是人数或融资轮次，而是：目标清楚、成员彼此信任、每个人高速执行，并允许一定程度的混乱来换取短时间内的巨大影响。

对于 Cursor 能在高度竞争的 AI coding 市场持续存在，他给出的解释主要是文化：从不认为已经获胜，持续更新判断，并准备每隔几个月显著重做优先级和产品。模型能力快速变化，适合两年前的产品形态不可能自动适合今天。

两条反复出现的价值观是：

- **Deleting the product**：随着模型变强，删掉为能力不足而搭建的脚手架，即使少数用户或内部成员不舍，也要让产品更简单、更贴近未来。
- **Just do the thing**：看到应该解决的问题就承担责任、拉齐所需资源并完成，不把组织变成逐层请求许可的系统。

## 十二、护城河是发现的，以及实际使用建议（1:11:45–1:18:00）

Roman 不建议创业者先从 12–24 个月后的护城河战略图倒推产品。在他看来，Cursor 更重要的循环是：观察模型未来几个月可能具备的能力，通过工程和产品把那个“尚不可能”提前拉到今天；等模型自然赶上后，删掉临时脚手架，再追逐下一段前沿。

![05-cursor-moat](/blog/youtube/maSdsTLaMuU/05-cursor-moat.svg)

这种持续交付让用户建立信任，并在过程中积累分发、数据和高频使用优势。主持人将其概括为：先做出让用户着迷的东西，护城河往往是被发现的，而不是预先规划出来的。

Roman 给新用户的建议也延续“像 onboarding 同事”的思路：

1. 给 bot 足够的工作上下文和必要工具，例如邮件、Slack 与公司资料。
2. 直接让它检查这些上下文，并建议五项可以从你手中接走的工作，以及完成它们还需要什么。
3. 不要只让它“写一封邮件”，而要尝试委托完整工作块。

给熟练用户的建议则是设计 bot 之间的协作和产物归档：让多个 bot 把摘要、研究和测试结果写入统一、易读的数据存储，形成每天可以快速消费的 digest，而不是把成果散落在许多聊天线程里。

## Lightning round（1:18:00–结束）

- 推荐书：《Cat's Cradle》与 Steven Pressfield 的《The War of Art》。
- 影视：每年重看《Casablanca》，也会看侦探剧《Monk》。
- AI 产品：喜欢 Exa，也喜欢在非典型数据集上做 semantic search 的产品。
- 长期放在门上的文字：诗作《Desiderata》，Roman 说它能让自己保持 grounded。

## 可复用的产品检查清单

- 我们是在增加可见功能，还是让 agent 真正多完成一种工作？
- 哪些过程信息确实帮助用户判断进度，哪些只是把内部噪声暴露出来？
- 如果这是一个真人同事，他需要什么上下文、权限、工具、记忆和工作环境？
- 任务失败在最后 10% 的哪个具体环节：登录、浏览器操作、权限、状态保持，还是结果交付？
- 当前界面里有哪些只是模型能力不足时期的脚手架，已经可以删除？
- 产品是否让人放心转移注意力，还是仍要求用户全程监督？

## 官方章节

- 00:00 Introduction
- 02:09 The origin story: building from scratch in one month
- 08:40 Why Grok Bot was built as a separate product
- 11:20 Manually onboarding a couple hundred people
- 14:29 Hiding internal mechanics from users
- 18:41 Timeline from beta to public launch
- 19:14 Unshipping features and simplifying
- 23:50 Early use cases and feedback
- 26:50 Product philosophy: “Grok Bot can now”
- 30:02 Cloud-first architecture
- 33:12 The fresh-start advantage
- 35:54 The vision: a true team of AI colleagues
- 39:20 The “colleague-pilled” framework
- 42:36 Work versus personal: one product or two?
- 47:14 Long-lived agents, persistent memory, and the computer abstraction
- 51:04 Grok Bot as an always-on infovore and chief of staff
- 53:35 How fast the team moves and what preserves the startup feeling
- 58:20 SpaceXAI pillars
- 1:00:44 The first 90% vs. the last 10%
- 1:03:30 Moving fast at scale
- 1:06:40 How Cursor kept winning in the most competitive market in the world
- 1:10:04 Company values: “deleting the product” and “just do the thing”
- 1:11:45 Moats: discovered, not planned
- 1:15:11 Tips for new users and power users
- 1:18:00 Lightning round and final thoughts
