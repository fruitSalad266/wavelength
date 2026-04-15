import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Manages friendships for the current user.
 *
 * Returns:
 *   friends        – accepted friends (profile objects)
 *   pending        – incoming requests awaiting response
 *   outgoing       – requests the user sent
 *   loading        – initial load in progress
 *   sendRequest    – (userId) → send friend request
 *   acceptRequest  – (userId) → accept incoming request
 *   removeFriend   – (userId) → unfriend / cancel / reject
 *   refresh        – re-fetch everything
 *   getFriendship  – (userId) → { status, direction } or null
 */
export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  // Raw rows for quick lookup
  const [rows, setRows] = useState([]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const uid = user.id;

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        user_id,
        friend_id,
        status,
        created_at,
        requester:profiles!friendships_user_id_fkey(id, full_name, avatar_url, interests),
        recipient:profiles!friendships_friend_id_fkey(id, full_name, avatar_url, interests)
      `)
      .or(`user_id.eq.${uid},friend_id.eq.${uid}`);

    if (error) {
      console.warn('useFriends fetch error:', error.message);
      setLoading(false);
      return;
    }

    setRows(data || []);

    const accepted = [];
    const incoming = [];
    const sent = [];

    (data || []).forEach((row) => {
      const isRequester = row.user_id === uid;
      const otherProfile = isRequester ? row.recipient : row.requester;

      if (row.status === 'accepted') {
        accepted.push(otherProfile);
      } else if (row.status === 'pending') {
        if (isRequester) {
          sent.push(otherProfile);
        } else {
          incoming.push(otherProfile);
        }
      }
    });

    setFriends(accepted);
    setPending(incoming);
    setOutgoing(sent);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const sendRequest = useCallback(async (friendId) => {
    if (!user) return;
    const { error } = await supabase
      .from('friendships')
      .insert({ user_id: user.id, friend_id: friendId });
    if (!error) await fetchAll();
    return error;
  }, [user, fetchAll]);

  const acceptRequest = useCallback(async (requesterId) => {
    if (!user) return;
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('user_id', requesterId)
      .eq('friend_id', user.id);
    if (!error) await fetchAll();
    return error;
  }, [user, fetchAll]);

  const removeFriend = useCallback(async (otherId) => {
    if (!user) return;
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${otherId}),and(user_id.eq.${otherId},friend_id.eq.${user.id})`);
    if (!error) await fetchAll();
    return error;
  }, [user, fetchAll]);

  /** Quick lookup: returns { status, direction } or null */
  const getFriendship = useCallback((otherId) => {
    if (!user) return null;
    const row = rows.find(
      (r) =>
        (r.user_id === user.id && r.friend_id === otherId) ||
        (r.friend_id === user.id && r.user_id === otherId)
    );
    if (!row) return null;
    return {
      status: row.status,
      direction: row.user_id === user.id ? 'outgoing' : 'incoming',
    };
  }, [user, rows]);

  return {
    friends,
    pending,
    outgoing,
    loading,
    sendRequest,
    acceptRequest,
    removeFriend,
    refresh: fetchAll,
    getFriendship,
  };
}
