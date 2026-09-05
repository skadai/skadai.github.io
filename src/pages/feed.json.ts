import type { APIRoute } from 'astro';
import { absolutePostUrl, getPublishedPosts } from '../lib/posts';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPublishedPosts();
  const siteOrigin = (site ?? new URL('https://skadai.github.io')).origin;
  const base = import.meta.env.BASE_URL;
  const homePageUrl = `${siteOrigin}${base.replace(/\/?$/, '/')}`;
  const feedUrl = `${siteOrigin}${base.replace(/\/$/, '')}/feed.json`;

  const body = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Chengshu',
    home_page_url: homePageUrl,
    feed_url: feedUrl,
    description: 'Chengshu 的个人写作空间。',
    language: 'zh-CN',
    authors: [{ name: 'Chengshu' }],
    items: posts.map((post) => {
      const url = absolutePostUrl(post, siteOrigin, base);
      return {
        id: url,
        url,
        title: post.data.title,
        summary: post.data.description ?? '',
        date_published: post.data.pubDate.toISOString(),
        ...(post.data.updatedDate
          ? { date_modified: post.data.updatedDate.toISOString() }
          : {}),
        authors: [{ name: 'Chengshu' }],
        tags: post.data.tags ?? [],
      };
    }),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
    },
  });
};
