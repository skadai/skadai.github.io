---
title: "《当 AI 泡沫的钱烧完了》：Ben Thompson 谈大科技、中国与 AI 资本周期"
description: "Ben Thompson 在 Invest Like The Best 第 487 期里讲了 80 分钟：为什么「美国赢下 AI 竞赛」对世界是危险的；为什么这轮 AI 最近在眼前的约束不是算力、电力，而是「钱」——以及 1870 年代铁路的久期错配；为什么消费者 AI 最终只能靠广告；为什么台积电其实是把风险转嫁给了大科技公司；为什么「待在不在前沿」对数字公司来说才是真正的风险；以及英伟达最怕的不是别人造出更好的芯片，而是电力变得便宜。含 8 张双语配图。"
pubDate: 2026-09-26
slug: "iltb-487-ben-thompson-ai-boom-runs-out-of-money"
category: null
tags: ["Ben Thompson", "Stratechery", "聚合理论", "AI 泡沫", "资本开支", "大宗商品", "台积电", "英伟达", "Meta", "讲义"]
status: published
draft: false
published: true
source: "https://www.youtube.com/watch?v=h-0NZ-oIjlk"
---

来源：[What Happens When the AI Boom Runs Out of Money](https://www.youtube.com/watch?v=h-0NZ-oIjlk)（Invest Like The Best 频道上传版，全长 01:20:10）· 对谈人：Ben Thompson（Stratechery 作者，「聚合理论」提出者）· 主持：Patrick O'Shaughnessy（Colossus / Invest Like The Best）· 录制时间：2026 年 8 月

<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/h-0NZ-oIjlk"
    title="What Happens When the AI Boom Runs Out of Money — Ben Thompson on Invest Like The Best"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    loading="lazy"
  ></iframe>
</div>

> **阅读说明（先说清哪些来自这场对谈、哪些是本文加的）**
>
> - 本文是这场 80 分钟对谈的**结构化讲义**，按主题顺序走：AI 竞赛与中美 → 钱（铁路与久期错配）→ 能力边界与推理成本 → 广告 → 大宗商品与风险转移 → 各家大科技的位置 → 微软的 IBM 剧本 → Meta 与注意力 → 英伟达与电力。每节都标了对应时间点，可以跳着看。
> - **引文**都是对谈中的原话（**英文原句照录**，中文为本文翻译）；标为「**本文补**」的部分是本文补的背景、对照与质疑，**不是他的原话**。
> - **关于来源与时间轴**：这段视频是同一期播客（Invest Like The Best #487，2026 年 8 月 18 日发布）的 YouTube 上传版。视频版在本机无法下载（YouTube 要求登录验证），所以下面的逐字稿与时间轴取自**同一期的官方播客音频**——同一场对话，但两版剪辑不同（播客版开头多约两分钟的赞助口播，时长 01:17:15，视频版 01:20:10），因此本文的时间点放进视频里会有几分钟偏移。
> - 完整的中英对照逐字稿见[另一篇](/posts/iltb-487-ben-thompson-ai-boom-runs-out-of-money-transcript/)。
> - 配图 8 张，素材是这段视频的官方缩略图、三帧预览画面，以及播客单集封面；每张图里把那一刻的关键句（英文原句 + 中文翻译）拼了进去。
> - 文中所有数字（8000 亿美元资本开支、1.3 万亿、台积电增速、BNSF 的自由现金流、20% 的 TPU 卖给 Anthropic 等）**都来自他的口述**，本文未独立核验——它们是「他怎么说的」，不是「事实一定如此」。

## 章节速览（本文时间轴＝播客音频）

- `01:54` 开场：如果美国赢下 AI 竞赛
- `04:13` 与中国竞争，和「我们有多依赖中国」
- `10:23` 铁路、久期错配，与「钱可能不够」
- `13:31` 伯克希尔、谷歌与绝对利润
- `16:22` 可验证与不可验证的领域
- `23:52` 从买到租：推理的真实成本
- `25:34` 消费者不愿付费，所以广告是唯一解
- `29:04` 广告飞轮、八千亿资本开支与时间错配
- `33:34` 航运、内存与大宗商品市场的逻辑
- `39:13` 「风险不会消失，只会转移」：台积电、英特尔与稀缺
- `45:37` 亚马逊的 Graviton、Trainium 与苹果的聚合者位置
- `48:15` 苹果会不会掉进微软的陷阱；五家前沿模型公司
- `55:38` 微软的中间件剧本：90 年代的 IBM
- `57:56` 界面即腹地：Meta、TikTok 与注意力
- `64:11` 广告的社会价值、ATT，与「智能会不会变成大宗商品」
- `70:53` 英伟达、电力约束，与「我们希望泡沫留下什么」

## 0. 这是一场什么样的对谈

如果你只想知道这 80 分钟里有没有新东西：有，但不在「AI 会不会泡沫」这个问句上。Ben Thompson 这场对谈真正在做的事，是**把「AI 资本周期」翻译成三个老得多的框架**——

1. **大宗商品**：算力和内存会像航运、集装箱一样，价格由边际供给者决定；
2. **久期错配**：修铁路要十年、付钱要当下，1870 年代的结局是「世界没钱了」；
3. **聚合理论**：谁掌握客户入口，谁就拿到供应商；而广告是面向消费者业务唯一没有价格弹性的变现方式。

他在开场就把自己定位讲清楚了：他是一个「**不情愿的加速主义者**」（a reluctant accelerationist）——不是因为相信 AI 一定会带来乌托邦，而是因为「回不去了，卡在原地是最糟的选项」。

**本文补（人物与播客）**：Ben Thompson 的 Stratechery 是过去十年科技战略分析里被引用最多的独立信源，他 2015 年提出的「聚合理论」（aggregation theory）——需求侧的零边际成本获取 + 供给侧的零边际成本分发，聚合者拿走整条价值链的利润——正是本场对谈后半段反复回到的底层框架。主持人 Patrick O'Shaughnessy 的 Invest Like The Best 是投资类播客里偏基本面的一家；这一期是他们时隔多年后第一次再聊，上次聊的时候「还没有 AI，主要在聊聚合理论」。

**本文补（一个阅读顺序建议）**：如果时间有限，先读第 2 节（钱）和第 5 节（大宗商品与风险转移）——这是全场信息密度最高的两段；第 3 节和第 10 节则是最值得「带着不同意去读」的两段。

## 1. 「美国赢下 AI 竞赛」为什么是危险的

主持人把第一个问题就设成了「美国赢下 AI 竞赛意味着什么」，他的回答没有任何铺垫：

> 💬 **"I think it would be very problematic for the U.S. to win. Let's say we take the most sort of fantastical scenario where if you control AI, you basically, your military is better than anyone else. Somehow it fixes their manufacturing, all these things that I don't think AI is necessarily going to do because they sort of deal with the real world."**
>
> 我认为美国赢下这场竞赛会非常有问题。我们设想一个最天马行空的场景：如果你控制了 AI，你基本上就拥有比任何人都强的军事力量。有人说它还能顺带把制造业修好——但我不认为 AI 一定会做这些事，因为制造业面对的是真实世界。

![图 1｜开场：如果美国赢下 AI 竞赛](/blog/youtube/h-0NZ-oIjlk/fig01.jpg)

他的推理链是这样的：如果真到了美国在军事与国家安全意义上拥有显著优势的那一天，那么中国在博弈论上的最优反应是什么？他给出的答案很直白——**炸掉台积电**。而他紧接着说，这个推演本身有一个前提漏洞：那个「我们已经能在本土造晶圆厂、不再依赖那一个卡脖子点」的世界，是他不相信会靠 AI 自己出现的。

> 💬 **"I think the degree to which we are dependent on China is underappreciated and is not something that is going to be fixed outside of a conflict. Just because fixing so many of these things is going to be dramatically dumb. If your competitor is sourcing from China and you're going to start sourcing or getting things from the U.S., you're going to be at such a disadvantage, relatively speaking, that you're just not going to do it. So you do it when you have literally no choice."**
>
> 我们对中国的依赖程度被严重低估了，而且它不会在没有冲突的情况下被解决。因为要补上这么多环节，在经济上会蠢得离谱：如果你的竞争对手从中国采购，而你开始从美国采购，相对而言你会处于极大的劣势，你根本不会去做。所以只有在真的别无选择时你才会做。

然后他把「必须击败中国」这句话本身也拆了——不是否认竞争，而是否认它被当成万能叙事：

> 💬 **"Everyone can use a good bogeyman. I think from the AI trade perspective, nothing works better than we have to beat China. And I do think we need to beat China. We need to be competitive. I despair at the extent to which over the last few years in particular, so many of our responses, particularly from a political perspective, has been to try to be like China. I think we should be going the other direction, more openness, more innovation, less top-down control, less restrictions on speech and things along those lines."**
>
> 每个人都需要一个好用的假想敌。从 AI 投资这条叙事看，没有什么比「我们必须击败中国」更好用了。我确实认为我们需要击败中国，我们需要有竞争力。但让我非常沮丧的是，尤其在过去几年里，我们太多的反应——特别是政治层面的反应——是在试图「变得像中国」。我认为我们应该往反方向走：更开放、更多创新、更少的自上而下控制、更少的言论限制，诸如此类。

**本文补（怎么读这一段）**：注意他说的是「美国赢」有问题，而不是「美国领先」有问题。他紧接着给出了自己认为还不错的状态：OpenAI 和 Anthropic 在前沿，谷歌情况不明，Grok 和 Meta 在后面追，而中国通过蒸馏大致保持在落后 6–9 个月的位置——他认为这个均衡「总体对美国有利」，问题是它能维持多久，以及「用 AI 让 AI 更好」这个自我改进的循环会不会改变坡度。所以第 1 节其实是一个**风险提示**：真正的危险不是「我们输了」，而是「我们赢了以后，世界会变成什么样」。

## 2. 钱：铁路、久期错配，与 1870 年代

这是全场最漂亮的一段类比，也是他自己最看重的一段。主持人在问「你是拿铁路泡沫来做类比吗」，他的补充是「差不多是一个量级」：

> 💬 **"The railroads had a real duration mismatch. To build a railroad and make money off it was a decade or multiple decades long endeavor, whereas you had to issue money to pay for it in the short term. And the world ran out of money, right? ... I think that's why people reach for the railroads, because everyone talks about, are we going to have enough compute? Are we going to have enough electricity? Maybe the nearest term question is, are we going to have enough money? Which is kind of a bizarre thing to think about. That's what happened in the 1870s."**
>
> 铁路有一个真实的期限错配：修一条铁路、靠它赚钱，是十年乃至几十年的工程，而付钱却要在短期融资完成。然后世界没钱了，对吧？……我想这就是为什么大家会拿铁路来类比：所有人都在谈，我们的算力够不够？电力够不够？也许最近在眼前的问题是——钱够不够？这个想法本身有点怪诞。而 1870 年代发生的就是这件事。

![图 3｜钱：1870 年代发生的事](/blog/youtube/h-0NZ-oIjlk/fig03.jpg)

紧接着是全篇最好笑的一个转折：铁路泡沫破了，但铁路本身留了下来——

> 💬 **"The world just ran out of money. The funny thing is, the railroads kept operating and they expanded the West. Their contributions to GDP were astronomical. They're still contributing to GDP. Railroad money is what's going into Google right now for Berkshire Hathaway. It's very funny."**
>
> 世界就是没钱了。有意思的是，铁路继续运营，并且开拓了西部。它们对 GDP 的贡献是天文数字，至今仍在贡献。而现在伯克希尔投进谷歌的钱，就是铁路的钱。这很有趣。

这一段他讲得非常字面：伯克希尔把**喜诗糖果**（See's Candies）那种「极高利润率、但绝对利润有天花板」的生意赚到的钱，搬到了 **BNSF 铁路**这种「利润率差得多、但绝对金额巨大」的生意上。

> 💬 **"BNSF in 2025 or something, the amount of free cash they threw off in one year was more than See's Candies had thrown off in its entire lifetime, even though you're talking about a low margin business compared to a very high margin business. I think there's an aspect from Berkshire Hathaway where once your capital gets so large, you start operating in a world of absolute numbers as opposed to percentage numbers."**
>
> BNSF 在 2025 年左右的某一年里产生的自由现金流，比喜诗糖果整个生命周期产生的还多——尽管这是一个低利润率生意对比一个极高利润率生意。我认为伯克希尔身上有这样一个侧面：一旦你的资本规模大到一定程度，你就开始在一个「绝对数字」而非「百分比数字」的世界里运作。

**本文补（这个类比的算术）**：喜诗糖果 1972 年被伯克希尔以 2500 万美元买下，此后几十年累计税前利润达到约 19 亿美元，但它几乎没有再投资的跑道——因为它开不出更多门店、也扩不了产能上限（他能做的只是每年提价）。BNSF 则是 2010 年被伯克希尔整体并入的，此后每年的资本开支与自由现金流都在数十亿美元量级。所以「BNSF 一年的自由现金流 > 喜诗糖果一辈子的利润」这句话的量级是站得住的（他这里说的是「2025 年左右」，具体数字请按伯克希尔年报核对）。**本文补（为什么要讲这个）**：因为这段算术就是他对谷歌增发的解读框架——

> 💬 **"Google has this unbelievable high margin business of search, one of the most perfect, beautiful business models of all time, and the purest aggregator of them all ... Meanwhile, there's this AI opportunity, which requires just astronomical — it's just incinerating cash. But you can imagine if AI is intelligence and its TAM is basically all white-collar work and eventually with robotics, everything potentially, the absolute profits available here, even if the margins are lower, is so much larger that will we look back on Google Search as See's Candies?"**
>
> 谷歌拥有搜索这个难以置信的高利润率生意，是史上最完美、最优美的商业模式之一，也是所有聚合器里最纯粹的一个……与此同时，还有一个 AI 机会，它需要天文数字的投入——简直是在烧钱。但你可以想象，如果 AI 就是智能，它的 TAM 基本上是所有白领工作，最终加上机器人可能是所有一切，那么这里可获得的绝对利润，即便利润率更低，也要大得多——将来我们回头看，会不会把谷歌搜索看作当年的喜诗糖果？

**本文补（一个需要警惕的地方）**：这套「绝对利润」论证在方向上是自洽的，但它非常依赖「AI 的 TAM 等于所有白领工作」这一句断言。整场对谈里，他对 AI 能力的上限其实是保留的（见下一节），而这里的估值叙事却是全押式的——两处**并不完全一致**，值得分开来读。

## 3. AI 的能力边界：可验证、不可验证，与「真实成本」

他自己给这场对谈打了两个相反的标签：极度看多 AI 对经济的影响（「不情愿的加速主义者」），但**不相信「可泛化」这个论证已经成立**。这是他全场最扎实的一段怀疑：

> 💬 **"AI is clearly incredible at coding ... It's very good at math, obviously. But the obvious riposte is that these are sort of verifiable domains. What is the evidence, or where is the compelling evidence, that being very good at verifiable domains clearly translates to being very good at sort of unverifiable domains, or domains that have very long sort of verification loops?"**
>
> AI 在写代码上显然惊人……数学上它显然也很好。但最直接的反驳是：这些都算是「可验证」的领域。有什么证据、或者说有说服力的证据，能证明在可验证领域表现极好，就一定能迁移为在「不可验证」的领域、或者验证链条极长的领域也表现极好？

他举国际象棋和围棋来反驳实验室的回答——**那两个是「可知」且「有界」的领域**，规模化就是答案；而他想要的是「一个新的、某种不可知的空间」里的例子。另一个漂亮的角度是数据本身：整个互联网的训练语料是「人类思考的**最终结果**」——Reddit 上真正敲出来的字，却没有敲之前那一刻的**痕迹**（thought traces）：

> 💬 **"All the data of the Internet, that's distillation. It distilled all of the end state of human thought. The actual typing on Reddit. It doesn't have the traces. It doesn't actually have the thought, the emotion or whatever that went into typing that comment or typing and writing that essay."**
>
> 整个互联网的数据，那本身就是蒸馏：它蒸馏了人类思考的最终结果。是 Reddit 上真正敲出来的那些字。它没有「痕迹」，它并没有那次评论、那篇文章背后真正的思考、情绪等等。

但他的看多并不建立在此之上，而建立在**成本结构**上：即便模型从今天起不再进步，可服务的市场也已经足够大，因为「推理成本」不是一个数字，而是一个**跨度极大的分布**。

> 💬 **"I think the vast majority of people who are using ad [AI] today are using it as basically a Google substitute or like a recipe maker ... the cost to serve those people is extremely low. And low indeed, basically similar to serving them a web page ... Then you have on the other extreme, people who are actually leveraging test time scaling ... Well, you could think about the answer for days or weeks or months. That is directly marginal cost."**
>
> 今天绝大多数使用 AI 的人，其实是在把它当成谷歌的替代品，或者一个「菜谱生成器」之类的东西。服务这些人的成本极低——低到基本等同于给他们提供一个网页……而另一个极端是真正在用「测试时扩展」的人。你可以为一个答案想几天、几周甚至几个月——这是直接的边际成本。

这条成本线一路推到了企业软件：微软把企业套餐改成 **E7，每用户每月 100 美元含一定用量、超出部分按量计费**。他的判断是这对微软很棘手，因为一旦客户开始每月盯着账单想「我到底为哪些东西付钱」，那个「一次决策、长期摊销」的旧模型就被打破了——而过去给微软带来「不用动脑子的收入流」的，恰恰是那种**按人头、跟 CapEx 一样的决策方式**。

**本文补（为什么这一段重要）**：把这两块拼起来，就是本场对谈的方法论：**他对 AI 的能力上限存疑，但对「钱怎么流动」非常确定**。他几乎不预测模型会不会变强，而是反复问：这件事的边际成本归谁、风险归谁、绝对利润有多少。

## 4. 消费者不愿付费，所以广告是唯一解

从成本结构往下一跳，就是变现。他的口径非常不留情：

> 💬 **"Consumers don't want to pay. There's two things to understand about consumers that Silicon Valley has to relearn about every 10 years. Number one, consumers do not want to pay for software. And number two, consumers do not care about being productive."**
>
> 关于消费者，有两件事硅谷每隔十年就得重新学一遍。第一，消费者不愿为软件付费。第二，消费者不关心「效率」这件事。

![图 6｜广告：收钱难，送东西容易](/blog/youtube/h-0NZ-oIjlk/fig06.jpg)

> 💬 **"Charging people money is hard. Giving people things for free is easy. And it is very frustrating that OpenAI did not pursue this sooner."**
>
> 向人收钱很难，免费送东西很容易。OpenAI 没有更早去做这件事，实在让人沮丧。

为什么广告是「唯一没有弹性问题」的模式，他给了一个可以直接背下来的版本：

> 💬 **"Your ability to monetize the consumer is infinite because the advertiser is bearing the price increase. So there's zero elasticity issues. If you're charging consumers a price, if you want to raise the price, like Netflix, this is their problem with the subscription plan. How much can they raise prices before consumers rebel and drop a tear or give up the service entirely?"**
>
> 你的变现能力是无限的，因为涨价是由广告主承担的，所以完全不存在弹性问题。而如果你是直接向消费者收费、想涨价——比如 Netflix，这就是他们订阅制的麻烦所在：涨到多少消费者会反弹、骂一句然后干脆退订？

紧接着是关于时间错配的一段，也是他明确说自己「要反驳主持人」的地方：今天投下去的资本开支，不会在明天变成算力。

> 💬 **"It all manifests in compute in 2028 and 2029 ... the reality is if you've built the shell, that money is sitting there. You're not going to let it just sit there. If you invest in a fixed cost, and this is the whole logic of commodity markets."**
>
> 它要到 2028、2029 年才会变成算力……现实是：壳子建好了，钱就已经砸在那儿了，你不会让它就那么闲置着。只要你投了固定成本——而这正是大宗商品市场的全部逻辑。

**本文补（他说的是哪一句话不靠谱）**：主持人转述的「我们只是在建数据中心，GPU 只在确认需求时才买」是 Andy Jassy 和 Sundar Pichai 在财报电话会上的常见表述。他的反驳逻辑是：**壳子（建成的地产与电力）一旦落地就是沉没成本，而沉没成本一定会被拿去摊薄**——所以「按需采购」的承诺在固定成本面前很难长期成立。这一段的数字（今年约 8000 亿美元 CapEx、明年估算 1.3 万亿）都是他的口述，宜当作量级而非精确值。

## 5. 把算力当大宗商品看：航运、内存与「风险去哪了」

全场最成体系的一段。他先给了大宗商品市场的一分钟速成：

> 💬 **"In a commodity market, the price is set by the marginal supplier. Cost of service is all that matters ... You buy a ship, and the cost of that ship is depreciation. Your marginal cost is actually quite low ... You're going to run that ship at whatever the market will bear. And the container, the beauty of the container, it is a pure commodity."**
>
> 在大宗商品市场里，价格是由边际供给者决定的，「服务成本」就是一切……你买一艘船，船的成本体现为折旧，而你的边际成本其实相当低……你会以市场能承受的任何价格让这艘船跑起来。而集装箱这个东西的美妙之处在于，它是纯粹的大宗商品。

然后是把算力、内存套进同一个模型：**在稀缺时期算出来的回本周期，未必在丰裕时期成立**。

> 💬 **"The problem is you're measuring your payback period in a time of scarcity. Is that payback period going to hold in a time of abundance? And the sort of the bulls would say there's never going to be a time of abundance ... My concern is even if that's right, we could still have an air gap in that there's so much money going into it right now. And not enough has come online to actually make sufficient revenues to handle the situation where we run out of capital."**
>
> 问题是，你是在稀缺时期衡量回本周期的——这个回本周期在丰裕时期还成立吗？多头会说：永远不会出现丰裕时期……我担心的是，即便这是对的，我们仍可能撞上一个「断档」：现在投进去的钱太多，而跑起来、产生足够收入的部分又太少，一旦资本耗尽就接不上了。

内存那段有个很好的历史对照：三星是**在下行期投资**才拿下内存的，这个动作要求「极大的胆量、极强的纪律和极多的钱」；而经过洗牌之后只剩三家——「三家不是垄断，但算是一种寡头」。他还给了一个刻薄的类比：内存厂商像伊朗，霍尔木兹海峡这张牌**不用的时候最有效**，一旦真的用了，阿联酋、沙特就会去修管道、建新港口，「到 2035 年再关海峡就毫无影响了」。

最后，全场最重要的一个句子，讲的是台积电：

> 💬 **"All markets carry risk. And a lot of the question is, who ends up holding the risk? What I think the way the tech companies didn't fully appreciate is the extent to which TSMC has offloaded risk onto the big tech companies ... the risk that TSMC is worried about is overcapacity. If we build a fab, we expect that fab to run for 30 years."**
>
> 所有市场都带风险，而核心问题往往是——最后是谁在承担这个风险？我认为科技公司没有充分意识到的是：台积电把风险转嫁给了大型科技公司，转嫁的程度有多大……台积电担心的风险是产能过剩。如果我们建一座晶圆厂，是指望它跑 30 年的。

![图 2｜风险：它只是被转手了](/blog/youtube/h-0NZ-oIjlk/fig02.jpg)

> 💬 **"Risk doesn't disappear. It just moves. The risk is right now where you have every single big tech company realizes if we had more compute, we could be making more money. So there's lots of foregone revenue and foregone profits that is the manifestation of the risk that TSMC handed off to them."**
>
> 风险不会消失，它只会移动。今天这个风险落在每一家大型科技公司身上：他们都清楚，如果有更多算力，就能赚更多钱。所以大量被放弃的收入、被放弃的利润，正是台积电转嫁出去的风险的具体表现。

这一段还顺带接回了张忠谋：2000 年代末他回归台积电、在大衰退里**加码**投资（而不是砍支出），「这奠定了他们在那段时间拿下最前沿半导体的地基」。而英特尔的问题被他总结成一句话：不是技术不行，是**没有人有理性动机去当它的第一个客户**——因为「台积电太好了、太配合了，我们知道他们一定会做好」。于是他给出一个反直觉的结论：**是稀缺救了英特尔**。

**本文补（这一段的漏洞在哪）**：把「风险转嫁」讲成零和的转手，在会计上是对的，在经济学上则不是——如果多出来的算力真的能带来更高的边际收益，那这份风险是被**有效定价**了，而不是被藏起来了。Ben 自己在讲英伟达的循环融资时用的是同一个句式（「风险从不消失，它只是出现在别的地方」），但他对「这份风险的期望值是不是正的」这个问题，全场没有给出答案。

## 6. 谁的位置最好：亚马逊、苹果，与五家前沿公司

主持人的问题是「哪家大科技公司的业务结构最有意思」，他的答案从不犹豫：

> 💬 **"The answer is always Amazon ... the extent to which they build for them. They are their first best customer. They provide the scale to get basically anything off the ground, which they then sell to other people."**
>
> 答案永远是亚马逊……在于他们「先为自己构建」的程度：他们自己是自己的第一个、也是最好的客户。他们提供的规模几乎能让任何业务起步，然后再把它卖给其他人。

这段的具体例子值得记下来：**Graviton 和 Trainium 的早期版本都很糟**，但亚马逊可以「把自家那些还很粗糙的处理器塞在对外售卖的服务底下」——比如 Redshift 托管数据库，客户根本不知道底下是什么芯片。于是量给了他们迭代的机会，「因为他们是 Graviton 的第一个、也是最好的客户，Graviton 变好了」。物流也是同一套剧本，但顺序相反（先外包、再自建、再对外卖）。

苹果那一段则是一个漂亮的**反问句结构**，最后落回聚合理论：

> 💬 **"At the end of the day, they do own access to customers. So they can get suppliers. This is the classic aggregator play. If you own access to customers, suppliers come to you, not the other way around. So they can get suppliers for their AI as needed."**
>
> 说到底，他们握着通往客户的入口，所以供应商会来找他们。这是经典的聚合者打法：如果你掌握了客户入口，供应商会来找你，而不是你去找供应商。所以需要 AI 的时候，他们能拿到供应商。

他不认为手机会被取代（「小到能塞进口袋，又大到几乎什么都能看……电视如今只是配件」），但提出了真正的开放问题：**如果「环境式 AI」成为新的中心，苹果会不会掉进微软当年的陷阱**——微软并没有错过移动，微软的问题是「他们的移动是一台小型 PC」。

![图 4｜前沿：不待在前沿才是鲁莽](/blog/youtube/h-0NZ-oIjlk/fig04.jpg)

关于五家前沿公司（OpenAI、Anthropic、Gemini、SpaceX AI、Grok、Meta），他给的是**结构性差异**而不是排名：

> 💬 **"Never discount, number one, the power of belief. They think they're creating God. The most impactful things in history have usually been fueled by religion. The two religious organizations in Silicon Valley are OpenAI's kind of, like, mainline. They go to church every Sunday. They're sort of, like, evangelicals. That's Anthropic."**
>
> 永远不要低估第一件事：信念的力量。他们认为自己在造神。历史上最有影响力的事情，通常都是被宗教驱动的。硅谷里的两个「宗教组织」：OpenAI 有点像主流教派，每周日都上教堂；而那种福音派式的存在，是 Anthropic。

![图 5｜信念：他们认为自己在造神](/blog/youtube/h-0NZ-oIjlk/fig05.jpg)

而全场最能概括这轮 AI 的一句话，出现在这里——它也是本文标题的由来之一：

> 💬 **"I think there's a very good case to make that it is more reckless to not be on the frontier if you're a digital company. The counter to Meta is actually Microsoft. Microsoft is not on the frontier."**
>
> 我认为有一个很有力的论证：如果你是一家数字公司，不待在前沿反而更不负责任。Meta 的反面恰恰是微软。微软不在前沿。

## 7. 微软的 IBM 剧本

微软那一段是全篇历史感最强的一段，核心洞察是「历史会回响」：

> 💬 **"Gerstner's real key insight to IBM is we're pretty mediocre at everything ... And that's the price of monopoly. Once you've been a monopoly, you kind of lose your capacity to be good because you didn't need to compete anymore."**
>
> 郭士纳对 IBM 真正的关键洞察是：我们在每一件事上都很平庸……这是垄断的代价。一旦你当过垄断者，你就某种程度上丧失了做好事情的能力，因为你不再需要竞争。

而 IBM 当年真正的产品不是技术，是**中间件 + 顾问**——「在一家公司那套老掉牙的大型机（这些公司都有）和现代的网络服务之间，插进一层东西」，这给了 IBM 三十年生存期。他认为微软在做同一件事：「我们可靠、稳定、你认识我们、我们对 80 年代的东西都保持向后兼容。你可以在我们上面构建，然后所有模型的更替都交给我们来管。」

这段里最重要的一个自我拆台式的补充，是他说中间件的代价：

> 💬 **"And does that mean you'll get the absolute best experience? No. Middleware saws off the sharp edges. You sort of get a lowest common denominator capacity."**
>
> 那这是否意味着你会得到最好的体验？不会。中间件会把锋利边缘都锯掉，你拿到的是「最大公约数」式的能力。

**本文补（这一节真正锋利的地方）**：他顺手讲了企业软件销售的元规律——甲骨文当年卖关系型数据库的话术是「你不想被 IBM 锁死吧」，而甲骨文锁你比谁都狠；所有云厂商都说「可移植性」，然后给你一个只能在自家云上跑的服务。**这套剧本之所以有效，恰恰是因为客户怕被锁死、又懒得验证。** 这是本场对谈里唯一一条可以直接迁移到你自己业务上的规律。

## 8. 界面即腹地：Meta、TikTok 与注意力

如果「不待在前沿是危险的」，那微软到底怕什么？他的答案很具体：**界面**（user interface）——「你实际与计算机交互的地方」，也就是 Codex、Copilot、Cowork 这类产品瞄准的位置，而「系统记录」（systems of record）反而不是重点，因为 AI 恰好擅长那种「极其繁琐、重复」的搬运工作。

Meta 那一段则是全场最有洞察力的商业史复盘。他先说了 YouTube 与 Instagram 的成本结构差异：YouTube 从很早就给创作者分成，**但和 Netflix 不同，它不用预付**——「他们事后付」，所以它是「一路付一路赚」；而 Facebook 付 0 美元：

> 💬 **"Instagram is this unbelievable product that generates all this money for which Facebook pays $0 for content. It's unbelievable."**
>
> Instagram 是一个不可思议的产品，为 Facebook 挣了这么多钱，而 Facebook 为内容付了 0 美元。简直难以置信。

![图 7｜注意力：为内容付 0 美元](/blog/youtube/h-0NZ-oIjlk/fig07.jpg)

接着是 TikTok 为什么成为 Meta 的盲区——因为**分类错了**：

> 💬 **"TikTok is classified as a social network and it's not a social network at all. TikTok is an entertainment product. It doesn't matter who you follow on TikTok. What you see on TikTok is a function of what you watched ... And the insight from TikTok was the way to get the best content to limit it to your social network is an artificial constraint."**
>
> TikTok 被归类为社交网络，而它根本不是社交网络。TikTok 是一个娱乐产品。你在 TikTok 上关注了谁并不重要：你看到什么，取决于你看了什么……TikTok 的洞察是：只把最好的内容局限在你的社交网络里，是一种人为约束。

注意这里又出现了「绝对值 vs 利润率」：内容量足够大时，即便好内容的利润率薄到可以忽略，好内容的**绝对数量**也会很大。

他对 Meta 看多的真正理由是**广告匹配**：LLM 是预测机器，而 Meta 手里有一台别人没有的验证器——

> 💬 **"And their validation is the ad marketplace. Running a gazillion A-B tests ... this huge liquid market that is a verification machine where the verifiers are humans deciding whether they click on that ad and make a purchase or not ... We're going to move to this world where Meta is going to look at people and say, this person probably wants to see this next ... they only need to increase a few percentage points for the returns to be billions and billions of dollars."**
>
> 而他们的验证器就是广告市场本身：跑海量的 A/B 测试……一个体量庞大、流动性极高的市场，本身就是一台验证机器，而验证者就是一个个决定要不要点击、要不要下单的真实人类……我们会走向这样一个世界：Meta 看着一个人说，这个人接下来大概想看这个，然后去找出那个东西、展现给他。只要提升几个百分点，回报就是几十上百亿美元。

**本文补（这里前后其实是一体的）**：第 3 节说「AI 在不可验证领域不可信」，这一节说「广告恰好是可验证领域」——两段合起来才是完整的论证：**Meta 之所以值得押注前沿模型，不是因为模型更聪明，而是因为它的验证回路最短、最便宜**。这是全场把「能力怀疑」和「商业确定性」接得最漂亮的一处。

## 9. 英伟达、电力，与「泡沫该留下什么」

关于英伟达，他的判断不是「护城河深」，而是「**位置不自然，而且已经在通过别的方式降价**」：

> 💬 **"But they're actually not maintaining their margins because this whole question of circular financing ... NVIDIA is providing a 25 percent backstop ... They get a lower cost of capital because NVIDIA assumed risk. This is my point before. Risk never disappears. It just appears somewhere else ... If you actually look at their business holistically, what that is, is a price cut."**
>
> 但实际上，他们并没有真正维持住利润率，因为这整个循环融资的问题……英伟达提供了 25% 的兜底……他们拿到更低资金成本，是因为英伟达承担了风险。这就是我前面的观点——风险从不消失，它只是出现在别的地方……如果你整体看他们的生意，那本质上是一次降价。

而这些风险的对家，最终是**超大规模云厂商**（尤其是谷歌和亚马逊）：他们既造芯片，又要卖芯片，而且「**是当大宗商品卖，不是靠差异化卖**」——所以把 Trainium 卖到外面，不会削弱自家云的吸引力。这一段的细节很有价值：谷歌已经达成协议把约 20% 的 TPU 卖给 Anthropic，而 Andy Jassy 在最近一次电话会上几乎确认了 Trainium 会对外销售。

最后是电力，也是全场最动人的一段。英伟达的隐性期待，其实是**电力不够用**——因为在电力被完全约束的世界里，「最省 token」才有溢价：

> 💬 **"I think what NVIDIA is hoping for, maybe they wouldn't say this in so many words, but if we get to a world where we actually run out of power, that's probably good for NVIDIA ... Probably the biggest problem for NVIDIA over the last couple of years is I think the U.S. has actually brought a lot more power online than expected."**
>
> 我认为英伟达期待的是（也许他们不会把话说这么直白）：如果我们进入一个电力真的不够用的世界，那对英伟达大概是好事……过去几年英伟达最大的麻烦，我认为是美国实际上把比预期多得多的电力接入了电网。

![图 8｜电力：泡沫该留下什么](/blog/youtube/h-0NZ-oIjlk/fig08.jpg)

而全文的落点，是一个比「泡沫会不会破」好得多的问题：**你希望这场泡沫留下什么**。

> 💬 **"You want a bubble that produces something that lasts ... what's going to last from AI? The GPUs don't last that long. Data centers, okay, fine. But what is it going to be? Power. It has to be power. If we're in a world where this all blows up and we have way too much power, that is an amazing world to be. We've always been energy constrained. Energy undergirds everything."**
>
> 你希望一场泡沫能留下一些持久的东西……那 AI 会留下什么？GPU 撑不了那么久。数据中心，还行吧。但会是什么？是电力。只能是电力。如果我们处在一个「这一切都崩了、我们电力严重过剩」的世界里，那会是一个美妙的世界。我们一直受制于能源。能源支撑着一切。

他给的三个历史对照很具体：互联网泡沫留下的是**埋在地下的光纤**（「谷歌是靠买暗光纤起家的……我们的核心互联网至今还跑在 WorldCom 的光纤上」）；铁路留下的资产**至今还在给谷歌分红**，那份资产一路追溯到北太平洋铁路、追溯到 Jay Cooke 向散户卖债券；所以 AI 泡沫该留下电力——而他自己也承认，这个问题「甚至很难想象，因为我们的思维被『我们一直处于能源稀缺』这个事实牢牢限定住了」。

## 10. 读完之后的四点评注（本文补）

以上都是他说的话。下面四条是本文加的，标为「本文补」，用来给这场对谈装几个反向的把手：

**（1）方法上：他几乎不预测能力，只预测资金流。** 整场对谈的结构是「先怀疑模型，再推演钱、成本和风险归属」。这个顺序本身值得学：它让大部分判断**不依赖**「AGI 什么时候来」这个没人能回答的问题。反过来，这也意味着他的结论会随着融资结构的变化而变化——第 2 节的「钱可能先断」和第 9 节的「循环融资把风险挪走」是同一枚硬币的两面。

**（2）「风险不会消失只会转移」这个句式很强，但它回避了定价。** 转手本身不是问题：如果买方拿到算力后能多赚的比承担的风险更值钱，那这笔交易就是有效定价。真正要问的是**这份风险的期望值是正的还是负的**——而他对「那个 NeoCloud 的算力没人要」的世界给出的评价只是「期望值在零和一之间」。这句话可以套在任何一笔风险资产上，所以它更像一个提醒，而不是一个估值结论。

**（3）他最值得记住的一条，是对「可验证 / 不可验证」的怀疑。** 他的对照组是国际象棋和围棋——「可知且有界」，所以规模化就是答案。这条怀疑可以直接拿来审阅你手上所有「AI 会自然泛化到我们这行」的论证：**先问这个领域的验证回路有多长、有多贵**。他自己的对冲也很诚实：即便模型不再进步，能被服务的那部分市场也大得足够。

**（4）唯一需要配反方阅读的是第 8 节（Meta 与广告）。** 他的框架里「广告市场 = 验证器 = 社会正向」，逻辑自洽，但这段同时承担了替 Meta 的注意力生意做正当化的功能；而苹果 ATT 那一段他只给了单向叙事（「科技史上最恶劣的垄断行为之一」）。这一段更适合当作**一份强有力的单方陈述**来读——它的价值在于把「为什么广告是消费者业务的终局」讲得比任何人都清楚，而不在于它对平台责任的判断。

以及一条阅读坐标：**这场对谈录于 2026 年 8 月**。他引用的数字（8000 亿 / 1.3 万亿资本开支、台积电的增速起落、20% 的 TPU）都是那个时点上的「当下」，其中一部分是他在节目里凭记忆说的量级。真正需要核对的地方，请回到财报与原始公告。

完整的**中英对照逐字稿**（80 分钟，按 16 个章节分段、带时间轴）见[另一篇](/posts/iltb-487-ben-thompson-ai-boom-runs-out-of-money-transcript/)。
