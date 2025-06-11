import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, X, Copy, Twitter, Facebook, Linkedin, Send, LogIn, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store';
import type { Post } from '../../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface PostCardProps {
  post: Post;
  onLike: () => void;
}

export default function PostCard({ post, onLike }: PostCardProps) {
  const [loading, setLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [followStatus, setFollowStatus] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const toggleLike = useStore(state => state.toggleLike);
  const toggleFollow = useStore(state => state.toggleFollow);
  const currentUser = useStore(state => state.currentUser);

  console.log('PostCard: Media URLs received:', post.mediaUrls);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showShareMenu &&
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node) &&
        shareButtonRef.current &&
        !shareButtonRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      setShowAuthMessage(true);
      setTimeout(() => setShowAuthMessage(false), 3000);
      return;
    }

    if (!post.id) {
      console.error('Post ID is undefined');
      return;
    }

    try {
      setLoading(true);
      await toggleLike(post.id);
      onLike();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = () => {
    if (!currentUser) {
      setShowAuthMessage(true);
      setTimeout(() => setShowAuthMessage(false), 3000);
      return;
    }
    setShowShareMenu(!showShareMenu);
  };

  const handleShare = async (platform: string) => {
    if (!currentUser) {
      setShowAuthMessage(true);
      setTimeout(() => setShowAuthMessage(false), 3000);
      return;
    }

    const postUrl = `${window.location.origin}/post/${post.id}`;
    const text = `Check out this startup idea: ${post.title}`;
    let shareUrl = '';

    try {
      switch (platform) {
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\\n${postUrl}`)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
          break;
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`;
          break;
        case 'email':
          shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\\n\\n${postUrl}`)}`;
          break;
        case 'copy':
          await navigator.clipboard.writeText(postUrl);
          setShareStatus('Copied to clipboard!');
          setTimeout(() => setShareStatus(null), 2000);
          return;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        setShareStatus('Shared successfully!');
        setTimeout(() => setShareStatus(null), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setShareStatus('Failed to share. Please try again.');
      setTimeout(() => setShareStatus(null), 2000);
    }

    setShowShareMenu(false);
  };

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      setShowAuthMessage(true);
      setTimeout(() => setShowAuthMessage(false), 3000);
      return;
    }

    if (!post.userId) {
      console.error('Post user ID is undefined');
      return;
    }

    try {
      setLoading(true);
      await toggleFollow(post.userId);
      setFollowStatus(post.user_has_followed ? 'Unfollowed!' : 'Following!');
      setTimeout(() => setFollowStatus(null), 2000);
    } catch (error) {
      console.error('Error toggling follow:', error);
      setFollowStatus('Failed to update follow status.');
      setTimeout(() => setFollowStatus(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article
      className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative group p-4 sm:p-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle overlay on hover to indicate clickability */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.02 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black rounded-xl pointer-events-none"
      />

      <Link to={`/post/${post.id}`} className="block">
        <header className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <img
              src={post.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles.full_name)}&background=8b5cf6&color=ffffff`}
              alt={post.profiles.full_name}
              className="w-10 h-10 rounded-full border-2 border-purple-200 mr-3"
            />
            <div>
              <h2 className="font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-[200px]">{post.profiles.full_name}</h2>
              <p className="text-sm text-purple-600 truncate max-w-[150px] sm:max-w-[200px]">@{post.profiles.username}</p>
            </div>
            <button
              onClick={handleFollowToggle}
              disabled={loading}
              className={`ml-3 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                post.user_has_followed 
                  ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' 
                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
              } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {post.user_has_followed ? 'Unfollow' : 'Follow'}
            </button>
          </div>
          <time dateTime={post.createdAt} className="text-sm text-gray-500">
            {post.createdAt && !isNaN(new Date(post.createdAt).getTime()) 
              ? format(new Date(post.createdAt), 'MMM dd, yyyy') 
              : 'N/A'}
          </time>
        </header>

        {/* Media Display Section */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mt-4 mb-4 flex justify-center items-center overflow-hidden rounded-lg bg-gray-100">
            {post.mediaUrls.map((url, index) => {
              const fileExtension = url.split('.').pop()?.toLowerCase();
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension || '');
              const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExtension || '');

              if (isImage) {
                return (
                  <img
                    key={index}
                    src={url}
                    alt={`Post media ${index + 1}`}
                    className="max-w-full h-auto rounded-lg object-contain"
                    style={{ maxHeight: '400px' }} // Limit height for better display in card
                  />
                );
              } else if (isVideo) {
                return (
                  <video
                    key={index}
                    src={url}
                    controls
                    className="max-w-full h-auto rounded-lg object-contain"
                    style={{ maxHeight: '400px' }} // Limit height for better display in card
                  >
                    Your browser does not support the video tag.
                  </video>
                );
              } else {
                return null; // Or render a placeholder for unsupported types
              }
            })}
          </div>
        )}

        {/* Post Content */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-purple-700 mb-2 group-hover:text-purple-800 transition-colors">{post.title}</h3>
          <p className="text-gray-700 leading-relaxed line-clamp-3">{post.content}</p>
        </div>

        {/* Startup Details (conditional) */}
        {post.category === 'startup_idea' && post.startupDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Startup Details:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><span className="font-medium">Problem:</span> {post.startupDetails.problem}</li>
              <li><span className="font-medium">Solution:</span> {post.startupDetails.solution}</li>
              <li><span className="font-medium">Market Size:</span> {post.startupDetails.marketSize}</li>
              <li><span className="font-medium">Competition:</span> {post.startupDetails.competition}</li>
              {post.startupDetails.businessModel && <li><span className="font-medium">Business Model:</span> {post.startupDetails.businessModel}</li>}
              <li><span className="font-medium">Funding Needs:</span> {post.startupDetails.fundingNeeds}</li>
              <li><span className="font-medium">Timeline:</span> {post.startupDetails.timeline}</li>
              <li><span className="font-medium">Team:</span> {post.startupDetails.team}</li>
            </ul>
          </div>
        )}

      </Link>

      <footer className="flex items-center justify-between mt-4 pt-4 border-t border-purple-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center space-x-1 text-gray-600 hover:text-red-500 ${loading ? 'cursor-not-allowed' : ''}`}
          >
            {post.user_has_liked ? <Heart className="h-6 w-6 text-red-500 fill-current" /> : <Heart className="h-6 w-6 text-gray-400" />}
            <span>{post.likes}</span>
          </button>
          
          {/* Share button and its menu, wrapped in a relative container */}
          <div className="relative inline-block">
            <button
              ref={shareButtonRef}
              onClick={handleShareClick}
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 p-2 rounded-full hover:bg-purple-50 transition-colors"
            >
              {showShareMenu ? (
                <X className="h-6 w-6 text-gray-400" />
              ) : (
                <Share2 className="h-6 w-6 transform transition-transform duration-200 hover:scale-110 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  ref={shareMenuRef}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-purple-100 py-1 z-30 flex flex-row items-center justify-center space-x-2 px-2"
                >
                  {/* Removed the "Share this post" header as it's not needed for icon-only display */}
                  
                  <div className="flex flex-row gap-2 w-full justify-center">
                    {/* Twitter */}
                    <div className="relative flex items-center">
                      <button
                        onClick={() => handleShare('twitter')}
                        className="relative group flex items-center p-1 rounded-lg hover:bg-blue-50 transition-colors justify-start"
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center transition-colors flex-shrink-0">
                          <Twitter className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="ml-2 w-0 overflow-hidden opacity-0 group-hover:w-max group-hover:opacity-100 group-hover:overflow-visible transition-all duration-200 whitespace-nowrap pointer-events-none text-sm font-medium text-gray-700 flex-shrink-0">Twitter</span>
                      </button>
                    </div>

                    {/* LinkedIn */}
                    <div className="relative flex items-center">
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="relative group flex items-center p-1 rounded-lg hover:bg-blue-600/10 transition-colors justify-start"
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center transition-colors flex-shrink-0">
                          <Linkedin className="h-4 w-4 text-blue-700" />
                        </div>
                        <span className="ml-2 w-0 overflow-hidden opacity-0 group-hover:w-max group-hover:opacity-100 group-hover:overflow-visible transition-all duration-200 whitespace-nowrap pointer-events-none text-sm font-medium text-gray-700 flex-shrink-0">LinkedIn</span>
                      </button>
                    </div>

                    {/* Facebook */}
                    <div className="relative flex items-center">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="relative group flex items-center p-1 rounded-lg hover:bg-blue-800/10 transition-colors justify-start"
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center transition-colors flex-shrink-0">
                          <Facebook className="h-4 w-4 text-blue-900" />
                        </div>
                        <span className="ml-2 w-0 overflow-hidden opacity-0 group-hover:w-max group-hover:opacity-100 group-hover:overflow-visible transition-all duration-200 whitespace-nowrap pointer-events-none text-sm font-medium text-gray-700 flex-shrink-0">Facebook</span>
                      </button>
                    </div>

                    {/* Telegram */}
                    <div className="relative flex items-center">
                      <button
                        onClick={() => handleShare('telegram')}
                        className="relative group flex items-center p-1 rounded-lg hover:bg-blue-400/10 transition-colors justify-start"
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center transition-colors flex-shrink-0">
                          <Send className="h-4 w-4 text-blue-500" />
                        </div>
                        <span className="ml-2 w-0 overflow-hidden opacity-0 group-hover:w-max group-hover:opacity-100 group-hover:overflow-visible transition-all duration-200 whitespace-nowrap pointer-events-none text-sm font-medium text-gray-700 flex-shrink-0">Telegram</span>
                      </button>
                    </div>

                    {/* Copy Link */}
                    <div className="relative flex items-center">
                      <button
                        onClick={() => handleShare('copy')}
                        className="relative group flex items-center p-1 rounded-lg hover:bg-gray-100 transition-colors justify-start"
                      >
                        <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center transition-colors flex-shrink-0">
                          <Copy className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="ml-2 w-0 overflow-hidden opacity-0 group-hover:w-max group-hover:opacity-100 group-hover:overflow-visible transition-all duration-200 whitespace-nowrap pointer-events-none text-sm font-medium text-gray-700 flex-shrink-0">Copy Link</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {shareStatus && (
            <div className="absolute bottom-full mb-2 right-0 bg-green-500 text-white text-sm px-3 py-1 rounded-md shadow-lg animate-fade-in-up">
              <span>{shareStatus}</span>
            </div>
          )}
        </div>

        {followStatus && (
          <div className="absolute bottom-full mb-2 left-0 bg-blue-500 text-white text-sm px-3 py-1 rounded-md shadow-lg animate-fade-in-up">
            <span>{followStatus}</span>
          </div>
        )}

        {!currentUser && (
          <AnimatePresence>
            {showAuthMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full right-0 mb-2 bg-purple-600 text-white text-sm px-3 py-2 rounded-md shadow-lg flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Please login to like and share posts</span>
                <Link to="/login" className="text-purple-200 hover:underline flex items-center">
                  Login <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </footer>
    </article>
  );
}