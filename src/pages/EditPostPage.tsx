import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, updatePost } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<any>(null);
  const [fetchingPost, setFetchingPost] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    startupDetails: {
      problem: '',
      solution: '',
      marketSize: '',
      competition: '',
      revenueModel: '',
      fundingNeeds: '',
      timeline: '',
      team: ''
    },
    mediaUrls: [] as string[],
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        setFetchingPost(true);
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles!posts_user_id_fkey (
              full_name,
              username,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching post:', error);
          navigate('/');
          return;
        }

        if (!data) {
          navigate('/');
          return;
        }

        // Check if current user is the owner of the post
        if (!currentUser || currentUser.id !== data.user_id) {
          navigate(`/post/${id}`);
          return;
        }

        setPost(data);
        
        // Update form data with post data
        setFormData({
          title: data.title,
          content: data.content,
          startupDetails: data.startup_details || {
            problem: '',
            solution: '',
            marketSize: '',
            competition: '',
            revenueModel: '',
            fundingNeeds: '',
            timeline: '',
            team: ''
          },
          mediaUrls: data.media_urls || [],
        });
      } catch (err) {
        console.error('Error fetching post:', err);
        navigate('/');
      } finally {
        setFetchingPost(false);
      }
    };

    fetchPost();
  }, [id, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !currentUser) return;

    setError(null);
    setLoading(true);

    try {
      await updatePost(id, {
        title: formData.title,
        content: formData.content,
        startupDetails: formData.startupDetails,
        mediaUrls: formData.mediaUrls,
      });

      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the post');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPost) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  if (!post || !currentUser) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Post</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Startup Name / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Brief Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Startup Details</h2>

              <div>
                <label htmlFor="problem" className="block text-sm font-medium text-gray-700">
                  Problem Statement
                </label>
                <textarea
                  id="problem"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={formData.startupDetails.problem}
                  onChange={(e) => setFormData({
                    ...formData,
                    startupDetails: { ...formData.startupDetails, problem: e.target.value }
                  })}
                  placeholder="What problem does your startup solve?"
                />
              </div>

              <div>
                <label htmlFor="solution" className="block text-sm font-medium text-gray-700">
                  Solution
                </label>
                <textarea
                  id="solution"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={formData.startupDetails.solution}
                  onChange={(e) => setFormData({
                    ...formData,
                    startupDetails: { ...formData.startupDetails, solution: e.target.value }
                  })}
                  placeholder="How does your solution work?"
                />
              </div>

              <div>
                <label htmlFor="marketSize" className="block text-sm font-medium text-gray-700">
                  Market Size
                </label>
                <textarea
                  id="marketSize"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={formData.startupDetails.marketSize}
                  onChange={(e) => setFormData({
                    ...formData,
                    startupDetails: { ...formData.startupDetails, marketSize: e.target.value }
                  })}
                  placeholder="What's your target market size?"
                />
              </div>

              <div>
                <label htmlFor="competition" className="block text-sm font-medium text-gray-700">
                  Competition
                </label>
                <textarea
                  id="competition"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={formData.startupDetails.competition}
                  onChange={(e) => setFormData({
                    ...formData,
                    startupDetails: { ...formData.startupDetails, competition: e.target.value }
                  })}
                  placeholder="Who are your competitors?"
                />
              </div>

              <div>
                <label htmlFor="revenueModel" className="block text-sm font-medium text-gray-700">
                  Revenue Model
                </label>
                <textarea
                  id="revenueModel"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={formData.startupDetails.revenueModel}
                  onChange={(e) => setFormData({
                    ...formData,
                    startupDetails: { ...formData.startupDetails, revenueModel: e.target.value }
                  })}
                  placeholder="How will you generate revenue?"
                />
              </div>

              <div>
                <label htmlFor="fundingNeeds" className="block text-sm font-medium text-gray-700">
                  Funding Needs
                </label>
                <textarea
                  id="fundingNeeds"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={formData.startupDetails.fundingNeeds}
                  onChange={(e) => setFormData({
                    ...formData,
                    startupDetails: { ...formData.startupDetails, fundingNeeds: e.target.value }
                  })}
                  placeholder="How much funding are you seeking?"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/post/${id}`)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}