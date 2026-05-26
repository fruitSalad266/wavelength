import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const ICON_MAP = {
  friend_request: { icon: 'user-plus', iconColor: '#00ac9b', iconBg: '#e6f9f5' },
  friend_accepted: { icon: 'user-check', iconColor: '#7300ff', iconBg: '#f3e8ff' },
  friend_event: { icon: 'calendar', iconColor: '#7300ff', iconBg: '#f3e8ff' },
};

function formatTime(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const subRef = useRef(null);
  const channelId = useRef(`notifications-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    const { data, error: fetchError } = await supabase
      .from('notifications')
      .select(`
        id, type, title, body, read, created_at,
        related_user_id,
        related_event_id,
        related_user:profiles!notifications_related_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return;
    }
    setError(null);

    const mapped = (data || []).map((n) => {
      const icons = ICON_MAP[n.type] || ICON_MAP.friend_event;
      return {
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        avatar: n.related_user?.avatar_url || null,
        ...icons,
        time: formatTime(n.created_at),
        read: n.read,
        relatedUserId: n.related_user_id,
        relatedEventId: n.related_event_id,
      };
    });

    setNotifications(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(channelId.current)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchNotifications()
      )
      .subscribe();

    subRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      subRef.current = null;
    };
  }, [user]);

  const markAsRead = useCallback(async (notifId) => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notifId)
      .eq('user_id', user.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, loading, error, markAsRead, markAllRead, refresh: fetchNotifications };
}
