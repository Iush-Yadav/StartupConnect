import { Link, useNavigate } from 'react-router-dom';
import { Rocket, LogIn, LogOut, Info, Link as LinkIcon, Mail, Sparkles, Zap, User as UserIcon, Settings, Menu, X } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useState, useRef, useEffect } from 'react';
import MessageLogo from './MessageLogo';

export default function Header() {
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const fetchFollowedProfiles = useStore(state => state.fetchFollowedProfiles);
  const followedProfiles = useStore(state => state.followedProfiles); // Correctly retrieve from store
  const totalUnreadMessages = useStore(state => state.totalUnreadMessages);
  const fetchTotalUnreadMessages = useStore(state => state.fetchTotalUnreadMessages);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch followed profiles when the menu is shown
  useEffect(() => {
    if (showProfileMenu && currentUser) {
      fetchFollowedProfiles();
    }
  }, [showProfileMenu, currentUser, fetchFollowedProfiles]);

  // Fetch total unread messages on component mount or currentUser change
  useEffect(() => {
    if (currentUser) {
      fetchTotalUnreadMessages();
    }
  }, [currentUser, fetchTotalUnreadMessages]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  const handleEditProfile = () => {
    setIsLoading(true);
    setShowProfileMenu(false);
    navigate('/edit-profile');
  };

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-sm shadow-md border-b border-purple-100 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/home" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg transform group-hover:scale-105 transition duration-300">
                <Rocket className="h-6 w-6 text-white transform -rotate-45" />
                <Sparkles className="absolute h-3 w-3 text-yellow-300 top-0 right-0 animate-pulse" />
                <Zap className="absolute h-3 w-3 text-blue-300 bottom-0 left-0 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                StartupConnect
              </span>
              <span className="text-xs text-gray-500 -mt-1">Launch Your Vision</span>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center space-x-6">
            <Link
              to="/about"
              className="flex items-center space-x-1 text-gray-600 hover:text-purple-600"
            >
              <Info className="h-5 w-5 text-purple-400" />
              <span>About</span>
            </Link>
            <Link
              to="/quick-links"
              className="flex items-center space-x-1 text-gray-600 hover:text-purple-600"
            >
              <LinkIcon className="h-5 w-5 text-pink-400" />
              <span>Quick Links</span>
            </Link>
            <Link
              to="/contact"
              className="flex items-center space-x-1 text-gray-600 hover:text-purple-600"
            >
              <Mail className="h-5 w-5 text-purple-400" />
              <span>Contact</span>
            </Link>

            {currentUser ? (
              <>
                <Link
                  to="/connections"
                  className="relative flex items-center space-x-1 text-gray-600 hover:text-purple-600"
                >
                  <MessageLogo />
                  <span>Messages</span>
                  {totalUnreadMessages > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-once">
                      {totalUnreadMessages}
                    </span>
                  )}
                </Link>
                <Link
                  to="/create-post"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md hover:from-pink-600 hover:to-purple-700 transition"
                >
                  Share Idea
                </Link>
                
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 p-2 rounded-full hover:bg-purple-50 transition-colors"
                  >
                    <img
                      src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName || '')}&background=8b5cf6&color=ffffff`}
                      alt={currentUser.fullName}
                      className="w-8 h-8 rounded-full border-2 border-purple-200"
                    />
                    <Settings className="h-4 w-4 text-purple-600" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-purple-100 py-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                        <p className="font-semibold text-gray-900 truncate">{currentUser.fullName}</p>
                        <p className="text-sm text-gray-500 truncate">@{currentUser.username}</p>
                      </div>
                      
                      <Link
                        to="/edit-profile"
                        onClick={handleEditProfile}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                      >
                        <UserIcon className="h-4 w-4 text-purple-600" />
                        <span>Edit Profile</span>
                        {isLoading && (
                          <div className="ml-2 h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        )}
                      </Link>

                      {/* Connections link - always display */}
                      <Link
                        to="/connections"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors border-t border-purple-100 mt-2 pt-2"
                      >
                        <LinkIcon className="h-4 w-4 text-purple-600" />
                        <span>Connections ({followedProfiles.length})</span>
                      </Link>

                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 text-red-600" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 text-gray-600 hover:text-purple-600"
                >
                  <LogIn className="h-5 w-5 text-purple-400" />
                  <span>Login</span>
                </Link>
              </>
            )}
          </nav>

          <button
            className="sm:hidden p-2 rounded-md hover:bg-purple-50 transition-colors"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Open menu"
          >
            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div className="sm:hidden absolute top-16 left-0 w-full bg-white shadow-lg border-b border-purple-100 z-50 animate-fade-in-down">
          <nav className="flex flex-col space-y-2 px-6 py-4">
            <Link to="/about" className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 py-2" onClick={() => setShowMobileMenu(false)}>
              <Info className="h-5 w-5 text-purple-400" /> <span>About</span>
            </Link>
            <Link to="/quick-links" className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 py-2" onClick={() => setShowMobileMenu(false)}>
              <LinkIcon className="h-5 w-5 text-pink-400" /> <span>Quick Links</span>
            </Link>
            <Link to="/contact" className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 py-2" onClick={() => setShowMobileMenu(false)}>
              <Mail className="h-5 w-5 text-purple-400" /> <span>Contact</span>
            </Link>
            {/* Message Logo in mobile menu, aligned left */}
            {currentUser && (
              <Link to="/connections" className="relative flex items-center space-x-2 text-gray-600 hover:text-purple-600 py-2" onClick={() => setShowMobileMenu(false)}>
                <MessageLogo /> <span>Messages</span>
                {totalUnreadMessages > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {totalUnreadMessages}
                  </span>
                )}
              </Link>
            )}
            {/* Mobile Connections link - always display */}
            {currentUser && (
              <Link to="/connections" className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 py-2" onClick={() => setShowMobileMenu(false)}>
                <LinkIcon className="h-5 w-5 text-purple-600" /> <span>Connections ({followedProfiles.length})</span>
              </Link>
            )}
            
            {currentUser ? (
              <>
                <Link to="/create-post" className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md hover:from-pink-600 hover:to-purple-700 transition my-2" onClick={() => setShowMobileMenu(false)}>
                  Share Idea
                </Link>
                <Link to="/edit-profile" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 py-2" 
                      onClick={() => {
                        setIsLoading(true);
                        setShowMobileMenu(false);
                      }}>
                  <UserIcon className="h-5 w-5 text-purple-600" /> 
                  <span>Edit Profile</span>
                  {isLoading && (
                    <div className="ml-2 h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-600 hover:text-red-600 py-2 w-full text-left">
                  <LogOut className="h-5 w-5 text-red-600" /> <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 py-2" onClick={() => setShowMobileMenu(false)}>
                  <LogIn className="h-5 w-5 text-purple-400" /> <span>Login</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}