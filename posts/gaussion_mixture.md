---
title: Gaussion Mixture Models 原理篇
description: This is a post on My Blog about agile frameworks.
date: 2021-08-19
layout: layouts/post.njk
tags:
  - tech
  - clustering
image: https://cdn.pixabay.com/photo/2020/08/30/20/54/rice-field-5530707_1280.jpg

---

本文是[Cory Maklin博客](https://towardsdatascience.com/gaussian-mixture-models-d13a5e915c8e)的阅读整理

## Gaussian Mixture Model 背景

大体上和 k-means 是类似的，主要是两点区别

1. 解决了 k-means 没有解决的一个关键性问题 variance,  就是说没有考虑到cluster内部分布到底是什么形状，直接楞拿一个hyper-sphere球状空间硬套

![k-means](https://gitee.com/skadai/bluebird/raw/master/98e4ff29c28a5125991153407c39a563-20210819111747-e232ef.png)

相比于上图，我们更希望直接得到下图

![img](https://gitee.com/skadai/bluebird/raw/master/a5aca86eb7538b11653de147f364df6c-1-eTAFs5cTUjb_kt-4RgE3uw-c4f628.png)

2. k-means 进行 hard-classification 而 gaussian-mixture-model 进行的是 soft-classification, k-means中直接就告诉一个点属于哪一个cluster，没有输出属于各个cluster的概率，一锤子买卖没有纠正机会

### 初识

从数学的角度，高斯混合模型对一个点属于某个分布（cluster）的概率进行建模

`P (z = k|q)` 中 q表示不同高斯分布的参数（均值，方差，权重） 

### EM 算法

> 在 GMM的模型中, 一个点来自哪个高斯分布是隐含变量, 高斯混合模型通过隐变量生成样本, 每个样本点的概率等于各个高斯模型的概率的加权和

1. 初始化高斯分布的参数q

2. 按照下面的步骤迭代直到收敛

   - 计算 `P (z_i = k| xi, q)` 也就是某一个数据点位于来自cluster k的概率是多少
   - 更新高斯分布的参数q, 使得概率最大

看上去是有点抽象的...., 可以参考一篇 [EM算法介绍](https://www.bilibili.com/video/BV1Mx411o7ti) 的视频理解

### 代码

GMM (Gaussian mixture model) 的输入是cluster_number, 初始化分布的参数, 和dbscan一样, 也有一些经验公式可以参考, 比如 [AIC](https://en.wikipedia.org/wiki/Akaike_information_criterion) 和 [BIC](https://en.wikipedia.org/wiki/Bayesian_information_criterion)

### 小结

GMM 是 K-means的加强版, 额外考虑到了数据簇内部分布不均的情况
