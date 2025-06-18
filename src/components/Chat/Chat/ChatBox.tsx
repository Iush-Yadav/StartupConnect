import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Message } from '../../types/Message';

const ChatBox: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [receiverId, setReceiverId] = useState(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

  useEffect(() => {
    if (!currentUser || !receiverId) return;

    setLoading(true);
    
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
          event: '*', // Listen to all events
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUser.id}))`
        }, payload => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            setMessages(prev => {
              if (!prev.some(msg => msg.id === newMessage.id)) {
                return [...prev, newMessage];
              }
              return prev;
            });

            // Mark message as read if current user is the receiver
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
          } else if (payload.eventType === 'UPDATE') {
            // Update existing message
            setMessages(prev => 
              prev.map(msg => msg.id === payload.new.id ? payload.new : msg)
            );
            fetchTotalUnreadMessages();
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted message
            setMessages(prev => 
              prev.filter(msg => msg.id !== payload.old.id)
            );
            fetchTotalUnreadMessages();
          }
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    const cleanupPromise = setupChat();
    return () => {
      cleanupPromise.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [currentUser, receiverId, fetchTotalUnreadMessages]);

  const fetchTotalUnreadMessages = () => {
    // Implementation of fetchTotalUnreadMessages function
  };

  return (
    <div>
      {/* Render your chat components here */}
    </div>
  );
};

export default ChatBox; 