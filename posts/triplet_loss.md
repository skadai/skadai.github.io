---
title: Triplet Loss and Online Triplet Mining (翻译)
description: This is a post on My Blog about CBIR
date: 2021-08-17
layout: layouts/post.njk
tags:
  - tech
  - CBIR
---

> 工作中碰到一个棘手的问题: 如何从海量商品中找到标准库中的那一个？
自己尝试过通过纯文本信息（标题, 商品简介, 图片ocr识别出文字）效果不佳, 决定换一个思路看看图像检索能不能提供一些有价值的信息。
>
> 本系列打算结合这个具体的问题, 系统总结下图像检索领域的基本概念


**看到了 omoindrot的 [博客文章](https://omoindrot.github.io/triplet-loss)对理解 triplet loss 的原理和实现都非常有帮助, 特此翻译**

## Triplet loss and triplet mining

### 为什么不用 softmax

Triplet loss (三元组损失) 是谷歌在经典论文 [FaceNet: A Unified Embedding for Face Recognition and Clustering](https://arxiv.org/abs/1503.03832) 中提出的一种用来训练人脸 embedding 表征的损失函数。

和传统的分类问题(固定类别数目, 使用交叉熵损失函数)不同, 人脸识别, 商品检索往往是大量的不确定类别匹配问题, 这个时候更好的做法是判断两个item是不是属于同一个类别。

三元组损失就是为了上面的应用场景而出现的, 训练目标是来自同一个类别的样本距离要比来自不同类别的样本距离要近, 同一个列表样本形成一个类簇, 不同的类簇之间最好距离足够大。

### 损失定义

![奥巴马和马克龙损失](https://omoindrot.github.io/assets/triplet_loss/triplet_loss.png)

三元组损失的目标是在特征空间中满足

1. 相同标签的样本距离比较近
2. 不同标签样本距离比较远
  
然鹅, 我们不希望让每个标签的样本训练到特别小的空间内（这句话原文 `we don’t want to push the train embeddings of each label to collapse into very small clusters` 没有太理解, 作者专门解释了附在下面）

> When I mentioned that I meant that if you want to do classification or any task based on the embeddings, you only need the intra-cluster distance to be smaller than the inter-cluster distance. If you have that, then two examples from the same class will always have their embeddings closer than two examples from different classes.
Once this is done, you don't really need to push the clusters closer together. My intuition is that if you do so, it's a form of overfitting and you will lose in test accuracy.
> 
> In SphereFace they do something similar to softmax. Softmax is also going to push the predictions as close to 0 or to 1 as possible, which is to me a form of overfitting.

啰嗦了半天, 损失具体是这样设计的

- anchor: 锚点样本(query 样本)
- postive: 正样本(和锚点样本标签一样)
- negative: 负样本(和锚点样本标签不一样)

`loss = max(d(a, p) - d(a, n) + margin, 0)`

损失是锚点和正样本的距离减去负样本距离加上margin, 稍微解释一下
试想

- 如果锚点和正样本距离很近, 和负样本距离很远, 也就是达到我们的理想embedding条件, 此时loss为0
- 如果锚点和正样本距离比较近, 和负样本距离比较远, 但是也没远多少, 此时因为有margin的存在, 这种情况loss会是一个 0-margin的值
- 锚点和正样本反而比较远, 和负样本比较近, 这个时候 loss 直接大于margin
  
上面三种情况分别对应模型区分的简单(easy negative), 中等(semi-hard negative), 困难的(hard negative)情况, 因此loss是一个比一个大的, 下面的图比较生动

![triplet illustration](https://omoindrot.github.io/assets/triplet_loss/triplets.png)

### 三元组筛选( triplet mining)

上面关于三元组损失的定义有了, 只是从原理上大体实现了训练目标, 那么具体实现上选择那些样本作为三元组做法是很多的, 三元组的筛选主要分为 offline and online 两类

#### offline mining (不好用)

训练每个epoch之前, 把训练集全部embedding算出来, 找到 semi-hard 和 hard 进行训练, 计算量比较大

#### online mining (好用)

在epoch每个batch训练的时候, 直接来, 不需要遍历全部的训练集, 就在一个小范围上面计算embedding并找到符合要求的

### 在线筛选策略

简而言之就是什么样的三元组需要进行训练, 在论文 [ In Defense of the Triplet Loss for Person Re-Identification.](https://arxiv.org/abs/1703.07737) 有详述

假设每个batch size 为 B = PK ,  其中 P表示不同的标签, K表示每个标签挑选的样本数目, 我们只需要在这个小范围内进行挑选合适的三元组

#### batch all

- 选择所有合法的三元组(正样本和anchor同标签, 负样本和anchor标签不同), 刨除掉easy negative之后取平均loss
- 总共可能的三元组数目 PK(K-1)(PK-K), 依次表示, anchor可能数目, postive 可能数目, negative 可能数目

#### batch hard

- 每一个anchor, 在当前 batch中 选择最困难的正样本(d(a,p) 最大) 和最困难的负样本( d(a, n)最小)形成三元组进行训练
- 总共可能的三元组就是 PK, 每个batch就只选择最困难的训练样本进行训练（论文声称这样比 batch all表现好, 好不好不知道, 但是训练时间短是真的）

#### 后续章节(略)
下面是代码实现和示例项目, 直接看原博就好了。 尤其是作者关于 batch hard strategy 的实现, 可谓是赏心悦目, 值得好好学习

#### 感想

triplet loss 的思想和之前看过的一个[文章](https://github.com/wvangansbeke/Unsupervised-Classification)有一些相似, 都是关注样本内部相同标签和不同标签的差异性, 后者解决的是固定标签数目的无监督分类问题, 直接用图片的变化认为是一个正样本来做, anchor和正样本的距离尽可能小, 配合 self-labelling (把置信度高的直接当成标注数据) 让无监督分类的准确率直接达到了 85% 以上

对于商品匹配问题, 从类间差异和类内共性出发, 有没有可能挖掘一些弱监督的训练手段呢 ?
