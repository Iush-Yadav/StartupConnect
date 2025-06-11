import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { Edit2, Trash2, MapPin, Users, Calendar, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, deletePost } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles!posts_user_id_fkey (
              full_name,
              username,
              avatar_url,
              location,
              industry,
              founded_year,
              team_size,
              bio
            ),
            post_likes (
              user_id
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setPost({
            ...data,
            userId: data.user_id,
            mediaUrls: data.media_urls || [],
            startupDetails: data.startup_details || {},
            profiles: data.profiles,
            likes: (data.post_likes || []).length,
            user_has_liked: currentUser ? (data.post_likes || []).some((like: { user_id: string }) => like.user_id === currentUser.id) : false,
          });
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
        <p className="mb-4">{error || 'Post not found'}</p>
        <button 
          onClick={() => navigate('/')} 
          className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
        >
          Return home
        </button>
      </div>
    );
  }

  const isOwner = currentUser?.id === post.userId;

  const handleEdit = () => {
    navigate(`/edit-post/${post.id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      setIsDeleting(true);
      await deletePost(post.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            {isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
            <div className="flex items-center mb-4">
              <img
                src={post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles?.full_name || '')}`}
                alt={post.profiles?.full_name}
                className="w-16 h-16 rounded-full border-4 border-white shadow-md"
              />
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">{post.profiles?.full_name}</h2>
                <p className="text-purple-600 font-medium">@{post.profiles?.username}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {post.profiles?.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{post.profiles.location}</span>
                </div>
              )}
              
              {post.profiles?.industry && (
                <div className="flex items-center text-gray-600">
                  <Briefcase className="h-5 w-5 mr-2" />
                  <span>{post.profiles.industry}</span>
                </div>
              )}

              {post.profiles?.team_size && (
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{post.profiles.team_size} team members</span>
                </div>
              )}

              {post.profiles?.founded_year && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Founded in {post.profiles.founded_year}</span>
                </div>
              )}
            </div>

            {post.profiles?.bio && (
              <p className="mt-4 text-gray-700">{post.profiles.bio}</p>
            )}
          </div>
        </header>

        <div className="prose max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap mb-8">
            {post.content}
          </p>

          {post.startupDetails && Object.values(post.startupDetails).some(value => value) && (
            <div className="space-y-8 mt-8">
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Startup Details</h2>
                
                {post.startupDetails.problem && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem Statement</h3>
                    <p className="text-gray-700">{post.startupDetails.problem}</p>
                  </div>
                )}

                {post.startupDetails.solution && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Solution</h3>
                    <p className="text-gray-700">{post.startupDetails.solution}</p>
                  </div>
                )}

                {post.startupDetails.marketSize && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Size</h3>
                    <p className="text-gray-700">{post.startupDetails.marketSize}</p>
                  </div>
                )}

                {post.startupDetails.competition && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Competition</h3>
                    <p className="text-gray-700">{post.startupDetails.competition}</p>
                  </div>
                )}

                {(post.startupDetails.businessModel || post.startupDetails.revenueModel) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Model</h3>
                    <p className="text-gray-700">{post.startupDetails.revenueModel || post.startupDetails.businessModel}</p>
                  </div>
                )}

                {post.startupDetails.fundingNeeds && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Funding Needs</h3>
                    <p className="text-gray-700">{post.startupDetails.fundingNeeds}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {post.mediaUrls.map((url: string, index: number) => (
              <div key={index} className="relative pt-[56.25%]">
                {url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={url}
                    controls
                    preload="metadata"
                    playsInline
                    controlsList="nodownload"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      console.error('Video loading error:', e);
                      const videoElement = e.target as HTMLVideoElement;
                      videoElement.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}