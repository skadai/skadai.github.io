---
title: DBSCAN 原理篇
description: This is a post on My Blog about agile frameworks.
date: 2021-08-18
layout: layouts/post.njk
tags:
  - tech
  - clustering
image: https://cdn.pixabay.com/photo/2020/08/30/20/54/rice-field-5530707_1280.jpg
---

本文是[meidum odessa-ml-club博客](https://medium.com/odessa-ml-club/a-journey-to-clustering-introduction-to-dbscan-e724fa899b6f)的阅读整理

## DBSCAN 背景

**1996 年,** 论文 A Density-Based Algorithm for Discovering Clusters in Large Spatial Databases with Noise 中提出来该算法, 文章基于一个朴素的假设: 人们是通过类内密度比其他区域要明显的高识别出来类簇的, 反之, 如果只是有一些噪音, 应该是杂乱无章的, 比类簇内部的数据点密度要明显的小。

### 数据划分

DBSCAN 将数据分为了三类, 具体来说, 是通过两个参数划分的,  附近[e]范围内含有[u]节点

- core point(cluster center): 附近距离e范围内至少含有u个节点
- border point(cluster margin): 自己本身不是core point但是在其他core point的范围之内
- noise data: 不属于上面的两个范围

对于相同的数据集, 不同的参数选择得到的数据结果是不同的。

### 数据间关系

1. directly density-reachable 两个节点其中一个是core point并且另外一个位于e范围
2. density-reachable 一个节点通过多层 directly density-reachable关系可以找到另外一个节点
3. 存在中间节点c, 节点a和b都满足和c density-reachable, 那么a和b是density connected

上面三个关系是逐渐变弱的, directly density-reachable更是强调了 core point的概念, 不具有交换性

### cluster 定义

- 数据节点的集合C中, 任意两个都是 density-connected
- 任何一个节点属于C, 则这个节点所有 density-connected的节点也属于C

从节点的定义出发可以得到下面的定理的

1. 对于集合中的 core point来说, 所有节点都是 density-reachable的, 集合就是core point的density-reachable的所有节点的总和 (所有的core point和margin point必然属于某个集合)

2. 如果两个集合存在交集, 则交集中的节点全部是 border point

### 算法过程

1. 遍历集合中的所有节点, 为每个节点进行标识
2. 如果节点已经标识, 跳过, 如果节点没有标, 看是不是 core point, 是的话步骤3, 不是0
3. cluster数目加1, 把节点 density-reachable的所有节点都标上

> 在遍历节点的过程中, 用了 R*-tree 数据结构, 是的算法的时间复杂度为 O(nlgn)

### 参数估计问题

算法输入的参数 e 和 u 对于聚类的结果是有明显影响的, 这两个参数如何决定呢?
DBSCAN的作者在原有模型的基础上提出了 GDBSCAN （参数选择都是程序帮忙完成了）

通过计算每个节点最近**第k个点**的距离, 降序排列, 可以得到 k-dist plot曲线如下, 对于噪声点距离是比较大的, 如果节点在cluster中距离就比较小的, 所以可以看出曲线会逐渐归于平缓

![4-distance-plot](https://miro.medium.com/max/700/1*ShWe1k8ejMaG1aZG0s8dng.png)

作者建议选择 e 值在 k-dist-plot 平缓区间和下降区间的交界附近, 对应的横坐标 p * 2 作为u的建议取值

### DBSCAN的问题

#### 均匀性分布问题

如果cluster 内部的节点分布是不均匀的, 那么聚类效果就没有那么理想了

![problem](https://miro.medium.com/max/2000/1*Pic2bp-_2cthiEEOiUUczg.png)

可以通过人工选择参数搞出来比较不错的的结果但是这样其实就属于经验了, 没办法复制

![tune](https://miro.medium.com/max/2000/1*grFBxXreguk6I5K_ZQOXVw.png)

#### overlapping

当两个cluster之间存在一些交叉区域, 有可能会被染成一个。这个是比较难以处理的，如果把 e 增大, u减少, 相当于削弱了 cluster 限制, 可能cluser都被连成一块, 反之如果e减少, u增加, 加强了cluster 的限制, 可能会出来更多的区域

![problem](https://miro.medium.com/max/2000/1*NBly3GDNjCT3HJsXFMke5A.png)

### 小结

DBSCAN 算法的主要利弊是

#### 优势

1. 不需要提前给定cluster数目
2. 对于一些离散很强的点, 很容易干掉
3. 善于处理cluster形状不规则, distance函数选择丰富

#### 劣势

1. 虽然有经验公式, 参数选择同样是需要微调的
2. 集合内部分布不均匀, 存在 overlap区域的时候表现不好

DBSCAN不是完美的, 但是其思想推动了一系列密度相关的聚类算法的提出, 直到现在也是经常被讨论的, 经典地位不可撼动

## 参考

- [a journey to clustering algorithm](https://medium.com/odessa-ml-club/a-journey-to-clustering-introduction-to-dbscan-e724fa899b6f)
