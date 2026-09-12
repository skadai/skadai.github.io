---
title: "4 天做一个「真的能玩」的完整游戏：Blender + GPT 5.6 Astra 做 PaperRoute 的全流程"
description: "Emm Tee 用 GPT 5.6 Astra 写代码、Blender 做模型，四天把 Paperboy 重做成可玩的 PaperRoute。本文逐段翻译他这份六步 runbook（机制先行、美术后置、两条流分开跑、Blender-as-code、review 渲染回路、分支实验），并站在开发者视角补齐它缺口的部分：这类项目在工程上应该怎么走——CI 门禁、性能预算、资产许可、关卡数据驱动，以及一份可执行的流程清单。"
pubDate: 2026-09-13
slug: "paperroute-blender-gpt-astra-full-game"
category: null
tags: ["X长文", "游戏开发", "AI 编程", "Blender", "GPT 5.6 Astra", "开发流程", "笔记"]
status: published
draft: false
published: true
source: "https://x.com/builtbysketch/status/2098773631249854478"
---


来源：X 长文 [《How to build a full game with Blender and GPT 5.6 Astra (not just a demo)》](https://x.com/builtbysketch/status/2098773631249854478)（Emm Tee / @builtbysketch，2026-09-12）· 游戏主页：[paperroute.lol](https://paperroute.lol/) · 作者开发日志：[paperroute.lol/devlog](https://www.paperroute.lol/devlog/)

> **阅读说明（先说清哪些是原文、哪些是本文加的）**
>
> - 全文分三块：**① 65 秒演示片的画面解读**；**② 原文逐段中文翻译**（保留作者原有的 Step 1–6 编号体系）；**③ 站在开发者视角，把这份 runbook 还原成一套「这类游戏项目在工程上应该怎么走」的流程分析**。
> - ② 里的英文引文照录原文，中文为本文翻译；原文全文见 `transcript-X_2098773631249854478.md`。
> - 演示片没有旁白，只有配乐，所以对画面的描述来自逐帧截图，不是语音转写。文中所有数字（时长、token、金额、commit 数）都是作者自述，本文未独立核验。
> - ③ 是本文的判断，不是作者原话；凡是推断都标了「本文分析」。
> - 配图是「画面 + 原文原句 + 中文翻译」的合成图，用来说明每个步骤当时的样子。

## TL;DR

- 作者 2026 年 7 月先用 Fable 试过一次，只做到灰盒街道和一辆「横着的自行车」就停了；9 月换成 **GPT 5.6 Astra 写代码 + Blender 做模型**，四天做出可玩的完整游戏 **PaperRoute**（[paperroute.lol](https://paperroute.lol/)），第五天补齐官网。
- 他的 runbook 只有六步，核心思想是 **机制先行、美术后置、两条上下文分开跑**：先写出自己相信的 brief，只给机制和一张透视参考图；等玩法能玩了，再单独开一条美术方向的工作流。
- 真正让这件事成立的不是「一次生成」，而是**流程**：确定性模拟 + 边写边补的测试、Blender 用 Python 脚本化建模（资产可复现）、每改一次都出 review 渲染图、把砸窗和雨天这类不确定的玩法放进独立分支先验证。
- 代价被完整记录：39 小时跟踪时长（人类 25.2 / 纯 Agent 13.8）、15.6 亿 token（其中 15.3 亿是缓存读取）、2,175 美元 API 价值、11 天 90 个 commit。
- 作者自己也留了两个未解问题：手机端稳定 60fps 没有证实；Meshy 生成的骑手模型 88,550 个三角面，还没在真机上跑过基准。
- **本文分析**：这份 runbook 相当于一套「单人 + Agent 的独立游戏流水线」，它把标准游戏开发里的 vertical slice、美术管线、评审回路都做对了；但对 CI 门禁、性能预算、资产许可、关卡数据驱动这几件事是空的——这正是「demo 级 AI 开发」和「工程级开发」之间的差距。

## 演示片（65 秒，建议先看一遍）

这段 65 秒的片子就是 9 月 6 日在 X 上先火起来的那条：没有旁白，只有配乐，画面全是成品——标题卡、报纸式的官网、骑手上路送报、终点公园。下面直接嵌在页面里（放在本仓库 `public/`，不依赖任何第三方）：

<figure class="video-local">
  <video controls preload="metadata" playsinline poster="/blog/x/2098773631249854478/poster.jpg">
    <source src="/blog/x/2098773631249854478/clip.mp4" type="video/mp4" />
  </video>
  <figcaption>PaperRoute 演示片全片 65 秒（源：<a href="https://x.com/builtbysketch/status/2096515959469072630">@builtbysketch</a>，2026-09-06）</figcaption>
</figure>

X 官方嵌入也一并放上，对照两种效果（X 的 widget 需要读者能访问 `platform.twitter.com`，国内直连通常加载不出来，所以上面那段自托管才是主力）：

<div class="video-embed-x">
  <blockquote class="twitter-tweet"><p lang="en" dir="ltr">OK GPT-6 Astra is insane at making games. I remade Paperboy - everything modelled in Blender, rendered in browser. took ages to dial in the look and feel, models and rendering but my god its awesome. who wants a full walkthrough/breakdown?</p>&mdash; Emm Tee (@builtbysketch) <a href="https://x.com/builtbysketch/status/2096515959469072630">September 6, 2026</a></blockquote>
</div>

## 一、先看这 65 秒：演示片里到底发生了什么

作者在 9 月 6 日那条推文里贴出的演示片共 64.95 秒（1268×720，只有配乐、没有人声）。它其实是整个项目的「成果切片」——从上往下看，能对上原文里的每一个阶段。

![图 1｜00:00 演示片开场：标题卡与街道，这一段就是 9 月 6 日先把 X 引爆的那条视频](/blog/x/2098773631249854478/fig01.jpg)

- **00:00–00:06｜标题卡**：画面压着 "PAPER ROUTE" 的大字，背景是玩家视角的街道——白栅栏、独栋房、远处的山。风格已经定型：明亮、饱和、手绘质感的日本夏日感。
- **00:06–00:10｜报纸形式的网站**：镜头给到一个「The PaperRoute Post」的版面，标题写着 "The neighbourhood is waking up"。这就是原文最后说的那件事——**落地页是报纸、结算页是报纸、排行榜也是报纸**，整个概念被包在一个统一的包装里。
- **00:10–00:60｜骑手上路**：全程是第三人称跟随视角，骑手沿街道前行，路上有停着的车、过马路的行人（老人、推婴儿车的），配送目标用虚线弧线标注落点，UI 上是 `DELIVERY DEPARTMENT 0/10 delivered · 10 papers` 和速度表。
- **00:54–01:05｜终点公园**：路线最后进入一个公园/滑板场区域，有靶子和长椅，路线在一件「好玩的事」上收尾，而不是走到一半突然停住。

这段片子最有信息量的地方在于：它**没有展示任何「生成过程」**，全是成品画面。作者把生成过程写进了文章和 devlog，把演示片当招牌——这也解释了为什么他反复强调「one-shot 的 demo 看起来很惊艳，但做一个完整游戏完全是另一回事」。

## 二、原文翻译：作者的 runbook（按发生顺序）

### Background：先承认一次失败

> Back in July I wanted to give Fable a shot at Building paperboy.
> A week of deliveries from Monday to Sunday, subscribers and non-subscribers, dogs, cars, the diagonal camera. I also wanted it to be a native iOS build. As well as web. But only got as far as a grey-box street and a rider before it stalled in July.
> It didnt go very well and i Gave up. All fable could msuter was a sideways bike.

7 月作者想用 Fable 试一次 Paperboy 的重制版：一周七天的配送、订户与非订户、狗、汽车、斜角镜头，而且同时要 **原生 iOS 构建** 和 Web 构建。但只做到一条灰盒街道和一个骑手就停住了——「Fable 勉强做出来的，只有一辆横着的自行车」。他自嘲了一句 AGI 还没到，但也补了一句公道话：Fable 其实挺能打，他确实推进了一些，只是没到他想要的位置。

![图 2｜7 月那次 Fable 尝试的灰盒画面：俯视、粗糙、只有一个能动的骑手](/blog/x/2098773631249854478/fig02.jpg)

### Step 1 — 先写一份你自己相信的 brief

> The concept didn't come from Astra. When astra launched and I watched the OpenAI demo, I thought it could be a perfect fit. So I rewrote my original brief rather than reusing it.
> In plain English, described the original game, some of the mechanics, and then I gave it a description of what I wanted it to do.
> Get the mechanics right first, then spin it once it's playable.

概念不是 Astra 给的。Astra 发布、作者看完 OpenAI 的演示之后，判断它「可能是完美的匹配」，于是**把 7 月那份 brief 重写了一遍**，而不是直接复用。提示词本身非常朴素：用平实的英文描述原版游戏、一部分机制，再说清自己想让它做成什么样。

这个阶段只聚焦机制，并且只给了一张透视参考图——原版 Paperboy 的视角。作者把话说得很明白：他从没打算克隆原版 Paperboy，只是想借这个概念做一个新版本；但**如果你要给模型一个起点，就给它最好的那个起点**，而对于「骑自行车送报纸」这个题材，最好的参照就是原版。

一句话总结这一步：**先把机制做对，能玩了再去想风格。**

### Step 2 — 定游戏方向（把「玩法」和「美术」拆成两件事）

> I gave Astra Two separate tasks. - Art direction - Game direction. Both in one thread.
> At that stage all I cared about was the concept and the game mechanics, and a big pile of art direction would only have diluted that. That decision paid for itself the first evening.

这里作者**刻意把两件事分开**：美术方向、游戏方向，给 Astra 两个独立任务（但都在同一条 thread 里）。

第一次 one-shot 之后，Astra 给出的东西已经能 demo 了。作者保留了它给的等轴视角和整体游戏风格，只改游戏方向和机制——换镜头、改手感。他形容第一次的产出「差不多就是你在 Twitter 上能看到的那种东西」：一次生成、看着不错、挺有意思、有一套自己的美术主张，还有一个你几乎在每个 demo 里都见过的 GUI。

这个阶段他只要概念和机制，因为他判断：**这时候塞一大堆美术方向，只会稀释掉真正重要的东西。** 而「这个决定当天晚上就回本了」——

> Astra built a browser version with a deterministic simulation, aimed ballistic paper throws that land where the dotted arc says they will, mailbox scoring and a route that ends in a park course, in six commits before midnight. It wrote the tests as it went, which mattered more than I expected, because every art change after that had a suite to run against.

午夜之前，Astra 用 6 个 commit 做出了浏览器版本：**确定性模拟**、按虚线弧线落点的弹道抛报纸、邮箱计分，以及一条终点在公园赛道的路线。它还**边写边补测试**——作者说这件事比他预想的更重要，因为从那之后，每一次美术改动都有一套现成的测试可以跑。

![图 3｜第一次 one-shot 的产出：俯视角、明显的「demo 味」GUI，但机制已经能玩了](/blog/x/2098773631249854478/fig03.jpg)

![图 4｜机制先行的那一晚：确定性模拟、虚线弧线抛投、邮箱计分、终点公园赛道](/blog/x/2098773631249854478/fig04.jpg)

### Step 3 — 定美术方向（在游戏编译的时候切到 ChatGPT）

> I actually jumped out of Astra at this point while the game was compiling and I worked with Chat GPT, giving it a few reference images to come up with some concept art and a mood board.
> No it wasnt the "Ghibli" style neither. I never used that word once. Instead what I gave it was a descriptive reference of cool Japanese summer's breeze film with a painted texture effect.
> I didn't want to overwhelm the model or the prompt with detail about exactly how the game should look yet.

作者利用「游戏在编译」的空档切到 ChatGPT，给它几张参考图，让它出概念图和 mood board（情绪板）。他特意澄清：**这从来不是「吉卜力」风格，他从头到尾没用过这个词**；他给的描述是「清凉的日本夏日微风电影 + 手绘质感」。产出的风格参考情绪板，再回头喂给 Astra 作为收敛风格的基础。而且此时他刻意**不把过于具体的美术细节压进提示词**。

#### 两条工作流，同一条 thread

> I iterated both prompt by prompt, on both art direction and game - watching it burn my MacBook while blender was invisibly running in the background and getting random deliveries of pretty impressive renders and tests.
> The engine stream running the game engine ... was the boring repetitive one and the one I'd do again exactly the same way.

作者平时习惯把任务岔开，但这次靠他自己定制的 T3 工作流，把两条流放在同一条 thread 里。他观察到 Astra 比 Fable 更能扛这种用法：可以中途打断它，而且它似乎不会「掉球」。

他同时按提示词迭代美术方向和游戏机制，看着 Blender 在后台「隐形」运行、把 MacBook 烧得滚烫，还时不时收到一批相当能打的渲染图和测试。整个过程中，demo 一直挂在 URL 上，几乎全程可玩。

他明确把「引擎流」标记成**无聊但会原样再做一遍**的那条：转向松手就停、撞击后的容错窗口（同一个垃圾桶不能吃掉三条命）、真会追人的狗（能甩掉，也能用报纸引开）、移动端手势（拖动转向、按住蹬车、点击投掷）——**每一条都是「一个提示词、看一眼浏览器里的结果、一个 commit」**。

#### 用 Python 跑 Blender：asset as code

> Astra doesn't open Blender, it writes Python that Blender runs headless, Not via the mcp.
> Every house, tree, fence and mailbox in the game is a script that builds the mesh, splits the materials and exports a GLB.

这是全文最值得抄的一条工程做法。**Astra 不「操作」Blender**，它写 Python，让 Blender 以 headless 方式运行（不是通过 MCP）。游戏里的每一栋房子、每一棵树、每一段栅栏、每一个邮箱，都是一段脚本：建网格、拆材质、导出 GLB。

第一遍是独立的夏日美术练习——一页房子剪影、树形和街道道具，先单独渲染，再进入可玩世界。然后是房子家族、更密的庭院、手绘质感的表面。到第二天早上十点，已经有七个房子家族。

> Keeping the two streams apart is the thing I'd tell anyone to copy. When a house looks wrong you don't want to be arguing with the model about throw physics in the same thread.

**把两条流分开，是作者最推荐别人照抄的一件事**：当一栋房子看起来不对劲时，你不会想在同一条 thread 里跟模型争论投掷物理。

![图 5｜美术方向的情绪板/视觉故事板：Setting out / Finding flow / The perfect throw / A little trouble / The world opens / One more street](/blog/x/2098773631249854478/fig05.jpg)

![图 6｜Blender 用脚本建模：角色与自行车的迭代版本，先单独渲染再进游戏](/blog/x/2098773631249854478/fig06.jpg)

### Step 4 — 定制模型：卡住的时候上 Meshy

> My main rider Was looking like a wooden puppet and to be honest Astra couldn't do much better - And it certainly couldn't create a face.
> So the best thing to do is either go and download some Blender assets for free, or if you have a specific character in mind I did, use meshy, create images in chatGPT

作者很诚实地承认边界：Astra 做房子这类简单物体不错，**但要把每一个个体都做好看，需要大量逐栋的注意力与提示**；而主角骑手「看起来像个木偶」，更做不出脸。

他的解法是两条路：要么去下免费的 Blender 资产，要么——如果你心里有具体的角色形象——**在 ChatGPT 里生成概念图，丢给 Meshy（花了 8 美元，约 300 次生成额度），Meshy 出 3D 模型，再把模型丢回 Astra 让它减面**，然后就有了一张「不像垃圾」的自定义模型。他明确说：**在 Meashy 这条工作流之前，模型完全不行**；把模型套到已有的自行车上费了些来回，但最终到了一个「能过（passable）」的结果。「如果你绑定（rig）做得好，SKU 就是上限。」

### Step 5 — 补细节

> One shot games lack details. One shot games lack effort. Sure, they may in-build the novelty, but custom animations, better UI make games fell real.
> But taste is still the moat for now (and patience)
> I spent 80-% of my actual session time and agent turns polishing, fixing bad mesh and prompting details. Not building the game

一次生成的游戏缺细节、缺投入。它们也许自带新鲜感，但**自定义动画和更好的 UI 才让游戏「像真的」**。作者把话说得更重：现在能做出来的东西确实惊人，但**品味（以及耐心）目前仍是护城河**。

他给出一个非常反直觉的数字：**80% 的会话时间和 Agent 轮次花在打磨、修坏网格、提示细节上，而不是「在做游戏」**。

具体到 PaperRoute，这些打磨包括（Astra 写 Blender 脚本完成）：把身体按游戏预算减面，同时保住原脸、发绺和帽檐的接缝；重建袖子和手臂，让皮肤不会从衬衫里穿出来；把短裤下摆从腿上分离；把整套模型适配到已有的自行车上（握把和脚踏的接触点要对）；用 23 根骨骼绑定，其中 3 根给头发、3 根给下摆，让它们随速度动起来。作者说他大约有 30 个 commit「读起来像裁缝的笔记本」：修骑手服装几何、重建骑手手臂与袖子、保住短裤下摆、给自行车换上更直的 BMX 车把。

![图 7｜定制角色进游戏：拿报纸的老头与邮箱，走的是「概念→Meshy 网格→Blender 脚本→绑定→review」的固定管线](/blog/x/2098773631249854478/fig07.jpg)

同样的回路随后用在「拿报纸的暴躁老头」和「拿遥控器的小孩」身上——**ChatGPT 出概念、Meshy 出网格、Astra 写 Blender 脚本、绑定、渲染 review、进游戏**。管线一旦跑通，第二个角色的成本只是第一个的零头。

#### 提示：把 review 回路搭起来

> Review renders are the actual job. You review 3D work from a model by looking at renders.
> I would get it to self-look at what was wrong with the model, do isolated renders of that model, and then send it back to me for review

「渲染图才是正事」。作者是做到中途才明白这一点的：他先让 Agent 建了一套 harness，反复循环地去评审自己的工作——**先让它自己看模型哪里不对、对模型做单独渲染，再交给自己 review**；而 Render 1 到 Render 2 之间 60%–70% 的改进，都是 Agent 在这个回路里自己做出来的。

Astra 还搭了截图脚本，把真实的 Three.js 骑手摆出转向、投掷、冲刺、摔倒的姿态，每次保存正面、侧面、背面和素模（clay）三视图。devlog 里每个检查点旁边都放着这些渲染图。**哪里不对，你就指着那一帧说「帽子没盖住头发」——那就是提示词。**

![图 8｜devlog 里的 development renders：素材分区预览、贴图三视图、绑定前后对比——评审的对象是图，不是文字](/blog/x/2098773631249854478/fig08.jpg)

### Step 6 — 加品味与花活

> Everything above is process. Process gets you a game that works. It doesn't get you one anyone wants to play twice, and that gap is taste, which is the bit you have to bring yourself.
> You cant one shot your way to a good looking and full game. You'll end up with slop

上面全是流程。流程给你一个**能跑**的游戏，但给不了「有人愿意玩第二次」的游戏——那个差距叫品味，只能你自己带进去。**你没法靠 one-shot 做出好看又完整的游戏，那只会做出 slop（泔水）。**

他的「品味」有一部分体现在**扔掉东西**上：最初的模型几乎全被替换成了完全定制的角色（或者即将被替换）。他举了老头和玩遥控器的小孩这两个例子，并说如果还有时间，他会继续加角色、让已有角色更活，让街道更有性格。

然后是花活：

- **砸窗**单独占了一个分支：一个完全独立的镜头，推近到窗户、在撞击处停住、再荡回骑手。
- 这项实验在游戏里长这样：可以选择左窗/右窗重放，也可以切到那个专门的镜头。

![图 9｜砸窗的独立分支实验：独立镜头推近、撞击停住、再荡回骑手](/blog/x/2098773631249854478/fig09.jpg)
- **下雨天**也是一样，是另一条独立分支/子 Agent thread。新工作树、可隔离测试的新版本，准备好再合并。
- 他甚至花了不少时间专门调「摔倒」这个动作。
- 路线末端的滑板公园被拉长，改成一个训练场，让路线在一件好玩的事上收尾，而不是直接停住。
- 更大体量的宅子被沿街摆放，给街道一点动态。
- 最重要的一项：**一整套新的天气系统**——先是小东西（水花、从水坑里出来的轮胎印），然后是一整天纯粹的雨天。

作者的解释是：这些东西让游戏「活」起来、有纵深；否则它很容易变成一条你重复刷最高分的平路；**把这些混进来，才有另一个维度，而这正是品味起作用的地方。**

官网也是同一套逻辑：**真正卡住他上线的，是把网站做得可信、把整个概念包起来**——落地页是报纸，结果页是报纸，排行榜也是报纸。

### What it cost：真实成本

DevClocked 记录了全部。从 7 月 1 日第一个规划 commit 到 9 月 12 日（上线后四天）：

- **39 小时**跟踪时长，拆成 **人类 25.2 小时 + 纯 Agent 13.8 小时**
- **15.6 亿 token**，其中 **15.3 亿是缓存读取**
- **2,175 美元**的 API 价值（作者强调「不是我的账单」）
- **11 天 90 个 commit**

要注意口径：在线状态跟踪从 9 月 6 日才开始，之前默认把他算作「在场」；之后有三分之二的跟踪时间他并不在键盘前。另外——8 个 commit 之后是**两个月的空档**；9 月的浏览器重制花了四天构建、第五天上线，而这才是大家在玩的版本。作者对 7 月并不完全后悔，因为 brief 和模拟设计活了下来；但如果当初直接从浏览器开始，第一天就有可玩的东西了。

最后他主动列出两个**未解决**的问题（「我宁愿说出来，也不想假装」）：手机上稳定 60fps 没有得到证实（一次受控测试撑住了，另一次平均 58）；Meshy 出的骑手因为保留了脸，有 88,550 个三角面，还没在真实手机硬件上跑过基准测试。

![图 10｜DevClocked 记录的真实账目：小时、token、commit 与缓存比例](/blog/x/2098773631249854478/fig10.jpg)

### 作者自己的 TLDR：如果重来一次的顺序

1. 先用你自己的话写 brief，挑**离你想要的最近的那一个参考**，哪怕它是那个你「不许抄」的东西。
2. 把 brief 和两三张粗略参考图给模型，**在机制可玩之前，先按住美术方向**。
3. 把「引擎」和「外观」当成两场独立的对话。
4. 用 Python 在 Blender 里造道具，这样**每个资产都是可复现的**。
5. 角色需要脸的时候：ChatGPT 出概念 → Meshy 出网格 → 交给 Astra 减面、绑定、装配。
6. 每次改动都要有 review 渲染图。**留一整天做花活**——天气、砸窗、终点的公园，因为这才是它值得再玩一次的原因。
7. 记录你的小时数和 token，因为你会想知道。
8. 然后把它挂到一个域名上。

## 三、开发者视角：这类项目的「标准流程」应该怎么走

原文给的是**作者实际走过的路径**；这一节把它还原成**这类项目在工程上应该走的流程**，并指出哪几步他做对了、哪几步是空缺。以下除引用外均为本文分析。

### 3.1 把 runbook 翻译成标准阶段

| 标准阶段 | 目标产物 | 原文对应的做法 | 本文判断 |
| --- | --- | --- | --- |
| Pre-production（前期） | 一句话 brief + 参考图 + 核心机制清单 | Step 1：重写 brief，只给机制和一张透视参考图 | ✅ 做对了「参考要挑最近的」；但没有显式的验收标准（什么叫「机制做对了」） |
| Vertical slice（垂直切片） | 一条能从头玩到尾的可玩路径 | Step 2：一晚 6 个 commit，做出确定性模拟 + 计分 + 完整路线 | ✅ 这是全文最重要的一步：先要一条**可玩、可验证**的窄切片，再谈美术 |
| Art production（美术生产） | 可复现的资产管线 | Step 3–4：Blender 脚本建模 + Meshy 定制角色 | ✅ asset-as-code 是关键；缺资产清单与许可记录 |
| Production（量产） | 内容与系统并行推进 | Step 5：角色管线复用、天气、关卡元素 | ✅ 管线跑通后边际成本骤降；但关卡数据仍偏「场景内硬编码」 |
| Polish（打磨） | 手感、动画、UI、氛围 | Step 5–6：80% 时间花在这里 | ✅ 承认「80% 时间不在做游戏」是成熟认知 |
| Ship（上线） | 可访问的线上版本 | 官网包装 + 域名 paperroute.lol | ⚠️ 有上线，但缺发布检查表（性能/兼容/许可） |
| Live / Ops（运营） | 度量、回归、迭代 | DevClocked 记录 + devlog | ✅ 度量做得比多数独立开发者好；❌ 没有看到线上的质量监控 |

### 3.2 他做对、而且值得照抄的 6 个工程决策

1. **机制先行，美术后置。** 「Get the mechanics right first, then spin it once it's playable.」机制是**逻辑**，美术是**表现**；逻辑没定就堆表现，会让两者互相污染——这也是他明确拒绝在第一步塞美术方向的原因。
2. **确定性模拟 + 边写边补测试。** `deterministic simulation` 意味着同样的输入必然得到同样的结果，抛投落点、碰撞、计分都可以被断言。作者说测试比他预想的更重要——因为**从那一刻起，美术改动有了一个可回归的套件**。这是把「AI 写代码」变成「工程」的分水岭。
3. **两条流 = 两个上下文。** 引擎/机制和外观/资产放在不同的任务里跑。用工程语言说，这是**关注点分离**；用 Agent 的语言说，这是**避免用无关上下文污染模型的判断**。作者的原话很传神：「房子看起来不对的时候，你不会想在同一条 thread 里争论投掷物理。」
4. **Blender-as-code：资产必须可复现。** 不让模型去「操作」Blender，而是让它写 Blender 会 headless 执行的 Python——每栋房子、每棵树、每段栅栏都是脚本，网格与材质可重建、可 diff、可批量改参数。**手工拖出来的 .blend 是不可复现的资产；脚本是。**
5. **Review render 回路 = 给 3D 工作装一个测试门禁。** 3D 产物没法用文字评审，只能看渲染。作者让 Agent 自评 → 出单独渲染 → 人 review → 指着某一帧说「帽子没盖住头发」，这就形成了一个**低成本、可重复的验收动作**；Render 1→2 有 60–70% 的改进在这个回路内完成。
6. **不确定的玩法先拉分支。** 砸窗、下雨、摔倒都是独立分支/独立工作树，验证完再合并。这就是标准的 feature branch + 隔离验证，只不过分支里跑的是「一个玩法想法」。
7. **度量真实成本。** 小时、token、缓存比例、commit 数全部记录。**没有度量，就没法判断「该不该继续调」**——尤其是当 80% 的时间花在打磨上时，你需要数据来决定哪里该停。

### 3.3 按标准流程看，还缺什么

1. **CI / 合并门禁。** 项目有测试，但原文只说到「有一套测试可以跑」；没有提到每次 commit 自动跑、失败就拦住合并。对单人项目，这恰恰是最划算的一环——它保证你半夜那次美术改动不会顺手弄坏抛投物理。
2. **性能预算与真机基准。** 作者自己承认手机 60fps 未证实、88,550 三角面的角色没在真机上测。标准流程会在 vertical slice 阶段就定下**目标机型 + 帧预算 + 三角面预算**，并把它变成可自动跑的基准；「一个受控测试撑住、另一个平均 58」已经不是可交付状态。
3. **资产来源与许可。** 参考原版 Paperboy（尽管他明确不克隆）、Meshy 生成的网格、免费 Blender 资产——这些都需要一份**来源与许可清单**。商业发布时，这是最容易出事、也最便宜事先处理的一环。
4. **资产清单与命名规范。** 全部 GLB 由脚本生成，但没有提到资产目录/元数据/命名约定。有了它，资产才能被批量替换、批量减面、批量审计。
5. **关卡与内容数据驱动。** 路线、房子分布、天气编排如果都硬编码在场景逻辑里，改一次要动代码。标准做法是抽成数据（关卡文件/JSON）：**设计师改数据，程序改系统**，两者并行。作者把两条流分开已经走了一半，但内容层还没抽出数据边界。
6. **多端与兼容性验证。** 目标是「原生 iOS + Web」，但全文的验证动作都在浏览器里。至少需要一个最小的设备矩阵（真机帧率、触控手感、内存）才能说这个目标完成了。
7. **可访问性与本地化。** 无相关提及；发布前应有最基本的可调项（音量、字幕/文字大小、色觉友好配色）。

### 3.4 如果你想复刻：一份可执行的流程清单

1. 用你自己的话写 brief：核心机制 + 情绪目标 + **一张最接近的参考图**。
2. 明确验收标准（哪些机制必须能玩、目标平台与帧率底线）。
3. 让 Agent 做出**一条端到端可玩的窄切片**，别碰美术。
4. 在切片上补上确定性测试，并**接进 CI**，每次提交自动跑。
5. 把「机制」和「美术」拆成两条独立任务线/上下文。
6. 美术先做 mood board，样本先单独渲染，再进可玩世界。
7. 资产用脚本生产（Blender-as-code），建立资产命名与清单。
8. 每改一次出一个 review 渲染图；人只做「指认哪一帧不对」。
9. 角色走「概念 → Meshy → 减面 → 绑定 → review → 进游戏」的固定管线。
10. 不确定的玩法先进分支验证，通过再合并。
11. 留出全天量级的打磨时间给手感、动画、天气与结局。
12. 上线前过一遍发布检查表：性能、兼容、许可、可访问性；上线后记录数字。

## 值得带走的几条

- **一次生成能给你惊艳，流程才能给你完整。** 作者最有价值的话不是「Astra 多强」，而是「one-shot 做不出好看又完整的游戏，只会做出 slop」。
- **美术后置不是轻视美术，而是给它一个稳定的地基。** 机制定下来之后，美术的每一次改动都有测试兜底，改起来才敢改。
- **把「资产」当代码管。** Blender 脚本化建模让资产可复现、可批量、可回归——这是全文最容易被忽略、也最容易复用的一条。
- **对 AI 产物的验收必须是看得见的东西。** 3D 工作没法读 diff，那就把渲染图变成评审对象：指着帧说话，比写一百句形容词有用。
- **承认边界比吹能力更专业。** 作者主动写下「手机 60fps 未证实」「88,550 三角面没上真机」，这比任何宣传都更能说明他对工程的理解。
- **度量决定你能走多远。** 39 小时、15.6 亿 token、2,175 美元、90 个 commit——有了这些数字，「要不要继续调这一栋房子」才是个可以回答的问题。

## 附：原始文件

- 原文全文（英文照录，保留作者 Step 编号）：`transcript-X_2098773631249854478.md`
- 配图（画面 + 原文原句 + 中文翻译的合成图，共 10 张）：`/blog/x/2098773631249854478/fig01–fig10.jpg`
- 演示片节选（65 秒，1024 宽，无旁白）：`/blog/x/2098773631249854478/clip.mp4`
- 原文：[x.com/builtbysketch/status/2098773631249854478](https://x.com/builtbysketch/status/2098773631249854478) · 演示片所在推文：[x.com/builtbysketch/status/2096515959469072630](https://x.com/builtbysketch/status/2096515959469072630) · 游戏：[paperroute.lol](https://paperroute.lol/)
