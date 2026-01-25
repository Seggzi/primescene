import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only proceed if user is defined and has an ID
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const userId = user.id; // Using .id is standard for Supabase

    // 1. Initial Load from the "Fortress"
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        // This is where your 404/PGRST205 error currently triggers
        console.error('Qodec Notification Error:', error.message);
      } else {
        setNotifications(data || []);
      }
      setLoading(false);
    };

    fetchNotifications();

    // 2. Real-time Subscription (The "Watchmaker" Sync)
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => 
            prev.map(n => n.id === payload.new.id ? payload.new : n)
          );
        } else if (payload.eventType === 'DELETE') {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addNotification = async (title, message, type = 'info') => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title,
        message,
        type,
        read: false
      })
      .select()
      .single();

    if (error) console.error('Add notification error:', error);
    return data;
  };

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user.id); // Security: ensure user owns it
    if (error) console.error('Mark read error:', error);
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
  };

  const clearAll = async () => {
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      unreadCount,
      loading
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}