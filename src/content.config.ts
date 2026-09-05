import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    slug: z.string().optional(),
    category: z.string().nullable().optional(),
    tags: z.array(z.string()).default([]),
    status: z.string().optional(),
    draft: z.boolean().default(false),
    published: z.boolean().optional(),
    notionId: z.string().optional(),
    notionUrl: z.string().url().optional(),
    source: z.string().optional(),
  }),
});

export const collections = { blog };
