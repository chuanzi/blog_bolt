# Personal Blog with Astro and Supabase

A modern, high-performance personal blog built with Astro, React, and Supabase.

## Features

- 🚀 Built with Astro for optimal performance
- 💾 Supabase for database, authentication, and storage
- 🎨 TailwindCSS for styling
- 🌙 Dark mode support
- 📱 Fully responsive design
- 🔍 SEO optimized
- 📝 Markdown/MDX support for content
- 💬 Comment system
- 🏷️ Categories and tags
- 🔍 Search functionality

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/personal-blog.git
cd personal-blog
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Update the `.env` file with your Supabase credentials

5. Run the development server
```bash
npm run dev
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL migrations in the `supabase/migrations` directory

## Deployment

This project is configured for deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Set the build command to `npm run build`
3. Set the publish directory to `dist`
4. Add your environment variables in the Netlify dashboard

## License

MIT