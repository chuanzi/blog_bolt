import React, { useState, useEffect, useRef } from 'react';
import { searchPosts } from '../lib/supabase';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categories: {
    name: string;
  };
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        try {
          const { data, error } = await searchPosts(query);
          if (error) throw error;
          setResults(data || []);
          setShowResults(true);
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [query]);
  
  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="搜索文章..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
          ) : (
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>
      
      {showResults && (
        <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((result) => (
                <li key={result.id}>
                  <a
                    href={`/blog/${result.slug}`}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{result.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {result.categories.name} · {result.excerpt.substring(0, 60)}...
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              没有找到匹配的结果
            </div>
          )}
        </div>
      )}
    </div>
  );
}