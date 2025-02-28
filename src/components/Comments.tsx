import React, { useState, useEffect } from 'react';
import { getComments } from '../lib/supabase';
import CommentForm from './CommentForm';

interface Comment {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await getComments(postId);
      
      if (error) throw error;
      
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('无法加载评论，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">评论 ({comments.length})</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
          {error}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center mb-2">
                <div className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  {comment.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{comment.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {comment.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 mb-8">
          暂无评论，成为第一个评论的人吧！
        </div>
      )}
      
      <CommentForm postId={postId} onCommentAdded={fetchComments} />
    </section>
  );
}