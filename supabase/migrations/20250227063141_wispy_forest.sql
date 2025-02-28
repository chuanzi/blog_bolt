/*
  # Blog Database Schema

  1. New Tables
    - `categories` - Blog post categories
    - `tags` - Blog post tags
    - `posts` - Blog posts
    - `post_tags` - Many-to-many relationship between posts and tags
    - `comments` - Blog post comments
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and anonymous users
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL,
  content text NOT NULL,
  image text NOT NULL,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  category_id uuid REFERENCES categories(id),
  author_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create post_tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  content text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Categories policies
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Tags policies
CREATE POLICY "Anyone can read tags"
  ON tags
  FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert tags"
  ON tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update tags"
  ON tags
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can delete tags"
  ON tags
  FOR DELETE
  TO authenticated
  USING (true);

-- Posts policies
CREATE POLICY "Anyone can read published posts"
  ON posts
  FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can read all posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can insert posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Only post authors can update posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Only post authors can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Post_tags policies
CREATE POLICY "Anyone can read post_tags"
  ON post_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert post_tags"
  ON post_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid()
  ));

CREATE POLICY "Only post authors can delete post_tags"
  ON post_tags
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid()
  ));

-- Comments policies
CREATE POLICY "Anyone can read approved comments"
  ON comments
  FOR SELECT
  USING (approved = true);

CREATE POLICY "Authenticated users can read all comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON comments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can delete comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (true);

-- Create views for easier querying

-- Create a view that joins posts with categories
CREATE OR REPLACE VIEW post_details AS
SELECT 
  p.*,
  c.name AS category_name,
  c.slug AS category_slug
FROM 
  posts p
LEFT JOIN 
  categories c ON p.category_id = c.id;

-- Create functions for common operations

-- Function to get posts with tags
CREATE OR REPLACE FUNCTION get_posts_with_tags()
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  excerpt text,
  content text,
  image text,
  published boolean,
  featured boolean,
  category_id uuid,
  category_name text,
  category_slug text,
  author_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  tags jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pd.*,
    (
      SELECT jsonb_agg(jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug
      ))
      FROM post_tags pt
      JOIN tags t ON pt.tag_id = t.id
      WHERE pt.post_id = pd.id
    ) AS tags
  FROM 
    post_details pd
  WHERE 
    pd.published = true
  ORDER BY 
    pd.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to count posts by category
CREATE OR REPLACE FUNCTION update_category_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Add post_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'post_count'
  ) THEN
    ALTER TABLE categories ADD COLUMN post_count integer DEFAULT 0;
  END IF;

  -- Update post counts for all categories
  UPDATE categories c
  SET post_count = (
    SELECT COUNT(*) FROM posts p
    WHERE p.category_id = c.id AND p.published = true
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update category post counts
CREATE TRIGGER update_category_post_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON posts
FOR EACH STATEMENT
EXECUTE FUNCTION update_category_post_counts();

-- Function to count posts by tag
CREATE OR REPLACE FUNCTION update_tag_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Add post_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tags' AND column_name = 'post_count'
  ) THEN
    ALTER TABLE tags ADD COLUMN post_count integer DEFAULT 0;
  END IF;

  -- Update post counts for all tags
  UPDATE tags t
  SET post_count = (
    SELECT COUNT(*) FROM post_tags pt
    JOIN posts p ON pt.post_id = p.id
    WHERE pt.tag_id = t.id AND p.published = true
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update tag post counts
CREATE TRIGGER update_tag_post_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON post_tags
FOR EACH STATEMENT
EXECUTE FUNCTION update_tag_post_counts();

-- Initial data for testing
INSERT INTO categories (name, slug, description)
VALUES 
  ('技术', 'technology', '技术相关文章'),
  ('生活', 'life', '生活随笔'),
  ('教程', 'tutorials', '详细教程')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tags (name, slug)
VALUES 
  ('JavaScript', 'javascript'),
  ('React', 'react'),
  ('Node.js', 'nodejs'),
  ('Astro', 'astro'),
  ('前端', 'frontend'),
  ('后端', 'backend'),
  ('全栈', 'fullstack')
ON CONFLICT (slug) DO NOTHING;