import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    category: z.string(),
    tags: z.array(z.string()),
    author: z.string(),
    excerpt: z.string(),
  }),
});

export const collections = {
  'blog': blogCollection,
};