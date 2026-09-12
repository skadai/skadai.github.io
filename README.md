# Chengshu

一个使用 [Astro](https://astro.build/) 构建的极简中文静态博客，部署目标为：

<https://skadai.github.io/>

站点现已从仓库根路径部署到 `skadai.github.io` 根域名（`base: '/'`）。编辑文章请修改 `src/content/blog/`。

## 本地开发

项目需要 Node.js 22.12 或更高版本，仓库中的 `.nvmrc` 固定为 Node.js 22.19。

```sh
nvm use
npm install
npm run dev
```

开发服务器默认运行在 <http://localhost:4321/>。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建静态文件到 `dist/` |
| `npm run preview` | 本地预览生产构建 |

## 添加文章

文章由 Astro Content Collections 管理。在 `src/content/blog/` 中新建 Markdown 文件即可，字段结构定义在 `src/content.config.ts`。

首页和文章路由只会读取 `draft: false` 的内容；标记为 `draft: true` 的草稿不会出现在列表中，也不会生成公开页面。

## 搜索与订阅

- 站内搜索：`/search/`，按文章标题（大小写不敏感、支持中文子串）过滤，数据来自构建产物 `posts.json`；可用 `?q=关键词` 直接分享结果链接。
- 订阅：RSS 位于 `/rss.xml`，JSON Feed 位于 `/feed.json`，两个地址都在页面 `<head>` 里声明了 `<link rel="alternate">`，页脚也提供了入口。

## 内嵌视频

正文支持三种视频内嵌方式，样式都在 `src/layouts/PostLayout.astro`。

**1. YouTube / Bilibili（iframe）** —— 16:9 自适应容器：

```html
<div class="video-embed">
  <iframe src="https://www.youtube.com/embed/<VIDEO_ID>" title="..." allowfullscreen loading="lazy"></iframe>
</div>
```

**2. X / Twitter（官方 widget）** —— 把推文地址套进 `blockquote` 即可；页面只有在真的出现 `.video-embed-x` 时才会去加载 `platform.twitter.com/widgets.js`：

```html
<div class="video-embed-x">
  <blockquote class="twitter-tweet">
    <a href="https://x.com/<user>/status/<id>">推文</a>
  </blockquote>
</div>
```

注意：X 的 widget 需要读者能访问 `platform.twitter.com`；如果读者在无法访问 X 的网络里，建议改用下面的自托管方式。

**3. 自托管 `<video>`** —— 把 mp4 放进 `public/`（例如 `public/blog/<platform>/<id>/clip.mp4`），用原生播放器引用，不依赖任何第三方：

```html
<div class="video-local">
  <video controls preload="metadata" playsinline poster="/blog/<platform>/<id>/poster.jpg">
    <source src="/blog/<platform>/<id>/clip.mp4" type="video/mp4" />
  </video>
  <figcaption>说明文字</figcaption>
</div>
```

自托管视频会计入仓库体积（GitHub 单文件上限 100 MB），长视频建议只放节选，完整版用平台内嵌或外链。

## GitHub Pages 部署

`astro.config.mjs` 已配置站点地址 `https://skadai.github.io` 与根路径 `base: '/'`。工作流位于 `.github/workflows/deploy.yml`，推送到 `main` 分支后会自动构建并部署到 GitHub Pages；也可以在 Actions 页面手动触发。

首次部署前，需要在 GitHub 仓库的 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。
