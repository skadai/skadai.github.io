import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => data.draft === false);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function postSlug(post: BlogPost): string {
  return post.data.slug ?? post.id;
}

export function postPath(post: BlogPost, basePath: string): string {
  const base = basePath.replace(/\/$/, '');
  return `${base}/posts/${postSlug(post)}/`;
}

export function absolutePostUrl(post: BlogPost, site: string | URL, basePath: string): string {
  const origin = typeof site === 'string' ? site.replace(/\/$/, '') : site.origin;
  return `${origin}${postPath(post, basePath)}`;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
