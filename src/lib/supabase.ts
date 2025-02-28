import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL || '',
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY || ''
);

// 用户相关函数
export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password,
  });
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  return await supabase.auth.getUser();
}

// 文章相关函数
export async function getPosts(limit = 10, offset = 0, category?: string, tag?: string) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      categories(*),
      post_tags(tags(*))
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq('categories.slug', category);
  }

  if (tag) {
    query = query.eq('post_tags.tags.slug', tag);
  }

  return await query;
}

export async function getPostBySlug(slug: string) {
  return await supabase
    .from('posts')
    .select(`
      *,
      categories(*),
      post_tags(tags(*)),
      comments(*)
    `)
    .eq('slug', slug)
    .single();
}

export async function createPost(postData: any) {
  return await supabase.from('posts').insert(postData);
}

export async function updatePost(id: string, postData: any) {
  return await supabase.from('posts').update(postData).eq('id', id);
}

export async function deletePost(id: string) {
  return await supabase.from('posts').delete().eq('id', id);
}

// 评论相关函数
export async function getComments(postId: string) {
  return await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
}

export async function createComment(commentData: any) {
  return await supabase.from('comments').insert(commentData);
}

// 分类相关函数
export async function getCategories() {
  return await supabase.from('categories').select('*').order('name');
}

// 标签相关函数
export async function getTags() {
  return await supabase.from('tags').select('*').order('name');
}

// 搜索函数
export async function searchPosts(query: string) {
  return await supabase
    .from('posts')
    .select(`
      *,
      categories(*)
    `)
    .eq('published', true)
    .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
    .order('created_at', { ascending: false });
}