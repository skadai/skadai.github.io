---
title: "《AI-native services: a $100B opportunity》讲义：卖「完成的工作」，而不是卖工具"
description: "Greg Isenberg 的判断：AI-native services 是现在最值得做的生意，背后约 1000 亿美元。本文逐段翻译他的完整指南——那笔每年 12 万美元、一直被「人」锁住的预算为什么打开了；为什么模型变强对服务生意是利好而不是利空；unit / intake / engine / rulebook / review layer / delivery / pricing / distribution 八个零件分别是什么；以及「已经外包 + 可核对」这张机会地图，和一份 2026 年具体可做的清单。6 张配图是原文原图 + 英文原句 + 中文翻译。"
pubDate: 2026-09-21
slug: "ai-native-services-100b-opportunity"
category: null
tags: ["X长文", "AI-native services", "AI 服务化", "产品化服务", "定价", "一人公司", "讲义"]
status: published
draft: false
published: true
source: "https://x.com/gregisenberg/article/2101760050108797268"
---

来源：X 长文 [《AI-native services: a $100B opportunity》](https://x.com/gregisenberg/article/2101760050108797268)（Greg Isenberg / @gregisenberg，2026-09-20）· 作者站点：[gregisenberg.com](https://gregisenberg.com) · 文中提到的点子库：[Ideabrowser.com](https://ideabrowser.com)

> **阅读说明（先说清哪些是原文、哪些是本文加的）**
>
> - 全文分两块：**① 原文逐段中文翻译**（保留作者原有的小标题体系）；**② 本文分析**（放在最后一节），是本文作者对这套方法论的判断与追问，不是 Greg 的原话。
> - ① 里的英文引文照录原文，中文为本文翻译；原文全文见 `transcript-X_2101760050108797268.md`。
> - 文中所有数字（1 万 / 12 万美元、4.6 万亿、Harvey 的 1.9 亿、EvenUp 的 5,000 万、Kick 的 70% 毛利、2,000 条记录 / 2 美元一条 / 2.4 亿美元等）**都来自作者自述**，本文没有独立核验。
> - 六张配图是「原文原图 + 当时的英文原句 + 中文翻译」的合成图，用来对上原文的每个小节。

## TL;DR

- 一句判断：**AI-native service 是现在最值得做的生意**，作者估计背后有大约 1,000 亿美元的空间。
- 核心的那个例子：企业每年为 QuickBooks 付约 1 万美元，为**使用 QuickBooks 的那个会计**付约 12 万美元。二十年里软件公司抢的是那 1 万，因为那是可以规模化卖的部分；12 万锁在「人」身上——多一个客户就要多雇一个人。现在 AI 能做会计的大部分工作，于是你可以**直接卖「完成的工作」（那本合上的账），而不是卖工具**，并且拿到软件级的毛利。
- 「AI-native」的定义不在收费方式：月付 retainer、按件计价、按用量、按节省分成都可以；**定义在于交付跑在软件上，而不是跑在人数上**。
- 为什么是现在：三件事同时到位——模型在真实工作上够用了（两年前产出是「要重做的粗稿」，现在是「要核对的成稿」）、单次运行成本从美元级掉到美分级、以及那笔钱本来就在（美国企业每年在服务上花约 4.6 万亿美元，约为软件开支的六倍）。
- 为什么是「服务」而不是 SaaS / App / 代理公司：SaaS 是「在往下走的扶梯上往上跑」（你在跟每季度都更强更便宜的基础模型竞争）；App 受 App Store 摆布、还要交 30%；代理公司卖工时、收入被人数封顶、毛利永远卡在 20–30%。而卖「完成的工作」时，**模型变强对你的生意是利好**。
- 真正的零件是八件：**unit（计价单位）、intake（受理）、engine（引擎）、rulebook（规则手册）、review layer（复核层）、delivery（交付）、pricing（定价）、distribution（获客）**。其中作者认为被最严重低估的是 **rulebook**：它才是产品。
- 落地路径五步：选一个格子 → 先手工服务 5 个客户 → **把每一个错误都记下来** → 产品化（受理变表单、交付变仪表盘、规则手册自动化）→ （可选）再把它变成软件。
- 护城河不是模型（谁都能下载同一个引擎），而是**规则手册 + 问责**：你卖的是完成的工作，所以你替客户扛错误。
- 唯一必须做对的一件事：**把工作周围的那些开销（scoping / 检查 / 管理 / 销售）压掉**。受理是表单、范围是菜单、质量是规则手册、客户管理是仪表盘——不做这一步，你只是做了一个「更快的老公司」。

## 一、背景：12 万美元一直锁在「人」身上

> For most of my career, running a service business meant pretty good living and a bad company (at least in the eyes of many VCs). You sold hours, the revenue stopped when you stopped, and the whole thing lived on a few people who could leave.

作者开场先讲自己的成见：在他职业生涯的大部分时间里，做服务生意意味着「生活不错，但公司很烂」——至少在很多 VC 眼里是这样。你卖的是工时，你一停收入就停，而且整个生意挂在几个随时会走的人身上。

> A business pays about $10,000 a year for QuickBooks. It pays about $120,000 a year for the accountant who uses QuickBooks.

这笔账他是这么算的：一家企业每年为 QuickBooks 付大约 1 万美元，为**用 QuickBooks 的那位会计**付大约 12 万美元。

> For twenty years, software companies fought over the $10,000, because that was the part you could sell at scale. The $120,000 was locked behind a human, and you couldn't scale a human without hiring another one.

二十年里，软件公司争的是那 1 万美元——因为那是唯一能规模化卖的部分。12 万美元被锁在一个人身上，而**人没法规模化，除非再雇一个**。

> That's the money that just opened up. AI can now do most of what the accountant does, which means you can sell the finished work, the closed books, instead of the tool, and you can do it at software margins.

而现在，那笔钱刚被打开。AI 已经能做会计的大部分工作，所以你可以卖**完成的工作**——那本已经合上的账——而不是卖工具，并且按软件级的毛利来收钱。

![图 1｜开篇漫画：左边是「SOFTWARE」货架（蜘蛛网 + SOLD OUT），右边是挂着「THE WORK」招牌的车间——发票、索赔、合同、档案、调研、排期、采购，机器人在传送带前干活](/blog/x/2101760050108797268/fig01.jpg)

> That's what an AI-native service is. The work is done mostly by agents, and a small team handles the parts that still need a person.

这就是 AI-native service：工作主要由 agent 完成，一支小团队处理那些仍然需要人的环节。

## 二、它到底是什么

> The simplest way to think about it: a normal service business sells a person's time. A SaaS business sells a tool and makes the customer do the work. An AI-native service does the work for the customer, and agents do most of it.

最简的区分方式：普通服务公司卖的是一个人的时间；SaaS 卖工具、把活留给客户干；AI-native service **替客户把活干了**，而且大部分是 agent 干的。

> The customer doesn't want bookkeeping software. They want their books closed. They don't want a contract-review tool. They want to know if the contract is safe to sign.

客户不想要记账软件，他们想要账是平的；不想要合同审阅工具，只想知道这份合同能不能签。客户体验到的和「雇一家事务所」完全一样——只是更快、更便宜、不会累。

> The trick is that under the hood it runs like software. The work is done by a system you built once, not by a headcount you grow forever. That's why it can be priced like a service and valued like software, which is the whole opportunity.

诀窍在于：它内里像软件一样跑。活是由你**建一次**的系统干的，而不是靠你永远扩张的人数。所以它可以**按服务定价、按软件估值**——这就是全部机会所在。

## 三、为什么是现在

> This wasn't possible 2 years ago, and the reason is a few things landing at the same time.

两年前不可能，因为几件事同时到位了。

> The models got good enough at the actual work. ... Two years ago the output was a rough draft a person had to redo. Now it's a finished draft a person checks.

**模型在真正的工作上够用了。**审合同、给医疗账单编码、起草索赔函、结一个月的账——两年前的产出是一份要被人重做的粗稿，现在是一份只需要被人核对的成稿。

> The cost of running them collapsed. A task that cost dollars in tokens now costs cents, which means your cost to deliver one more unit of work is close to zero.

**运行成本塌了。**过去要花几美元 token 的任务，现在是几美分——这意味着你「多交付一个单位」的边际成本接近零。就是这一个数字，把服务变成了带软件毛利的东西。

> And the money was always there. Businesses in the US spend about $4.6 trillion a year on services, roughly six times what they spend on software.

**钱一直都在。**美国企业每年在服务上花约 4.6 万亿美元，大约是软件开支的六倍。那就是会计、经纪、律师助理、记账员、合规专员。二十年里这笔钱碰不得，因为每一美元都挂在一个人身上；现在它是整个经济里最大的开放市场。

![图 2｜「why ai-native services now：三个变化」——模型够好了（rough draft → finished draft）、成本塌了（dollars → cents）、服务市场 4.6 万亿（比软件大得多）；底部结论：更好的模型现在是帮服务生意的，不是害它](/blog/x/2101760050108797268/fig02.jpg)

> You can see it in the companies that moved first. Harvey ... went from roughly $100 million to $190 million in annual revenue in about five months. EvenUp sells demand letters to injury firms at around $500 each ... and crossed $50 million in revenue. Kick does small-business bookkeeping for $300 to $500 a month, undercuts a human bookkeeper by half, and still runs gross margins above 70 percent. These are service businesses. They just happen to have the economics of software.

跑在前面的公司就是证据：

- **Harvey**（法律）：年收入大约五个月里从 1 亿美元做到 1.9 亿美元。
- **EvenUp**（人身伤害律所的索赔函）：一封信约 500 美元，做的是过去要吃掉律师助理 8–12 小时一天的活，收入过了 5,000 万美元。
- **Kick**（小企业记账）：每月 300–500 美元，比人类记账员便宜一半，毛利仍在 70% 以上。

这些是服务生意，只是恰好有软件的财务结构。

## 四、为什么是服务，而不是 SaaS / App / 代理公司

> SaaS is running up a down escalator. You sell a tool, and the tool competes with a foundation model that gets better and cheaper every quarter. Every time a lab ships, your product is worth a little less.

作者的论证很直接：

- **SaaS 是在一段往下走的扶梯上往上跑。**你卖工具，而工具在跟一个每季度都更强更便宜的基础模型竞争；实验室每发一次新版，你的产品就贬值一点。
- **App 受制于 App Store。**你永远在跟平台跳舞，毛利还被 Apple 抽掉 30%。
- **传统代理公司仍然卖工时**，收入被人数封顶，毛利永远卡在 20–30%。

> An AI-native service flips all of that. You sell the finished work, so when the models get better, your business gets better. Model improvement works for you instead of against you.

AI-native service 把这几条全翻过来：你卖完成的工作，所以**模型变强，你的生意变强**——模型进步对你是有利的，而不是不利的。

> The budget already exists. You're replacing a line item the customer already pays, so you don't have to convince anyone they have a problem or invent a new category. Sales is "we do what your current firm does, faster and cheaper." That is the easiest pitch in business.

**预算本来就有。**你替换的是客户已经在付的一笔开支，所以不必说服任何人「你有这个问题」，也不用发明新品类。销售话术就是「你现在的公司干的活，我们更快更便宜」。

> It cash-flows from day one. A SaaS founder guesses at product-market fit for a year before revenue. A service founder gets paid for the first job. You learn what to build by getting paid to do it.

**第一天就有现金流。**SaaS 创始人要先猜一年 PMF 才有收入；服务创始人第一单就有钱。**你是靠收钱来学会该做什么的。**

> It also much more of a personal type business. Anecdotally, my friends who run high margin, smaller businesses powered by AI seem happier.

顺带一句：这也更像一门「个人化的」生意。作者说他那些做高毛利、更小的 AI 生意的朋友，看起来更快乐——并随即引了一条 Justin Welsh 的推文作为佐证：

![图 3｜作者引用的推文：Justin Welsh（@thejustinwelsh，2026-09-11）——「我认识的最快乐的那批人，都在做更小、毛利更高、更个人化的生意。结果是他们干得更少、赚得够多，而且是为当下而活。」](/blog/x/2101760050108797268/fig03.jpg)

## 五、服务是最好的楔子

> The coolest part is that a service is the best wedge there is. You use it to get into a customer, a niche, an industry, before you know exactly what to build. You do the work, you get paid, and every job teaches you where the real pain is, what "correct" means, and which parts a machine can own. Then you productize what you learned. Then, if you want, you turn that into software. You climb from service to product with a business paying you at every rung, instead of raising money to guess.

作者认为最漂亮的一点是：**服务是最好的楔子**。在你还不确定要做什么之前，用它切进一个客户、一个细分、一个行业。你干活、你收钱，每一单都在教你真正的痛在哪、什么算「正确」、哪些环节机器可以接手。然后你把学到的东西产品化，再（如果想）变成软件。**你是从服务爬到产品，每一级台阶都有生意在给你付钱**，而不是先融一笔钱去猜。

> The biggest companies in AI figured this out already. The forward-deployed engineer model ... is a service used as the wedge into an enterprise. It's how the winners get in the door. You can run the exact same play at a smaller scale in a niche you know.

AI 里最大的几家公司早就想明白了：forward-deployed engineer（把工程师嵌进客户里，边建边交付，而不是只做咨询）就是**用服务作为切进企业的楔子**，是赢家进门的办法。你可以在一个你熟悉的细分里，用同样的打法，只是规模小得多。

![图 4｜「service is the wedge：get paid to learn what to build」——do the work（5 个客户）→ find the pain（看哪里会坏）→ write the rulebook（记下什么算正确）→ productize（表单 + 仪表盘 + 工作流）→ software（可选）；底部：是客户在给你的路线图买单](/blog/x/2101760050108797268/fig04.jpg)

## 六、八个零件

> Every AI-native service has the same parts. If you understand these, you can design one for almost any niche.

作者说每个 AI-native service 都由同一批零件组成，理解了就能给几乎任何细分设计一个：

> **The unit.** This is the single most important decision. You sell one clearly defined thing: per claim, per filing, per contract, per month of books, per report. Never per hour.

**1. 计价单位（unit）。**最重要的一个决定。你只卖一件定义清楚的东西：按索赔、按申报、按合同、按月的账、按报告。**永远不要按小时。**retainer 可以，但必须对应清楚的范围——因为你交付的仍然是那个单位，只是按月收钱。单位要有一个「完成线」，客户看一眼就能说「好了」。

> **The intake.** ... An agency takes three calls to scope one job. An AI-native service takes a form. ... If you can't define intake as a form, your unit isn't clear enough yet.

**2. 受理（intake）。**也是大多数服务公司悄悄漏钱的地方。代理公司要三通电话才能界定一单的范围；AI-native service 用一张表单。客户上传文件、填五个字段、说清要什么，就这样。**如果你没法把受理定义成一张表单，说明你的单位还不够清楚。**

> **The engine.** The AI that does the work. This is the model plus your instructions, your examples, your context about this specific industry.

**3. 引擎（engine）。**干活的 AI：模型，加上你的指令、你的例子、你对这个行业的具体上下文。第一天它基本上就是一段好 prompt 加几十个例子；随着时间推移，它会变成竞争对手复制不了的东西——因为它被你自己跑过的每一单塑造过。

> **The rulebook.** This is the real product, and almost everyone underrates it. ... After a few hundred jobs, this rulebook is the thing that makes your output trustworthy and your business defensible.

**4. 规则手册（rulebook）。**这才是真正的产品，而且几乎所有人都低估它。它是「在你的细分里什么算正确」的书面清单，以及 AI 会以哪些方式做错。作者给的例子：「居家健康记录没有生命体征就是不完整的」「索赔函必须引用治疗日期」「编码和诊断对不上时这类索赔会被拒」。**这本手册是一个错误一个错误攒出来的**——看输出、记下你抓到的每个问题。跑过几百单之后，正是这本手册让你的产出可信、让你的生意有防御力。

> **The review layer.** Where a human still looks. You decide, per unit, what ships automatically and what a person checks first. Low-stakes, high-confidence work goes straight out. Anything with money, legal exposure, or a customer's reputation attached gets a human eye. The review layer is how you own the mistakes without drowning in them, and the rulebook shrinks it over time.

**5. 复核层（review layer）。**人还在看的那一层。按单位决定哪些自动放行、哪些必须人工先看：低风险高置信度的直接出；**凡是牵扯钱、法律风险或客户声誉的，一律过人的眼睛**。复核层让你能「扛住错误而不被错误淹死」，而规则手册会让它随着时间越缩越小。

> **The delivery.** How the finished work gets back to the customer. A dashboard they log into, an email with the file, a portal that shows status. This replaces the account manager. The customer should be able to see where their job is without asking anyone.

**6. 交付（delivery）。**成品怎么回到客户手里：一个能登录的仪表盘、一封带附件的邮件、一个显示状态的 portal。**它替代的是客户经理。**客户应该不用问任何人，就能看到自己的活到哪一步了。

> **The pricing.** You've got two good options and one bad one. Per unit ... A flat monthly retainer ... The only thing to avoid is pricing tied to hours, because that chains your revenue to your headcount, which is the exact trap that made agencies bad businesses. Whichever you pick, price against the human alternative, not your costs.

**7. 定价（pricing）。**两个好选项、一个坏选项。按件计价（量可预期、客户愿意按用量付费时适用）；固定月费 retainer（客户要预算确定性、你要可预期收入时适用，Kick 的 300–500 美元/月就是这个）。**唯一要避开的是按小时定价**——那会把你的收入锁在人数上，正是让代理公司变成烂生意的那个陷阱。另外：**对着「人力的替代价」定价，而不是对着你的成本定价。**如果事务所收 2,500 美元，你收 800——客户觉得捡了便宜，你觉得是暴利，因为你多交付一单位的成本接近零。

> **The distribution.** ... the honest answer is cold outbound to a tight list of the exact person who writes the check, plus one lead magnet: do the first job free. ... You don't need an audience. You need a channel to the buyer, and a free first job is the fastest one there is.

**8. 获客（distribution）。**多数细分里，诚实的答案是：**对着一份很窄的名单做冷启动外呼**，名单就是那些真正签字付款的人；再加一个钩子——**第一单免费**。一家居家健康机构免费拿到十条记录审阅、看到了三个自己漏掉的问题，当天下午就会变成客户。内容也行（如果你本来就在做内容），跟这些企业已在用的软件做合作、在人人认识人的细分里做转介绍也行。**你不需要受众，你需要一条通向买家的渠道**，而「免费做第一单」是最快的那条。

## 七、一个完整走通的例子

> Take home health note review. A mid-size agency produces around 2,000 visit notes a month and pays a nurse reviewer roughly $70,000 a year to check them, because an incomplete note gets the claim denied or flagged in an audit.

拿**居家健康上门记录审阅**举例。一家中型机构每月产出约 2,000 条记录，付一位护士审阅者大约 7 万美元年薪来检查它们——因为一条不完整的记录会被拒付或在审计里被标记。

- **单位**：一条被审阅的记录。
- **受理**：一次上传，机构把当天的记录丢进来。
- **引擎**：每条记录对着你建好的规则手册跑一遍——那二十条会导致拒付的问题：缺生命体征、用药变更写得含糊、护理内容撑不起所报的等级。
- **复核层**：干净的记录直接回传，有风险的标记出来给人快速看一眼。
- **交付**：一个仪表盘，显示每条记录、哪些通过、哪些要修——机构不用问任何人。

> You charge $2 a note. That's $4,000 a month from one agency, and your cost to run a note through the model is a few cents. Ten agencies is $40,000 a month. Fifty is $2.4 million a year, and one person can run it, because the intake is an upload, the checking is a rulebook, and the delivery is a dashboard.

你按每条 2 美元收费：一家机构一个月 4,000 美元，而一条记录跑模型的成本是几美分。十家机构 = 每月 4 万美元；五十家 = **一年 240 万美元，而且一个人就能跑**，因为受理是上传、核对是规则手册、交付是仪表盘。

> You started by reviewing notes for five agencies by hand, and the rulebook you wrote doing that is now the whole product.

而你起步的方式，是手工替五家机构审记录；你在那过程中写下的规则手册，现在就是整个产品。

![图 5｜「one real example：home health note review」——2,000 条记录/月 → AI 逐条检查 → 有风险的转人工 → 仪表盘回给机构；2 美元/条、每家机构 4,000 美元/月、十家 = 4 万美元/月；底部：无聊细分里的规则型工作可以是一门真正的生意](/blog/x/2101760050108797268/fig05.jpg)

## 八、怎么建：五步

> First, pick a box on the map (below). You want work that a company already pays an outside firm to do, and that has a checkable right answer. Both of those matter.

1. **在地图上选一个格子。**你要的是：**企业已经在付钱给外部公司做**、并且**有可核对的标准答案**的工作。两条都重要。

> Second, find five customers and do the work for them, mostly by hand. Use AI as the engine, but read every single output yourself before it goes out. This is not the product yet. This is how you learn what correct looks like...

2. **找五个客户，手工把活做了。**用 AI 当引擎，但每一份产出在出门之前你自己都要读一遍。这还不是产品，这是你学会「什么算正确」「AI 在哪里崩」「客户真正在乎什么」的方式——几周就能学到，靠 PPT 猜是一辈子也猜不到的。

> Third, write down every mistake. Each time you catch something wrong, add it to the rulebook. ... That list is your product. Nobody else has it.

3. **把每一个错误都记下来。**每抓到一个错，就加进规则手册。几十单之后你就有了一份「这个细分里反复出错的二十件事」的清单。**那份清单就是你的产品，别人没有。**

> Fourth, productize. Fix the scope, fix the price, turn intake into a form, turn delivery into a dashboard, and run the rulebook automatically.

4. **产品化。**固定范围、固定价格，受理变表单，交付变仪表盘，规则手册自动跑。这时一个人能扛五十个客户，生意有软件的毛利、服务的销售周期。作者说大多数这类生意**就该停在这里**，而且这里是个好地方。

> Fifth, and only if you want to, turn it into software. ... you built the software by doing the work first instead of guessing what to build.

5. **（只在你想要的时候）变成软件。**规则手册和工作流稳了之后，让客户自助使用，就完成了从「产品化服务」到「产品」的跳跃，也是估值最高的地方——但这是你挣来的，因为你是**先干活再写软件**，而不是猜着写。到这一步再融资也不迟。

## 九、机会地图

> Two questions decide almost everything about whether an idea works. One: does the customer already pay an outside firm to do this? ... Two: is there a checkable right answer?

两个问题几乎决定了点子的成败：

1. **客户是不是已经在付钱给外部公司做这件事？**是——预算存在、范围已经被定义过、换到你这儿没有成本。如果他们自己做——你是在试图替换别人的员工，这场对话难得多。
2. **有没有可核对的标准答案？**如果产出能对着规则验证，AI + 你的规则手册就能拿下来；如果需要真正的判断，就必须有人留在环里。

放进一个 2×2 就是四个格子：

| 格子 | 判断 | 做法 |
| --- | --- | --- |
| **已外包 + 可核对** | 「在这里动手」，甜蜜点 | 你是他们已经在付钱的那家事务所的更快更便宜版本，而且你能证明活干对了 |
| **可核对 + 自己做** | 真机会，但更难卖 | 把它定位成「团队保留的工具」，而不是替代某个人 |
| **已外包 + 判断重** | 留人 + 收溢价 | AI 做准备工作，人做决定，价格可以贴近老事务所的水平 |
| **自己做 + 判断重** | 跳过 | 那是一份工作，不是一门生意 |

![图 6｜「ai-native services opportunity map」——纵轴可核对 ↔ 判断重，横轴自己做 ↔ 已外包；右上角「build here」列出了医疗编码、保险报价、租约摘录、监管申报、索赔函；左下角标着「skip：that's a job, not a business」；底部：去找有人付费、可重复、按规则走的工作](/blog/x/2101760050108797268/fig06.jpg)

## 十、具体机会清单

> Here are real top-right boxes, each with the unit you'd sell. None are glamorous. That's on purpose.

作者列的「右上角」清单，每条都注明了卖的单位；都不光鲜，是故意的：

- **医疗账单与编码**：按索赔。诊所本来就在外包；编码错了就会被拒付，所以「正确」是可核对的，而且漏一次很贵。
- **商业保险报价**：按保单。经纪的核心工作就是比价、填表——大部分是任务，产出可核对。
- **报关与货运归类**：按票。每批进口都需要正确的编码和单据；规则驱动、文档密集、错了很贵。
- **持牌企业的合规申报**：按申报。金融、食品、医疗都在付钱请专人跟严格规则，而规则本身就是规格书。
- **租约摘录与产权文件**：按文件。商业地产堆满了这类活，而且早就在外包。
- **RFP 与申请书撰写**：按提交。主要是结构和先例，预算本来就在那笔预算行里。
- **房产税申诉**：按申诉 + 分润。已外包、可核对，而且**客户赢了才付钱**（作者说他最近刚做过，付了事务所 50% 的节省额；同样的服务你可以只收 10%）。
- **居家健康上门记录审阅**：按记录。记录不完整就会被拒付，机构今天还在人工看。
- **人身伤害律所的索赔函**：按封。初级律师每封要花几小时；结构可复制、产出可核对。
- **应付账款异常处理**：按异常。公司付钱请人追那些对不上的发票，而「对不对得上」就是一条规则。

> Look at the pattern. Each one is work a business already pays someone to do, has a right answer you can check, and lives in an industry running on old software that hates the process. That combination is the tell. When you find it, you've found a business.

看这个模式：每一条都是**企业已经在付钱请人做的事**、**有可核对的标准答案**、并且**处在一个还在用老软件、且恨透这套流程的行业**里。这三条凑齐就是信号——碰到它，你就碰到了一门生意。

## 十一、护城河：规则手册 + 问责

> The first question every founder and every investor asks is: why won't the customer just do this themselves with ChatGPT? The answer is that they don't want a tool, they want it done, and they want someone on the hook when it's wrong.

每个创始人、每个投资人都会先问：客户为什么不自己用 ChatGPT 做？答案是：**他们不想要一个工具，他们想要活被干完，而且干错了要有人负责。**诊所不会让前台把索赔贴进聊天机器人然后祈祷。他们要的是一家知道「被拒的索赔长什么样」、这个错已经抓到过三百次、而且真漏了会替你修的机构。你的规则手册和你的问责就是产品；模型只是引擎，而引擎大家都有。

> So the moat is not the model. It's the rulebook, the hundreds of edge cases you caught and wrote down in one narrow niche. A competitor can download the model in an afternoon. They can't download three hundred jobs' worth of your mistakes.

真正的护城河：当你卖完成的工作，你就**拥有错误**。软件公司发个 bug、打个补丁；一家把索赔报错的事务所是真的出事了，客户生气是应该的。所以护城河不是模型，而是**规则手册**——你在一个很窄的细分里抓出来并写下来的几百个边缘情况。**竞争对手一个下午就能下载同一个模型，但下载不了你三百单的错误。**

> That's also why the review layer matters. It's what lets you own the mistakes without them owning you, and it's the thing that shrinks as the rulebook grows.

这也是复核层重要的原因：它让你扛住错误而不被错误吞掉，而且它会随着规则手册的生长而缩小。

## 十二、唯一必须做对的一件事

> Most people building "AI agencies" point the AI at production and leave everything else the way it was. That gives you a slightly cheaper agency. The reason agencies were never great businesses was the overhead around the work, scoping, checking, managing, selling, all of which grew with every client.

大多数做「AI 代理公司」的人，只是把 AI 指向生产环节，其他一切照旧——那只会让你得到一家稍微便宜点的代理公司。代理公司从来不是好生意，原因在**工作周围的开销**：定范围、检查、管理、销售，而且这些开销**随每个客户一起长**。

> An AI-native service collapses that overhead on purpose. Intake is a form. Scope is a menu. Quality is a rulebook. Account management is a dashboard. Do that and the business behaves like software. Skip it and you've just built a faster version of the thing that never worked.

AI-native service 是**故意把这些开销压扁**：受理是表单、范围是菜单、质量是规则手册、客户管理是仪表盘。做到这些，生意就像软件一样；跳过这些，你只是做出了那个「本来就不行」的东西的加速版。

> And the coolest part is if you ever want to sell that business, your margins might be 60-80%. So you can command a life changing exit on something like a 6-12X EBITDA exit.

作者补了一句退出视角：如果哪天你想卖掉这门生意，毛利可能是 60–80%，那么 **6–12 倍 EBITDA 的退出**是够改变人生的。

> Pick a unit. Build the intake, the engine, the rulebook, the review layer, and the delivery. Price against the human, per unit or on a retainer. Start by doing the work by hand for five customers, write down every mistake, then productize. The $120,000 that was locked behind a person is open now! Go find yours.

收尾就是全文的浓缩：**选一个单位。建好受理、引擎、规则手册、复核层和交付。对着人力定价，按件或按月。先手工服务五个客户，记下每一个错误，然后产品化。**那 12 万美元一直锁在一个人身上，现在已经打开了——去找属于你的那笔。

## 本文分析

以下是我的判断，不是 Greg 的原话。

**这套说法立得住的地方，是它把「卖什么」讲清楚了。**「卖完成的工作，而不是卖工具」不是包装，它同时解决三件事：客户不用改变行为（照旧拿结果）、预算不用重新申请（替换已有开支）、以及模型变强对你有利（你卖的是结果，不是某个能力）。相比之下，「套壳 ChatGPT 的 SaaS」这三条一条都不占。

**「规则手册」这个提法值得单独拎出来。**它把「领域知识」从一种感觉，变成了一件可以盘点、可以交付、可以继承的具体资产——一本记录「什么算对、AI 会怎么错」的清单。它同时是质量系统、是定价依据、也是尽调时唯一能拿出来给人看的东西。作者说「竞争对手一下午就能下载同一个模型，但下载不了你三百单的错误」，这句话是全文最结实的一句。

**但有几处需要打问号。**

1. **数字全是自述，且口径不一。**Harvey 的 1 亿 → 1.9 亿、EvenUp 的 5,000 万、Kick 的 70% 毛利，都没有出处和口径（是 ARR 还是收入？含不含服务费？）。文中所有算术都是「作者说的」，当作方向而不是事实。
2. **「可核对」这件事比文中描述得更难。**「按规则可验证」在医疗编码、报关归类这类强规则领域确实成立；但作者同时把「RFP 与申请书撰写」放进了右上角——这类活的价值恰恰在判断和语境，不是对错。**一个领域的检查成本，往往就是它能不能做的分水岭**：检查比生产还贵的地方，规则手册救不了你。
3. **责任是被低估的那一半成本。**文中说「客户要有人负责」，这是护城河，也是负债：医疗计费错一次是拒付，租约摘录错一次可能是诉讼。真正约束这门生意的不是模型能力，而是**你有没有能力承担错误的代价**（保险、合规、留痕、以及「什么必须过人的眼睛」这条线的划法）。复核层不是成本项，它是这门生意的牌照。
4. **「一个人跑五十家客户」只在极窄的条件下成立。**成立的前提是：受理真的能做成表单、例外率足够低、且客户不需要「跟人说话」。一旦例外率上去了，复核层就会重新长成一支团队——那时你只是把代理公司的问题往后推了六个月。
5. **「4.6 万亿服务市场」不等于 4.6 万亿的可得市场。**能被规则化 + 可核对 + 已外包的那部分，是这笔钱里很小的一块；作者的价值恰恰在于给出了「怎么找那一小块」的方法（2×2 地图），而不是那个总量数字。

**如果只照抄一件事**：不是「去做个 AI 代理公司」，而是**先选一个单位，手工服务五个客户，把每个错误记下来**。这三步不依赖任何模型能力，也不依赖任何融资，而且无论后面走不走产品化，产出都留在你手里。作者说这五单「不是产品」，其实它比产品更值钱——它是产品的地基。
