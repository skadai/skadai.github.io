import type { APIRoute } from 'astro';
import { absolutePostUrl, getPublishedPosts, postSlug } from '../lib/posts';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPublishedPosts();
  const siteOrigin = (site ?? new URL('https://skadai.github.io')).origin;
  const base = import.meta.env.BASE_URL;

  const body = {
    generated: new Date().toISOString(),
    site: siteOrigin,
    posts: posts.map((post) => {
      const entry: Record<string, unknown> = {
        slug: postSlug(post),
        title: post.data.title,
        description: post.data.description ?? '',
        pubDate: post.data.pubDate.toISOString(),
        tags: post.data.tags ?? [],
        category: post.data.category ?? null,
        url: absolutePostUrl(post, siteOrigin, base),
      };
      if (post.data.updatedDate) {
        entry.updatedDate = post.data.updatedDate.toISOString();
      }
      if (post.data.status) {
        entry.status = post.data.status;
      }
      return entry;
    }),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
