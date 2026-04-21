import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * List group chats the current user is a member of.
 *
 * Returns:
 *   chats    – [{ id, name, icon, description, isVerified, eventId, memberCount, lastMessage }]
 *   loading  – boolean
 *   refresh  – re-fetch
 */
export function useMyGroupChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    if (!user) return;

    // Get group chat IDs the user belongs to
    const { data: memberships } = await supabase
      .from('group_chat_members')
      .select('group_chat_id')
      .eq('user_id', user.id);

    if (!memberships || memberships.length === 0) {
      setChats([]);
      setLoading(false);
      return;
    }

    const chatIds = memberships.map((m) => m.group_chat_id);

    // Fetch chat details
    const { data: chatRows } = await supabase
      .from('group_chats')
      .select('*')
      .in('id', chatIds);

    // Fetch member counts
    const { data: countRows } = await supabase
      .from('group_chat_members')
      .select('group_chat_id')
      .in('group_chat_id', chatIds);

    const countMap = {};
    (countRows || []).forEach((r) => {
      countMap[r.group_chat_id] = (countMap[r.group_chat_id] || 0) + 1;
    });

    // Fetch last message per chat
    const lastMessages = {};
    await Promise.all(
      chatIds.map(async (cid) => {
        const { data: msgs } = await supabase
          .from('messages')
          .select('body, created_at, sender:profiles!messages_sender_id_fkey(full_name)')
          .eq('group_chat_id', cid)
          .order('created_at', { ascending: false })
          .limit(1);
        if (msgs && msgs.length > 0) {
          lastMessages[cid] = {
            text: msgs[0].body,
            senderName: msgs[0].sender?.full_name,
            time: msgs[0].created_at,
          };
        }
      })
    );

    const result = (chatRows || []).map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon || '💬',
      description: c.description,
      isVerified: c.is_verified,
      eventId: c.event_id,
      memberCount: countMap[c.id] || 0,
      lastMessage: lastMessages[c.id] || null,
    }));

    setChats(result);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return { chats, loading, refresh: fetchChats };
}

/**
 * List group chats for a specific event (for event detail screen).
 */
export function useEventGroupChats(eventId) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [myMemberships, setMyMemberships] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    if (!eventId) return;

    const { data: chatRows } = await supabase
      .from('group_chats')
      .select('*')
      .eq('event_id', eventId);

    if (!chatRows || chatRows.length === 0) {
      setChats([]);
      setLoading(false);
      return;
    }

    const chatIds = chatRows.map((c) => c.id);

    // Fetch member counts
    const { data: countRows } = await supabase
      .from('group_chat_members')
      .select('group_chat_id')
      .in('group_chat_id', chatIds);

    const countMap = {};
    (countRows || []).forEach((r) => {
      countMap[r.group_chat_id] = (countMap[r.group_chat_id] || 0) + 1;
    });

    // Check which ones the user has joined
    if (user) {
      const { data: myRows } = await supabase
        .from('group_chat_members')
        .select('group_chat_id')
        .eq('user_id', user.id)
        .in('group_chat_id', chatIds);
      setMyMemberships(new Set((myRows || []).map((r) => r.group_chat_id)));
    }

    const result = chatRows.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon || '💬',
      description: c.description,
      isVerified: c.is_verified,
      memberCount: countMap[c.id] || 0,
    }));

    setChats(result);
    setLoading(false);
  }, [eventId, user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const joinChat = useCallback(async (chatId) => {
    if (!user) return;
    const { error } = await supabase
      .from('group_chat_members')
      .insert({ group_chat_id: chatId, user_id: user.id });
    if (!error) {
      setMyMemberships((prev) => new Set([...prev, chatId]));
      fetchChats();
    }
    return error;
  }, [user, fetchChats]);

  const leaveChat = useCallback(async (chatId) => {
    if (!user) return;
    const { error } = await supabase
      .from('group_chat_members')
      .delete()
      .eq('group_chat_id', chatId)
      .eq('user_id', user.id);
    if (!error) {
      setMyMemberships((prev) => {
        const next = new Set(prev);
        next.delete(chatId);
        return next;
      });
      fetchChats();
    }
    return error;
  }, [user, fetchChats]);

  return { chats, myMemberships, loading, joinChat, leaveChat, refresh: fetchChats };
}

/**
 * Details + members for a single group chat.
 */
export function useGroupChat(groupChatId) {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGroup = useCallback(async () => {
    if (!groupChatId) return;

    const [{ data: groupData }, { data: memberRows }] = await Promise.all([
      supabase.from('group_chats').select('*').eq('id', groupChatId).single(),
      supabase
        .from('group_chat_members')
        .select('user_id, profiles(id, full_name, avatar_url, major, class_year)')
        .eq('group_chat_id', groupChatId),
    ]);

    if (groupData) {
      setGroup({
        id: groupData.id,
        name: groupData.name,
        icon: groupData.icon || '💬',
        description: groupData.description,
        isVerified: groupData.is_verified,
        memberCount: memberRows?.length || 0,
      });
    }

    const mapped = (memberRows || []).map((r) => ({
      id: r.profiles?.id || r.user_id,
      name: r.profiles?.full_name || 'Unknown',
      avatar: r.profiles?.avatar_url,
      major: r.profiles?.major || null,
      classYear: r.profiles?.class_year ? String(r.profiles.class_year) : null,
    }));

    setMembers(mapped);
    setIsMember(user ? (memberRows || []).some((r) => r.user_id === user.id) : false);
    setLoading(false);
  }, [groupChatId, user]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  const join = useCallback(async () => {
    if (!user || !groupChatId) return;
    const { error } = await supabase
      .from('group_chat_members')
      .insert({ group_chat_id: groupChatId, user_id: user.id });
    if (!error) {
      setIsMember(true);
      fetchGroup();
    }
    return error;
  }, [user, groupChatId, fetchGroup]);

  return { group, members, isMember, loading, join };
}
