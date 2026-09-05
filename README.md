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

## GitHub Pages 部署

`astro.config.mjs` 已配置站点地址 `https://skadai.github.io` 与根路径 `base: '/'`。工作流位于 `.github/workflows/deploy.yml`，推送到 `main` 分支后会自动构建并部署到 GitHub Pages；也可以在 Actions 页面手动触发。

首次部署前，需要在 GitHub 仓库的 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。
