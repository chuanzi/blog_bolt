---
title: "Getting Started with Astro: A Beginner's Guide"
pubDate: 2025-02-26
image:
  src: "https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  alt: "Astro framework logo with stars"
category: "Tutorials"
tags: ["astro", "web development", "javascript", "tutorial"]
author: "Your Name"
excerpt: "Learn how to build fast, content-focused websites with Astro, the all-in-one web framework designed for speed."
---

# Getting Started with Astro: A Beginner's Guide

Astro is a modern web framework that allows you to build faster websites with less client-side JavaScript. It's perfect for content-focused websites like blogs, marketing sites, and portfolios. In this guide, I'll walk you through the basics of getting started with Astro.

## What is Astro?

Astro is an all-in-one web framework focused on content and performance. It allows you to:

- Write components in your favorite UI framework (React, Vue, Svelte, etc.)
- Ship only the necessary JavaScript to the browser
- Generate static HTML at build time for faster page loads
- Use server-side rendering when needed

## Setting Up Your First Astro Project

Let's start by creating a new Astro project:

```bash
# Create a new project with npm
npm create astro@latest my-astro-project

# Navigate to your new project
cd my-astro-project

# Start the development server
npm run dev
```

## Project Structure

A typical Astro project has the following structure:

```
my-astro-project/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   ├── layouts/
│   └── pages/
│       └── index.astro
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

- `public/`: Static assets that will be copied to the build folder
- `src/components/`: Reusable UI components
- `src/layouts/`: Page layouts
- `src/pages/`: Each file becomes a route in your site
- `astro.config.mjs`: Astro configuration file

## Creating Your First Page

Astro uses a file-based routing system. Let's create a simple page:

```astro
---
// src/pages/about.astro
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>About Me</title>
  </head>
  <body>
    <h1>About Me</h1>
    <p>This is my about page built with Astro!</p>
    <a href="/">Back to home</a>
  </body>
</html>
```

## Using Components

Astro components have a `.astro` extension and consist of two parts:
1. A component script (inside the `---` fence)
2. A component template (below the fence)

```astro
---
// src/components/Card.astro
const { title, description } = Astro.props;
---

<div class="card">
  <h2>{title}</h2>
  <p>{description}</p>
  <slot /> <!-- Children will be inserted here -->
</div>

<style>
  .card {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
  }
</style>
```

## Using Layouts

Layouts help you reuse common page structures:

```astro
---
// src/layouts/MainLayout.astro
const { title } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
  </head>
  <body>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/blog">Blog</a>
    </nav>
    <main>
      <slot /> <!-- Page content will be inserted here -->
    </main>
    <footer>
      &copy; 2025 My Astro Site
    </footer>
  </body>
</html>
```

## Integrating with Other Frameworks

One of Astro's strengths is its ability to work with components from other frameworks:

```bash
# Add React support
npm install @astrojs/react react react-dom
```

Update your `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
});
```

Now you can use React components in your Astro files:

```astro
---
// src/pages/index.astro
import MyReactComponent from '../components/MyReactComponent.jsx';
---

<html>
  <body>
    <h1>Welcome to Astro</h1>
    <MyReactComponent client:load />
  </body>
</html>
```

## Conclusion

Astro is a powerful framework for building modern websites with a focus on performance. This guide just scratches the surface of what's possible with Astro. As you continue your journey, explore Astro's documentation to learn about more advanced features like:

- Content collections
- Server-side rendering
- Image optimization
- Markdown/MDX support
- And much more!

Happy coding with Astro!