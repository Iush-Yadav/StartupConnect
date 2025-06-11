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
  const followedProfiles = useStore(state => state.followedProfiles);

  useEffect(() => {
    if (!currentUser) return;

    const fetchConversations = async () => {
      try {
        // Get all messages for the current user
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group messages by conversation partner
        const conversationMap = new Map<string, Conversation>();
        
        messages?.forEach(message => {
          const partnerId = message.sender_id === currentUser.id ? message.receiver_id : message.sender_id;
          
          if (!conversationMap.has(partnerId)) {
            const partner = followedProfiles.find(p => p.id === partnerId);
            if (partner) {
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
            }
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

        setConversations(Array.from(conversationMap.values()));
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to new messages on the common channel
    const subscription = supabase
      .channel('chat_messages') // Use the same generic channel as ChatBox
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id})` // Filter to only current user's messages
      }, payload => {
        const newMessage = payload.new as Message;

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
            return [movedConversation, ...updatedConversations];

          } else {
            // Create new conversation if partner is a followed profile
            const partnerId = newMessage.sender_id === currentUser.id ? newMessage.receiver_id : newMessage.sender_id;
            const partner = followedProfiles.find(p => p.id === partnerId);

            if (partner) {
              const newConversation: Conversation = {
                user: partner,
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
            return prevConversations; // No change if partner not found
          }
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser, followedProfiles]);

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