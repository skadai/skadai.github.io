import { getPublishedPosts, postPath, postSlug, type BlogPost } from './posts';

export interface SeriesChapter {
  /** Slug of the published post. */
  slug: string;
  /** Label shown in the chapter list, e.g. 「第一讲」or「附录」. Defaults to 第 N 篇. */
  label?: string;
}

export interface UpcomingChapter {
  label: string;
  title: string;
}

export interface SeriesDefinition {
  id: string;
  title: string;
  tagline: string;
  description: string;
  cover?: string;
  coverAlt?: string;
  tags?: string[];
  chapters: SeriesChapter[];
  /** Planned chapters that are not published yet; rendered as non-clickable rows. */
  upcoming?: UpcomingChapter[];
}

export const seriesList: SeriesDefinition[] = [
  {
    id: 'deepseek-deploy',
    title: '关于deepseek部署你要知道的一切',
    tagline: '给只懂 vanilla transformer 的人写的 DeepSeek-V4.1-Flash 部署术语课',
    description:
      '以 vLLM Recipes 官方页面 deepseek-ai/DeepSeek-V4.1-Flash（Updated 2026-09-20）为底稿，把 MoE、Engram、两级稀疏注意力、超连接、YaRN、MXFP4/MXFP8、TP/DEP、PD 分离这些术语逐个拆开讲清楚：它是什么、为什么需要它、不知道它会踩什么坑。13 篇正文已全部更新完毕，另附官方页面中文全译。',
    cover: '/blog/deepseek-deploy/cover.jpg',
    coverAlt: '系列封面：以书库形态呈现的服务器、被点亮的少数专家模块，以及代表长上下文的光带',
    tags: ['DeepSeek', 'vLLM', '模型部署', 'MoE'],
    chapters: [
      { slug: 'deepseek-deploy-01-model-overview' },
      { slug: 'deepseek-deploy-02-moe-routing' },
      { slug: 'deepseek-deploy-03-vision-path' },
      { slug: 'deepseek-deploy-04-attention-kv-cache' },
      { slug: 'deepseek-deploy-05-sparse-attention' },
      { slug: 'deepseek-deploy-06-engram' },
      { slug: 'deepseek-deploy-07-hyper-connections' },
      { slug: 'deepseek-deploy-08-rope-yarn-context' },
      { slug: 'deepseek-deploy-09-number-formats-memory' },
      { slug: 'deepseek-deploy-10-speculative-decoding' },
      { slug: 'deepseek-deploy-11-parallelism-tp-dp-ep' },
      { slug: 'deepseek-deploy-12-pd-disaggregation' },
      { slug: 'deepseek-deploy-13-hands-on' },
      { slug: 'deepseek-deploy-appendix-recipe-zh', label: '附录' },
    ],
  },
  {
    id: 'stanford-cs336',
    title: 'Stanford CS336 精读',
    tagline: 'Language Modeling from Scratch · 2025 Spring 逐讲笔记',
    description:
      '斯坦福 CS336《Language Modeling from Scratch》全部 17 讲的完整中文讲义：为什么先讲分词、PyTorch 的资源账、架构与超参数、MoE、GPU、Triton 内核、并行、scaling laws、推理、评测、数据与对齐。每讲按课堂顺序逐段整理，并附讲座配图。',
    tags: ['Stanford', 'CS336', '语言模型', '课程讲义'],
    chapters: [
      { slug: 'stanford-cs336-lecture-01-overview-tokenization', label: '第一讲' },
      { slug: 'stanford-cs336-lecture-02-pytorch-resource-accounting', label: '第二讲' },
      { slug: 'stanford-cs336-lecture-03-architectures-hyperparameters', label: '第三讲' },
      { slug: 'stanford-cs336-lecture-04-mixture-of-experts', label: '第四讲' },
      { slug: 'stanford-cs336-lecture-05-gpus', label: '第五讲' },
      { slug: 'stanford-cs336-lecture-06-kernels-triton', label: '第六讲' },
      { slug: 'stanford-cs336-lecture-07-parallelism-1', label: '第七讲' },
      { slug: 'stanford-cs336-lecture-08-parallelism-2', label: '第八讲' },
      { slug: 'stanford-cs336-lecture-09-scaling-laws-1', label: '第九讲' },
      { slug: 'stanford-cs336-lecture-10-inference', label: '第十讲' },
      { slug: 'stanford-cs336-lecture-11-scaling-laws-2', label: '第十一讲' },
      { slug: 'stanford-cs336-lecture-12-evaluation', label: '第十二讲' },
      { slug: 'stanford-cs336-lecture-13-data-1', label: '第十三讲' },
      { slug: 'stanford-cs336-lecture-14-data-2', label: '第十四讲' },
      { slug: 'stanford-cs336-lecture-15-alignment-sft-rlhf', label: '第十五讲' },
      { slug: 'stanford-cs336-lecture-16-alignment-rl-1', label: '第十六讲' },
      { slug: 'stanford-cs336-lecture-17-alignment-rl-2', label: '第十七讲' },
    ],
  },
];

export function getSeries(): SeriesDefinition[] {
  return seriesList;
}

export function getSeriesById(id: string): SeriesDefinition | undefined {
  return seriesList.find((series) => series.id === id);
}

export function seriesPath(id: string, basePath: string): string {
  const base = basePath.replace(/\/$/, '');
  return `${base}/series/${id}/`;
}

export function seriesIndexPath(basePath: string): string {
  const base = basePath.replace(/\/$/, '');
  return `${base}/series/`;
}

export interface ResolvedChapter {
  label: string;
  title: string;
  description: string;
  href: string;
  pubDate: Date;
}

export interface ResolvedSeries {
  series: SeriesDefinition;
  chapters: ResolvedChapter[];
  href: string;
  publishedCount: number;
}

/** Join the series chapter list with the published posts it points at. */
export function resolveSeries(
  series: SeriesDefinition,
  posts: BlogPost[],
  basePath: string,
): ResolvedSeries {
  const bySlug = new Map(posts.map((post) => [postSlug(post), post]));
  const chapters: ResolvedChapter[] = [];

  series.chapters.forEach((chapter, index) => {
    const post = bySlug.get(chapter.slug);
    if (!post) return;
    chapters.push({
      label: chapter.label ?? `第 ${index + 1} 篇`,
      title: post.data.title,
      description: post.data.description ?? '',
      href: postPath(post, basePath),
      pubDate: post.data.pubDate,
    });
  });

  return {
    series,
    chapters,
    href: seriesPath(series.id, basePath),
    publishedCount: chapters.length,
  };
}

/** Series membership of a post, for the banner on the post page. */
export function seriesMembership(
  slug: string,
  basePath: string,
): { series: SeriesDefinition; label: string; href: string } | undefined {
  for (const series of seriesList) {
    const index = series.chapters.findIndex((chapter) => chapter.slug === slug);
    if (index >= 0) {
      const chapter = series.chapters[index];
      return {
        series,
        label: chapter.label ?? `第 ${index + 1} 篇`,
        href: seriesPath(series.id, basePath),
      };
    }
  }
  return undefined;
}
