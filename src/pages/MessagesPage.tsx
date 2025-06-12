import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, UserPlus } from 'lucide-react';
import ChatBox from '../components/Chat/ChatBox';
import type { User } from '../lib/store';
import type { Message } from '../components/Chat/ChatBox';

interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const currentUser = useStore(state => state.currentUser);

  useEffect(() => {
    console.log('MessagesPage: useEffect triggered.');
    if (!currentUser) {
      console.log('MessagesPage: No current user, returning.');
      return;
    }

    const fetchConversations = async () => {
      console.log('fetchConversations: Starting...');
      try {
        // Get all messages for the current user
        console.log('fetchConversations: Fetching messages from Supabase...');
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        console.log('fetchConversations: Messages fetched.', messages?.length, 'messages.');

        // Extract all unique conversation partner IDs
        console.log('fetchConversations: Extracting partner IDs...');
        const partnerIds = new Set<string>();
        messages?.forEach(message => {
          partnerIds.add(message.sender_id === currentUser.id ? message.receiver_id : message.sender_id);
        });
        console.log('fetchConversations: Found', partnerIds.size, 'unique partners.');

        let partners: User[] = [];
        if (partnerIds.size > 0) {
          console.log('fetchConversations: Fetching partner profiles...');
          const { data: fetchedPartners, error: partnersError } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, user_type, bio, location, industry, founded_year, team_size, investment_range')
            .in('id', Array.from(partnerIds));
          
          if (partnersError) {
            console.error('Error fetching conversation partners:', partnersError);
          } else {
            partners = (fetchedPartners || []).map(profile => ({
              id: profile.id,
              email: '', // Email not needed for display
              fullName: profile.full_name || '',
              username: profile.username || '',
              userType: (profile.user_type === 'entrepreneur' || profile.user_type === 'investor' ? profile.user_type : 'entrepreneur'),
              avatarUrl: profile.avatar_url || undefined,
              bio: profile.bio || undefined,
              location: profile.location || undefined,
              industry: profile.industry || undefined,
              foundedYear: profile.founded_year || undefined,
              teamSize: profile.team_size || undefined,
              investmentRange: profile.investment_range || undefined,
            }));
            console.log('fetchConversations: Partner profiles fetched.', partners.length, 'profiles.');
          }
        }

        // Group messages by conversation partner
        console.log('fetchConversations: Grouping messages by conversation partner...');
        const conversationMap = new Map<string, Conversation>();
        
        messages?.forEach(message => {
          const partnerId = message.sender_id === currentUser.id ? message.receiver_id : message.sender_id;
          const partner = partners.find(p => p.id === partnerId);

          if (!partner) return; // Skip if partner not found (shouldn't happen with correct data)
          
          if (!conversationMap.has(partnerId)) {
            conversationMap.set(partnerId, {
              user: partner,
              lastMessage: {
                id: message.id,
                sender_id: message.sender_id,
                receiver_id: message.receiver_id,
                content: message.content,
                created_at: message.created_at,
                is_read: message.is_read,
              },
              unreadCount: message.receiver_id === currentUser.id && !message.is_read ? 1 : 0
            });
          } else {
            const conversation = conversationMap.get(partnerId)!;
            // Update last message only if the new message is more recent
            if (new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
              conversation.lastMessage = {
                id: message.id,
                sender_id: message.sender_id,
                receiver_id: message.receiver_id,
                content: message.content,
                created_at: message.created_at,
                is_read: message.is_read,
              };
            }
            if (message.receiver_id === currentUser.id && !message.is_read) {
              conversation.unreadCount++;
            }
          }
        });

        // Sort conversations by last message time (most recent first)
        console.log('fetchConversations: Sorting conversations...');
        setConversations(Array.from(conversationMap.values()).sort((a, b) => 
          new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
        ));
        console.log('fetchConversations: Conversations set.');
      } catch (error) {
        console.error('fetchConversations: Error fetching conversations:', error);
      } finally {
        setLoading(false);
        console.log('fetchConversations: Finished. Loading set to false.');
      }
    };

    fetchConversations();

    // Subscribe to new messages on the common channel
    console.log('MessagesPage: Subscribing to chat_messages channel...');
    const subscription = supabase
      .channel('chat_messages') // Use the same generic channel as ChatBox
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id})` // Filter to only current user's messages
      }, async payload => { // This callback is async, so await is fine here
        console.log('MessagesPage: Real-time message INSERT received.', payload.new);
        const newMessage = payload.new as Message;

        const partnerId = newMessage.sender_id === currentUser.id ? newMessage.receiver_id : newMessage.sender_id;
        
        let partnerProfile: User | undefined;
        // Check if partner profile is already in the global store states
        console.log('MessagesPage: Checking for existing partner profile in store...');
        const existingPartnerInStore = useStore.getState().users.find(u => u.id === partnerId);

        if (existingPartnerInStore) {
            partnerProfile = existingPartnerInStore;
            console.log('MessagesPage: Partner profile found in store.');
        } else {
            // If not found in store, fetch from Supabase
            console.log('MessagesPage: Partner profile not in store, fetching from Supabase...');
            const { data: fetchedProfile, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, username, avatar_url, user_type, bio, location, industry, founded_year, team_size, investment_range')
                .eq('id', partnerId)
                .single();

            if (profileError) {
                console.error('MessagesPage: Error fetching new conversation partner profile:', profileError);
                return; // Abort if profile fetch fails
            }
            if (fetchedProfile) {
                partnerProfile = {
                    id: fetchedProfile.id,
                    email: '', // Email not needed for display here
                    fullName: fetchedProfile.full_name || '',
                    username: fetchedProfile.username || '',
                    userType: (fetchedProfile.user_type === 'entrepreneur' || fetchedProfile.user_type === 'investor' ? fetchedProfile.user_type : 'entrepreneur'),
                    avatarUrl: fetchedProfile.avatar_url || undefined,
                    bio: fetchedProfile.bio || undefined,
                    location: fetchedProfile.location || undefined,
                    industry: fetchedProfile.industry || undefined,
                    foundedYear: fetchedProfile.founded_year || undefined,
                    teamSize: fetchedProfile.team_size || undefined,
                    investmentRange: fetchedProfile.investment_range || undefined,
                };
                console.log('MessagesPage: Partner profile fetched from Supabase.', partnerProfile.username);
            }
        }

        if (!partnerProfile) {
            // If partner profile is still not available after trying to fetch,
            // we cannot create a conversation. Log and return.
            console.warn('MessagesPage: Could not determine partner profile for new message:', newMessage);
            return;
        }

        // NOW update the conversations state, with partnerProfile guaranteed
        console.log('MessagesPage: Updating conversations state...');
        setConversations(prevConversations => {
          const existingConversationIndex = prevConversations.findIndex(
            conv => conv.user.id === newMessage.sender_id || conv.user.id === newMessage.receiver_id
          );

          if (existingConversationIndex > -1) {
            // Update existing conversation
            const updatedConversations = [...prevConversations];
            const existingConv = updatedConversations[existingConversationIndex];

            // Update last message only if the new message is more recent
            if (new Date(newMessage.created_at) > new Date(existingConv.lastMessage.created_at)) {
              existingConv.lastMessage = {
                id: newMessage.id,
                sender_id: newMessage.sender_id,
                receiver_id: newMessage.receiver_id,
                content: newMessage.content,
                created_at: newMessage.created_at,
                is_read: newMessage.is_read,
              };
            }

            // Increment unread count if the message is for current user and unread
            if (newMessage.receiver_id === currentUser.id && !newMessage.is_read) {
              existingConv.unreadCount++;
            }

            // Move the updated conversation to the top
            const [movedConversation] = updatedConversations.splice(existingConversationIndex, 1);
            console.log('MessagesPage: Existing conversation updated and moved to top.');
            return [movedConversation, ...updatedConversations];

          } else { // Create new conversation if partner is not in current conversations
            console.log('MessagesPage: Creating new conversation.');
            const newConversation: Conversation = {
              user: partnerProfile, // Use the fetched/existing partnerProfile
              lastMessage: {
                id: newMessage.id,
                sender_id: newMessage.sender_id,
                receiver_id: newMessage.receiver_id,
                content: newMessage.content,
                created_at: newMessage.created_at,
                is_read: newMessage.is_read,
              },
              unreadCount: newMessage.receiver_id === currentUser.id && !newMessage.is_read ? 1 : 0
            };
            return [newConversation, ...prevConversations];
          }
        });
        console.log('MessagesPage: Conversations state updated.');
      })
      .subscribe();

    return () => {
      console.log('MessagesPage: Unsubscribing from chat_messages channel.');
      subscription.unsubscribe();
    };
  }, [currentUser, setConversations]);

  const filteredConversations = conversations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-purple-100">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-4">
              Messages
            </h1>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading conversations...</div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <motion.button
                  key={conversation.user.id}
                  onClick={() => setSelectedChat({
                    id: conversation.user.id,
                    name: conversation.user.fullName,
                    avatar: conversation.user.avatarUrl
                  })}
                  className="w-full p-4 hover:bg-purple-50 transition-colors flex items-center space-x-4"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <img
                    src={conversation.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.user.fullName)}&background=8b5cf6&color=ffffff`}
                    alt={conversation.user.fullName}
                    className="w-12 h-12 rounded-full border-2 border-purple-200"
                  />
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{conversation.user.fullName}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage.content}</p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {conversation.unreadCount}
                    </div>
                  )}
                </motion.button>
              ))
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-600 mb-4">
                  Start a conversation with someone you follow!
                </p>
                <button
                  onClick={() => window.location.href = '/connections'}
                  className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Find people to follow</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedChat && (
          <ChatBox
            receiverId={selectedChat.id}
            receiverName={selectedChat.name}
            receiverAvatar={selectedChat.avatar}
            onClose={() => setSelectedChat(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 
