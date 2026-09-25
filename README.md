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

## 样式与主题

全站样式集中在 `src/styles/global.css`，由 `BaseLayout.astro` 引入：

- **设计令牌**：色彩用 oklch 定义在 `:root`（`--paper` / `--ink` / `--accent` 等），深色主题在
  `[data-theme="dark"]` 与 `prefers-color-scheme: dark` 下覆盖同一组变量。
- **字体分工**：标题与正文用衬线（`--serif`，拉丁字母走 Newsreader/Georgia，CJK 回落到系统无衬线），
  界面用 `--sans`，元信息（日期、字数、面包屑、代码）用 `--mono`；不加载外部字体。
- **主题切换**：页头右侧按钮在「跟随系统 → 浅色 → 深色」之间循环，选择存在
  `localStorage` 的 `chengshu-theme` 键；`<head>` 里有一段内联脚本在首屏渲染前套用，避免闪烁。
- **文章页**：自动生成「本篇目录」（取 `h2`），桌面端为右侧吸附栏，窄屏折叠到正文上方；
  滚动时高亮当前小节。
- **代码高亮**：`astro.config.mjs` 里 Shiki 同时产出 light / dark 两套 token 颜色，由 CSS 决定用哪一套。

## 搜索与订阅

- 站内搜索：`/search/`，按文章标题（大小写不敏感、支持中文子串）过滤，数据来自构建产物 `posts.json`；可用 `?q=关键词` 直接分享结果链接。
- 订阅：RSS 位于 `/rss.xml`，JSON Feed 位于 `/feed.json`，两个地址都在页面 `<head>` 里声明了 `<link rel="alternate">`，页脚也提供了入口。

## 内嵌视频

正文支持三种视频内嵌方式，样式在 `src/styles/global.css`。

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
