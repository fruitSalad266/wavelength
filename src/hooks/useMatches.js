import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { calculateMatchScore } from '../utils/matchScore';

const MATCH_THRESHOLD = 80;

export function useMatches() {
  const { user, profile } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);

    // Fetch all other profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, interests, major, class_year, extras')
      .neq('id', user.id);

    if (error || !profiles) {
      setLoading(false);
      return;
    }

    // Fetch all accepted friendships to compute mutual friends
    const { data: friendships } = await supabase
      .from('friendships')
      .select('user_id, friend_id')
      .eq('status', 'accepted');

    // Build userId -> Set<friendId> map
    const friendMap = {};
    (friendships || []).forEach(({ user_id, friend_id }) => {
      if (!friendMap[user_id]) friendMap[user_id] = new Set();
      if (!friendMap[friend_id]) friendMap[friend_id] = new Set();
      friendMap[user_id].add(friend_id);
      friendMap[friend_id].add(user_id);
    });

    const currentFriendIds = [...(friendMap[user.id] || new Set())];
    const currentFriendSet = new Set(currentFriendIds);

    const scored = profiles
      .filter((p) => !currentFriendSet.has(p.id)) // skip existing friends
      .map((other) => {
        const otherFriendIds = [...(friendMap[other.id] || new Set())];
        const { score, breakdown } = calculateMatchScore(
          profile,
          other,
          currentFriendIds,
          otherFriendIds
        );
        return { ...other, matchScore: score, breakdown };
      })
      .filter((p) => p.matchScore >= MATCH_THRESHOLD)
      .sort((a, b) => b.matchScore - a.matchScore);

    setMatches(scored);
    setLoading(false);
  }, [user, profile]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, loading, refresh: fetchMatches };
}
