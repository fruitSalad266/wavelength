import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Real-time messages for a group chat OR a DM thread.
 *
 * Pass exactly one of: groupChatId or recipientId.
 *
 * Returns:
 *   messages  – [{ id, body, senderId, senderName, senderAvatar, createdAt, isMine }]
 *   loading   – boolean
 *   send      – (body: string) → send a message
 */
export function useMessages({ groupChatId, recipientId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const subRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    let query = supabase
      .from('messages')
      .select(`
        id,
        body,
        created_at,
        sender_id,
        recipient_id,
        group_chat_id,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
      `)
      .order('created_at', { ascending: true });

    if (groupChatId) {
      query = query.eq('group_chat_id', groupChatId);
    } else if (recipientId) {
      // DMs: messages where I'm sender+they're recipient OR vice versa
      query = query
        .is('group_chat_id', null)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`);
    }

    const { data } = await query;

    const mapped = (data || []).map((m) => ({
      id: m.id,
      body: m.body,
      senderId: m.sender_id,
      senderName: m.sender?.full_name || 'Unknown',
      senderAvatar: m.sender?.avatar_url,
      createdAt: m.created_at,
      isMine: m.sender_id === user.id,
    }));

    setMessages(mapped);
    setLoading(false);
  }, [user, groupChatId, recipientId]);

  // Initial fetch + realtime subscription
  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages in this channel
    const channel = supabase
      .channel(`messages-${groupChatId || recipientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          ...(groupChatId
            ? { filter: `group_chat_id=eq.${groupChatId}` }
            : {}),
        },
        (payload) => {
          const m = payload.new;
          // For DMs, filter client-side since compound filters aren't supported
          if (!groupChatId && recipientId) {
            const isRelevant =
              (m.sender_id === user?.id && m.recipient_id === recipientId) ||
              (m.sender_id === recipientId && m.recipient_id === user?.id);
            if (!isRelevant) return;
          }

          // Fetch sender profile for the new message
          supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', m.sender_id)
            .single()
            .then(({ data: sender }) => {
              setMessages((prev) => [
                ...prev,
                {
                  id: m.id,
                  body: m.body,
                  senderId: m.sender_id,
                  senderName: sender?.full_name || 'Unknown',
                  senderAvatar: sender?.avatar_url,
                  createdAt: m.created_at,
                  isMine: m.sender_id === user?.id,
                },
              ]);
            });
        }
      )
      .subscribe();

    subRef.current = channel;

    return () => {
      if (subRef.current) {
        supabase.removeChannel(subRef.current);
      }
    };
  }, [fetchMessages, groupChatId, recipientId, user]);

  const send = useCallback(async (body) => {
    if (!user || !body.trim()) return;

    const row = {
      sender_id: user.id,
      body: body.trim(),
    };

    if (groupChatId) {
      row.group_chat_id = groupChatId;
    } else if (recipientId) {
      row.recipient_id = recipientId;
    }

    const { error } = await supabase.from('messages').insert(row);
    return error;
  }, [user, groupChatId, recipientId]);

  return { messages, loading, send };
}

/**
 * Fetch the user's DM threads (unique conversation partners with last message).
 */
export function useDirectMessageThreads() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(async () => {
    if (!user) return;

    // Get all DMs involving this user
    const { data } = await supabase
      .from('messages')
      .select(`
        id,
        body,
        created_at,
        sender_id,
        recipient_id,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
        recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url)
      `)
      .is('group_chat_id', null)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    // Group by conversation partner, keep latest message
    const threadMap = {};
    (data || []).forEach((m) => {
      const otherId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
      if (!threadMap[otherId]) {
        const other = m.sender_id === user.id ? m.recipient : m.sender;
        threadMap[otherId] = {
          id: otherId,
          name: other?.full_name || 'Unknown',
          avatar: other?.avatar_url,
          lastMessage: m.body,
          time: m.created_at,
        };
      }
    });

    setThreads(Object.values(threadMap));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return { threads, loading, refresh: fetchThreads };
}
