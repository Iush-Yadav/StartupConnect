import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import PostCard from '../components/Posts/PostCard';
import { useStore } from '../lib/store';
import type { Post } from '../lib/store';

export default function HomePage() {
  const { currentUser, posts, fetchPosts } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchPosts();
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error loading posts from store:', err);
        setError(err instanceof Error ? err.message : 'Failed to load posts.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchPosts]); // Depend on fetchPosts from store

  const handleLike = (postId: string, newLikeState: boolean) => {
    // This is handled by the store's toggleLike, no need to update posts state directly here
    // You might want to remove this if toggleLike in store already updates the local posts array
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading posts...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Error Loading Posts</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pt-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Latest Startup Ideas</h1>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No posts found. Be the first to share your startup idea!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={() => handleLike(post.id, !post.user_has_liked)} 
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}