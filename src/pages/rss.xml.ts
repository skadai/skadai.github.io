import type { APIRoute } from 'astro';
import {
  absolutePostUrl,
  escapeXml,
  getPublishedPosts,
} from '../lib/posts';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPublishedPosts();
  const siteOrigin = (site ?? new URL('https://skadai.github.io')).origin;
  const base = import.meta.env.BASE_URL;
  const channelLink = `${siteOrigin}${base.replace(/\/?$/, '/')}`;

  const items = posts
    .map((post) => {
      const link = absolutePostUrl(post, siteOrigin, base);
      const title = escapeXml(post.data.title);
      const description = escapeXml(post.data.description ?? '');
      const pubDate = post.data.pubDate.toUTCString();
      return `    <item>
      <title>${title}</title>
      <description>${description}</description>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Chengshu</title>
    <description>Chengshu 的个人写作空间。</description>
    <link>${escapeXml(channelLink)}</link>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};
