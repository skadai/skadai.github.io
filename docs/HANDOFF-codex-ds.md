# Handoff: skadai.github.io for Codex·ds

Maintainer path for Herdr Codex deepseek (`-p cn-model`). Date: 2026-09-05.

## Repo
- https://github.com/skadai/skadai.github.io
- Default branch: **master**
- Live: https://blog.chengshu.space
- Deploy: `.github/workflows/deploy.yml`
- Archive old `skadai/astro-blog` manually (no MCP archive API)

## Posts
- Path: `src/content/blog/*.md`
- Schema: `src/content.config.ts`
- Public filter: `draft === false` in `src/lib/posts.ts`
- URL: `/posts/<slug>/`
- Tags: `/tags/`

## Frontmatter
`title`, `description`, `pubDate`, `updatedDate`, `slug`, `category`, `tags`, `status`, `draft: false`, `published`, `source`

## How to change
- Prefer GitHub MCP `push_files` on `master` (no SHA)
- Or `create_or_update_file` with SHA from `get_file_contents`
- Cloud Agent unavailable on current plan

## Critical
Never put a filesystem path / `FILE_CONTENT_FROM_` / `@/workspace/...` in file `content`. Content must start with YAML `---`.
Verify: `curl -sL raw.githubusercontent.com/skadai/skadai.github.io/master/src/content/blog/<file>.md | head -c 80`

## Latest post
- `src/content/blog/grok-bot-delegatable-team-report.md`
- https://blog.chengshu.space/posts/grok-bot-delegatable-team-report/
- Fix commit: `9f5a208`
- Local backup on box: `/workspace/blog-posts/grok-bot-delegatable-team-report.md`

## Codex·ds
`codex -p cn-model -m deepseek-v4-flash` (or Herdr equivalent). Do not default to glm.
