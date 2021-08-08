---
title: 试用 RSSHub
description: This is a post on My Blog about agile frameworks.
date: 2021-08-07
layout: layouts/post.njk
tags:
  - tech
image: https://cdn.pixabay.com/photo/2020/08/30/20/54/rice-field-5530707_1280.jpg
---


#### RSS 是什么

[RSS](https://en.wikipedia.org/wiki/RSS) 的全称是 RDF Site Summary 或者 Really Simple Syndication, ~~别问我英文啥意思我不认识~~
就是让不同的网站的数据都可以用统一的格式进行定义和传输，这样我们可以挑选自己感兴趣的网站进行订阅，获取到新的文章集中阅读了，这可以让我们集中阅读感兴趣
的文章乃至观看视频，不用在网站上面晃来晃去浪费时间啦

#### RSS 阅读器

不少网站都提供了下面这个按钮，其实代表的就是rss的意思，点击按钮可以得到一个url，这个url提供的就是和正式网站一直但是样式有别的订阅内容了，通常会是xml格式的文本，所以是没办法方便直接看的。
![rss icon](http://cdn.glofission.xyz/img/1b1fe7c45939aff7450787a980c29691-20210807171958-32a5c6.png)

此时呢，我们需要有一个阅读器可以解析这么内容并渲染成良好的格式，比如 mac 用户可以选择 [reeder](https://reederapp.com/)。
使用的方式也是很简单的，直接在reeder中创建一个本地rss账户, 然后添加订阅源

![reeder操作](http://cdn.glofission.xyz/img/5587b52eff73570439b162d574847050-20210807173555-f52921.png)

然后就可以看到，添加源的文章已经一个个排好等待阅读了，reeder 阅读器已经帮忙渲染好了，可以看到排版还是不错的

![reeder article](http://cdn.glofission.xyz/img/5f62ce7eb780ed571010188fe8765b2d-20210807173835-088b0a.png)

#### RSSHub

实际上，很多网站是没有上面那个魔法图标的，比如b站，我们每次就只能进入网站，点击关注的up动态，看有没有投稿，然后再点进去观看了么？

当然是有更好的办法的，[RSSHub](https://github.com/DIYgod/RSSHub) 就是来干这个的

> RSSHub 是一个开源、简单易用、易于扩展的 RSS 生成器，可以给任何奇奇怪怪的内容生成 RSS 订阅源。RSSHub 借助于开源社区的力量快速发展中，目前已适配数百家网站的上千项内容

翻译一下，就是会写代码的人已经帮把一些常用的网站做好了提取rss的方法，只需要有个机器能根据这些方法把网站数据整成标准 RSS 的格式并提供 url 链接，然后我们就像上面那样用就好了。下面的图片展示了 RSSHub 支持了哪些网站，还是相当丰富的

RSSHub 自己是提供了试用 [demo](https://rsshub.app) 的，只需要简单的按照不同网站指定的url格式自己拼接，然后直接粘贴到阅读器里面就完事了！

<div style="display:flex;justify-content:space-between">
<img src="http://cdn.glofission.xyz/img/9d3beee4c6f6ef1f1228b0b706e80863-20210807175616-dc81cd.png">
<img src="http://cdn.glofission.xyz/img/179e3b153d7d76dc0497e6f7d4944a2a-20210807175551-b96172.png">
</div>

#### RSSHub 部署

官方试用的demo毕竟太多人用，很容易遭到网站的反爬限制，这个时候你可以选择自己部署一个 RSSHub 的服务, RSSHub 的官方文档里面也有 [操作说明](https://docs.rsshub.app/install/), 亲测可用

下面简单描述下流程，首先得有一个自己的服务器，我用的是 aliyun ECS(单核 内存2GiB, 硬盘40GB)

1. ssh 登录到服务器

2. 拉取 RSSHub 的 Docker 镜像, 不加 tag 的话会直接下载最新的

```shell
docker pull diygod/rsshub
```
> 如果没有用过 docker 的话需要自己先安装一下， 可以参考 [Ubuntu Docker安装](https://www.runoob.com/docker/ubuntu-docker-install.html)

3. 启动镜像
```shell
docker run -d --name rsshub -p 1200:1200 diygod/rsshub
```
稍微解释一下上面这个命令

- `docker run` 就是把镜像启动一个容器跑起来，`--name` 给容器命名， `-d` 指定后台运行
- `-p 1200:1200` 并让服务器上面的1200端口和容器内部的1200建立映射，这样在服务器上面访问 localhost:1200 就可以访问到容器里面的服务了，容器内部的端口1200是写死的，但是服务器上面的端口是可以修改的，比如改成8000（如果没有冲突的话）

4. 服务器安全组加上1200端口, 操作如下


好吧，其实上面 RSSHub 文档里面都有....

![add rule](http://cdn.glofission.xyz/img/a070687ca2ed0a117eac459bd2edfbfc-20210807181508-b0ee44.png)

![add rule2](http://cdn.glofission.xyz/img/69562bef7d90ce983ade57b9262dc30c-Jietu20210807-181822-d48ca9.jpg)

5. 把安全组应用到ECS上面

![apply rule](http://cdn.glofission.xyz/img/c7c495b56bb08bcbbe1b7bc593012e6e-20210807182042-0a7e9a.png)

上面图片打码的就是服务器的公网 IP了，经过上面一通操作我们在浏览器输入 http://<公网IP>:1200, 看到和上面 RSSHub demo 一样的页面就算部署成功了，之后我们就可以用专属的RSS 提取服务来生成订阅源了🙂

![final page](http://cdn.glofission.xyz/img/20dd670b20cc76c57676829ac7ba0657-20210807182335-38e268.png)

---

有个 RSSHub + Reeder 这个组合，就可以很方便添加自己感兴趣的内容了，不用在漫无目的的看了，大大的节省时间（~~maybe是看了更多有的没的~~）