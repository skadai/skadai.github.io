---
title: 如何部署11ty到github page
description: This is a post on My Blog about agile frameworks.
date: 2021-07-31
layout: layouts/post.njk
tags:
  - tech
image: https://cdn.pixabay.com/photo/2020/08/30/20/54/rice-field-5530707_1280.jpg
---

#### 流程

1. 下载11ty 模板 https://github.com/google/eleventy-high-performance-blog, 按照提示构建自己的本地博客


2. 新增 .nojekyll 文件, 此文件用来告知 github-page 不使用 jekyll 以免产生冲突

3. 新增你自己的git仓库, 命名为 \<username\>.github.io

4. 利用下面的命令生成一对秘钥

  ```shell
      ssh-keygen -t rsa -b 4096 -C "$(git config user.email)" -f gh-pages -N ""
  ```

 - 公钥添加到刚刚的仓库 deploy key

   ![添加公钥](http://cdn.glofission.xyz/img/58b01ba0e0ca16a8610e92c1d0d2b661-20210730142442-19f6c1.png)
 
 - 私钥添加到刚刚的仓库 secret
   
   ![添加私钥](http://cdn.glofission.xyz/img/a99999f7a1731866c320691fcb87e148-20210730142605-2772eb.png)

5. 在本地项目新增 .github/workflow/build.yml 文件, 添加下面的内容, 主要逻辑是打包静态文件, 并调用预定义的github action 把
编译好的文件提交到git仓库

```yml
name: Eleventy Build

on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
        - uses: actions/checkout@v2

        - name: Setup Node
          uses: actions/setup-node@v1
          with:
            node-version: '14.x'

        - run: npm ci

        - run: npm run build

        - name: Deploy
          uses: peaceiris/actions-gh-pages@v3
          with:
            deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}
            publish_dir: ./_site

```

> 上面文件中 secrets.ACTIONS_DEPLOY_KEY 正好对应了步骤4中配置好的私钥, 这样action中可以向仓库gh-page分支提交编译好的文件


6. 最后一步, 把github-page的source 设置为gh-page, 这样每次往master分支提交内容之后, 就可以触发 action 自动编译文件push到gh-page分支, 你可以在自己的 \<username\>.github.io 看到最新的博客了


#### 参考资料
 - https://www.rockyourcode.com/how-to-deploy-eleventy-to-github-pages-with-github-actions/
 - https://www.linkedin.com/pulse/eleventy-github-pages-lea-tortay/
 - 11ty基本用法
    - https://www.bilibili.com/video/BV1zw41197NL?from=search&seid=4624100872590089830
    - https://www.11ty.dev/