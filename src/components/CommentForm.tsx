import React, { useState } from 'react';
import { createComment } from '../lib/supabase';

interface CommentFormProps {
  postId: string;
  onCommentAdded: () => void;
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !content.trim()) {
      setError('所有字段都是必填的');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await createComment({
        post_id: postId,
        name,
        email,
        content,
      });

      if (error) throw error;

      setSuccess('评论已提交，等待审核');
      setName('');
      setEmail('');
      setContent('');
      onCommentAdded();
    } catch (err) {
      setError('提交评论时出错，请稍后再试');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">发表评论</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              姓名 *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              邮箱 *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            评论内容 *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isSubmitting ? '提交中...' : '提交评论'}
        </button>
      </form>
    </div>
  );
}