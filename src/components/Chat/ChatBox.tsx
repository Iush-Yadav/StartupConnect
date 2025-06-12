import { useEffect, useState, useRef } from 'react';
import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { Send, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatBoxProps {
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  onClose: () => void;
}

export default function ChatBox({ receiverId, receiverName, receiverAvatar, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser, fetchTotalUnreadMessages } = useStore(state => ({
    currentUser: state.currentUser,
    fetchTotalUnreadMessages: state.fetchTotalUnreadMessages
  }));
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleMessageSelection = (messageId: string) => {
    if (!currentUser) return;
    const message = messages.find(msg => msg.id === messageId);
    if (message?.sender_id !== currentUser.id) return; // Only allow selecting own messages

    setSelectedMessageIds(prev =>
      prev.includes(messageId) ? prev.filter(id => id !== messageId) : [...prev, messageId]
    );
  };

  const handleDeleteSelectedMessages = async () => {
    if (selectedMessageIds.length === 0 || !currentUser) return;

    try {
      // Optimistically remove messages from UI
      setMessages(prev => prev.filter(msg => !selectedMessageIds.includes(msg.id)));
      setShowDeleteConfirmModal(false);

      const { error } = await supabase
        .from('messages')
        .delete()
        .in('id', selectedMessageIds)
        .eq('sender_id', currentUser.id); // Ensure only sender can delete their messages

      if (error) {
        console.error('Error deleting messages:', error);
        // Revert optimistic update if deletion fails
        fetchMessages(); // Re-fetch to ensure consistency
      }
      setSelectedMessageIds([]); // Clear selection after attempted deletion
    } catch (error) {
      console.error('Error deleting messages (catch):', error);
      fetchMessages(); // Re-fetch to ensure consistency
      setSelectedMessageIds([]); // Clear selection
    }
  };

  const fetchMessages = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read for the current user (receiver)
      const unreadMessages = (data || []).filter(msg => msg.receiver_id === currentUser.id && !msg.is_read);
      if (unreadMessages.length > 0) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessages.map(msg => msg.id));

        if (updateError) {
          console.error('Error marking messages as read:', updateError);
        }
        // Also re-fetch total unread messages in the store to update the badge
        fetchTotalUnreadMessages();
      }

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (!currentUser || !receiverId) return; // Ensure both are present before proceeding

    setLoading(true); // Indicate loading when fetching messages
    
    const setupChat = async () => {
      try {
        // 1. Fetch initial messages
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUser.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);

        // Mark messages as read for the current user (receiver)
        const unreadMessages = (data || []).filter(msg => msg.receiver_id === currentUser.id && !msg.is_read);
        if (unreadMessages.length > 0) {
          const { error: updateError } = await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessages.map(msg => msg.id));

          if (updateError) {
            console.error('Error marking messages as read:', updateError);
          }
          fetchTotalUnreadMessages();
        }

      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }

      // 2. Set up real-time subscription AFTER initial fetch is complete
      const subscription = supabase
        .channel('chat_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUser.id}))`
        }, payload => {
          const newMessage = payload.new as Message;
          // Add the new message to the local state for instant display
          setMessages(prev => {
            if (!prev.some(msg => msg.id === newMessage.id)) { // Prevent duplicates if already fetched
                return [...prev, newMessage];
            }
            return prev;
          });

          // Mark message as read if current user is the receiver and message is unread
          if (newMessage.receiver_id === currentUser.id && !newMessage.is_read) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMessage.id)
              .then(({ error: updateError }) => {
                if (updateError) {
                  console.error('Error marking single message as read:', updateError);
                } else {
                  fetchTotalUnreadMessages();
                }
              });
          }
        })
        .subscribe();

      // Return a cleanup function for the subscription
      return () => {
        subscription.unsubscribe();
      };
    };

    // Execute the async setup function and return its cleanup function
    const cleanupPromise = setupChat();
    return () => {
      cleanupPromise.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [currentUser, receiverId, fetchTotalUnreadMessages]);

  // Subscribe to presence changes
  useEffect(() => {
    if (!currentUser) return;

    // Create a channel for the receiver's presence
    const channel = supabase.channel(`online_status_${receiverId}`);
    
    // Track current user's presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        // Check if the receiver is in the presence state
        const receiverPresence = presenceState[receiverId];
        setIsOnline(receiverPresence !== undefined);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user's presence
          await channel.track({ user_id: currentUser.id });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser, receiverId]);

  // Also track current user's presence in a separate channel
  useEffect(() => {
    if (!currentUser) return;

    const userChannel = supabase.channel(`user_${currentUser.id}`);
    
    userChannel
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await userChannel.track({ user_id: currentUser.id });
        }
      });

    return () => {
      userChannel.unsubscribe();
    };
  }, [currentUser]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          receiver_id: receiverId,
          content: input.trim()
        })
        .select()
        .single();

      if (error) throw error;
      
      // The sender's message is immediately added to the local state.
      // The real-time subscription will also fire for this message,
      // but by adding it immediately, the sender sees it without delay.
      if (data) {
        setMessages(prev => [...prev, data]);
      }
      
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed top-4 bottom-4 left-4 right-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl shadow-xl border border-purple-100 flex flex-col z-50 relative"
    >
      {/* Blurred background elements */}
      <div
        className="absolute inset-0 z-0 opacity-10 filter blur-xl animate-slow-pulse"
        style={{
          backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="30" fill="%23e9d5ff" opacity="0.6"/><circle cx="50" cy="150" r="20" fill="%23fbcfe8" opacity="0.6"/><circle cx="150" cy="50" r="25" fill="%23d8b4fe" opacity="0.6"/></svg>\')',
          backgroundSize: '200px 200px',
          backgroundRepeat: 'repeat',
        }}
      ></div>

      {/* Chat Header */}
      <div className="sticky top-0 flex items-center justify-between p-4 border-b border-purple-100 bg-white/80 backdrop-blur-sm z-20">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={receiverAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(receiverName)}&background=8b5cf6&color=ffffff`}
              alt={receiverName}
              className="w-12 h-12 rounded-full border-2 border-purple-500"
            />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{receiverName}</h3>
            <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-purple-100 rounded-full transition-colors"
          title="Close Chat"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isMyMessage = msg.sender_id === currentUser?.id;
          const isSelected = selectedMessageIds.includes(msg.id);
          return (
            <div
              key={msg.id}
              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} ${isMyMessage ? 'cursor-pointer' : ''}`}
              onClick={isMyMessage ? () => toggleMessageSelection(msg.id) : undefined} // Only selectable for my messages
            >
              {!isMyMessage && (
                <img
                  src={receiverAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(receiverName)}&background=8b5cf6&color=ffffff`}
                  alt={receiverName}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative px-4 py-2 rounded-lg max-w-[70%] text-white shadow ${
                  isMyMessage 
                    ? isSelected 
                      ? 'bg-purple-500 ring-2 ring-orange-600 ring-offset-2 ring-offset-gray-500' 
                      : 'bg-purple-600'
                    : 'bg-gray-700'
                } ${isSelected ? 'scale-[1.02]' : ''} transition-all duration-200`}
              >
                <p className="text-sm">{msg.content}</p>
                <span className="block text-xs text-right opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {selectedMessageIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 p-3 bg-red-600 rounded-full shadow-lg flex items-center space-x-3 z-30"
        >
          <span className="text-white text-sm font-semibold">
            {selectedMessageIds.length} message{selectedMessageIds.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => setShowDeleteConfirmModal(true)}
            className="bg-white text-red-600 p-2 rounded-full flex items-center space-x-1 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            <span className="font-semibold">Delete</span>
          </button>
          <button
            onClick={() => setSelectedMessageIds([])}
            className="bg-white text-gray-700 p-2 rounded-full flex items-center space-x-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
            <span className="font-semibold">Cancel</span>
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showDeleteConfirmModal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 p-3 bg-red-600 rounded-full shadow-lg flex items-center space-x-3 z-30"
          >
            <span className="text-white text-sm font-semibold">
              Are you sure you want to delete these messages?
            </span>
            <button
              onClick={handleDeleteSelectedMessages}
              className="bg-white text-red-600 p-2 rounded-full flex items-center space-x-1 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              <span className="font-semibold">Delete</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirmModal(false)}
              className="bg-white text-gray-700 p-2 rounded-full flex items-center space-x-1 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="font-semibold">Cancel</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="sticky bottom-0 p-4 border-t border-purple-100 bg-white/80 backdrop-blur-sm z-20">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:shadow-lg"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`p-3 rounded-full ${loading || !input.trim() ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'} transition-colors active:scale-95`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
} 
