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

export function getPostTags(post: BlogPost): string[] {
  return (post.data.tags ?? []).map((tag) => tag.trim()).filter(Boolean);
}

/** Collect unique tags from published posts, sorted by count desc then name. */
export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getPublishedPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of getPostTags(post)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => getPostTags(post).includes(tag));
}

export function tagPath(tag: string, basePath: string): string {
  const base = basePath.replace(/\/$/, '');
  return `${base}/tags/${encodeURIComponent(tag)}/`;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
