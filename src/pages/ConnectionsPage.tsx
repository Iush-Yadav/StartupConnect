import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import { useStore } from '../lib/store';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, UserPlus } from 'lucide-react';
import ChatBox from '../components/Chat/ChatBox';
import { supabase } from '../lib/supabase';
import type { User } from '../lib/store';

export default function ConnectionsPage() {
  const { currentUser, followedProfiles, users, fetchFollowedProfiles, fetchUsers, toggleFollow, followedUserIds, fetchUnreadMessagesCountForUser } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayProfiles, setDisplayProfiles] = useState<User[]>([]);
  const navigate = useNavigate();

  // State to track if initial fetch for followed profiles is done
  const [initialFollowedFetched, setInitialFollowedFetched] = useState(false);

  useEffect(() => {
    const loadInitialProfiles = async () => {
      if (currentUser && !initialFollowedFetched) {
        setIsLoading(true);
        await fetchFollowedProfiles();
        setInitialFollowedFetched(true);
        setIsLoading(false);
      }
    };

    loadInitialProfiles();
  }, [currentUser, initialFollowedFetched, fetchFollowedProfiles]);

  useEffect(() => {
    const loadUsersForSearch = async () => {
      if (currentUser && searchQuery) {
        setIsLoading(true);
        await fetchUsers();
        setIsLoading(false);
      } else if (currentUser && !searchQuery && initialFollowedFetched) {
        // If search query is cleared and initial followed profiles are fetched, ensure UI reflects followed profiles and not a stale all-users list
        // This case is largely handled by `profilesToDisplay` but an explicit fetch can ensure freshest data if needed
        // However, given the primary issue is infinite loop, we avoid redundant fetches here
        // The `profilesToDisplay` derived state already correctly switches between `users` and `followedProfiles`
      }
    };

    loadUsersForSearch();
  }, [currentUser, searchQuery, initialFollowedFetched, fetchUsers]);

  const profilesToDisplay = searchQuery ? users : followedProfiles;

  const filteredProfiles = profilesToDisplay.filter(profile => 
    (profile.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (profile.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  ).map(profile => ({
    ...profile,
    user_has_followed: followedUserIds.includes(profile.id),
  }));

  // New useEffect to fetch and set unread counts for filtered profiles
  useEffect(() => {
    const fetchAndSetUnreadCounts = async () => {
      if (!currentUser) {
        setDisplayProfiles([]);
        return;
      }

      // Create a copy of filteredProfiles to avoid direct mutation
      const profilesWithCounts = [...filteredProfiles];

      const updatedProfiles = await Promise.all(
        profilesWithCounts.map(async (profile) => {
          // Only fetch unread count if the profile is not the current user
          if (profile.id !== currentUser.id) {
            const unreadCount = await fetchUnreadMessagesCountForUser(profile.id);
            return { ...profile, unreadMessagesCount: unreadCount };
          }
          return profile;
        })
      );
      setDisplayProfiles(updatedProfiles);
    };

    fetchAndSetUnreadCounts();
  }, [filteredProfiles, currentUser, fetchUnreadMessagesCountForUser]); // Dependencies

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your connections.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-purple-100">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-4">
              {searchQuery ? 'Discover Users' : 'Your Connections'}
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search connections or people to connect"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading {searchQuery ? 'users' : 'connections'}...</div>
            ) : displayProfiles.length > 0 ? (
              <div className="space-y-4">
                {displayProfiles.map((profile) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between relative"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={profile.fullName || ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-lg font-semibold uppercase">
                            {profile.fullName?.charAt(0) || ''}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{profile.fullName || ''}</h3>
                        <p className="text-sm text-gray-500">@{profile.username || ''}</p>
                      </div>
                      {profile.unreadMessagesCount && profile.unreadMessagesCount > 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center z-10">
                          {profile.unreadMessagesCount}
                        </span>
                      )}
                    </div>
                    {profile.id !== currentUser.id && (
                      profile.user_has_followed ? (
                        <motion.button
                          whileHover={{ scale: 1.05, boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedChat(profile.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition-all duration-200 ease-in-out"
                        >
                          <MessageSquare className="h-6 w-6" />
                          <span className="font-semibold">Chat</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05, boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleFollow(profile.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-green-600 transition-all duration-200 ease-in-out"
                        >
                          <UserPlus className="h-6 w-6" />
                          <span className="font-semibold">Follow</span>
                        </motion.button>
                      )
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No users found' : 'No connections yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search query.' : 'Start following other users to build your network!'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => navigate('/home')}
                    className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700"
                  >
                    <span>Find people to follow</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedChat && (
          <ChatBox
            receiverId={selectedChat}
            receiverName={displayProfiles.find(p => p.id === selectedChat)?.fullName || ''}
            receiverAvatar={displayProfiles.find(p => p.id === selectedChat)?.avatarUrl}
            onClose={() => setSelectedChat(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
