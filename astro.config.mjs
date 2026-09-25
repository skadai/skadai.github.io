// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.chengshu.space',
  base: '/',
  markdown: {
    // 代码高亮同时产出 light / dark 两套 token 颜色，由 CSS 决定用哪一套
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
});
