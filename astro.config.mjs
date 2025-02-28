import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://yourdomain.com',
  integrations: [
    mdx({
      remarkPlugins: ['remark-toc'],
      rehypePlugins: ['rehype-slug', 'rehype-autolink-headings'],
    }),
    sitemap(),
    tailwind({
      config: { path: './tailwind.config.mjs' },
    }),
    react(),
  ],
  output: 'server',
  adapter: netlify(),
});