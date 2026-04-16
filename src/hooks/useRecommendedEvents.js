import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from './useEvents';
import { useMyRSVPs } from './useRSVP';

const INTEREST_TO_CATEGORY = {
  'Music Festivals': ['Music'],
  'Concerts': ['Music'],
  'Nightlife': ['Music'],
  'Sports': ['Sports'],
  'Fitness & Outdoors': ['Sports'],
  'Art & Culture': ['Art'],
  'Film & Cinema': ['Art'],
  'Comedy': ['Art'],
  'Fashion': ['Art'],
  'Photography': ['Art'],
  'Food & Dining': ['Food'],
  'Technology': ['Technology'],
  'Gaming': ['Technology'],
  'Networking': ['Networking'],
  'Volunteering': ['Networking'],
};

const INTEREST_WEIGHT = 2;
const FRIEND_GOING_WEIGHT = 3;
const FRIEND_MAYBE_WEIGHT = 1;

function getLocalToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useRecommendedEvents({ limit = 5 } = {}) {
  const { user, profile } = useAuth();
  const { events, loading: eventsLoading } = useEvents();
  const { goingEventIds } = useMyRSVPs();

  const [friendRsvps, setFriendRsvps] = useState([]);
  const [friendsById, setFriendsById] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchFriendRsvps = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const uid = user.id;

    const { data: friendships } = await supabase
      .from('friendships')
      .select(`
        user_id, friend_id,
        requester:profiles!friendships_user_id_fkey(id, full_name, avatar_url),
        recipient:profiles!friendships_friend_id_fkey(id, full_name, avatar_url)
      `)
      .or(`user_id.eq.${uid},friend_id.eq.${uid}`)
      .eq('status', 'accepted');

    if (!friendships || friendships.length === 0) {
      setFriendRsvps([]);
      setFriendsById({});
      setLoading(false);
      return;
    }

    const byId = {};
    friendships.forEach((row) => {
      const other = row.user_id === uid ? row.recipient : row.requester;
      if (other?.id) {
        byId[other.id] = {
          id: other.id,
          name: other.full_name,
          avatar: other.avatar_url,
        };
      }
    });

    const friendIds = Object.keys(byId);
    if (friendIds.length === 0) {
      setFriendRsvps([]);
      setFriendsById({});
      setLoading(false);
      return;
    }

    const { data: rsvps } = await supabase
      .from('event_rsvps')
      .select('event_id, user_id, status')
      .in('user_id', friendIds)
      .in('status', ['going', 'maybe'])
      .eq('is_public', true);

    setFriendRsvps(rsvps || []);
    setFriendsById(byId);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFriendRsvps();
  }, [fetchFriendRsvps]);

  const recommendations = useMemo(() => {
    const interests = profile?.interests || [];
    if (events.length === 0) return [];

    const rsvpsByEvent = {};
    friendRsvps.forEach((r) => {
      const friend = friendsById[r.user_id];
      if (!friend) return;
      if (!rsvpsByEvent[r.event_id]) rsvpsByEvent[r.event_id] = [];
      rsvpsByEvent[r.event_id].push({ ...friend, status: r.status });
    });

    const today = getLocalToday();
    const goingSet = new Set(goingEventIds);

    const scored = events
      .filter((e) => e.date >= today && !goingSet.has(e.id))
      .map((event) => {
        const attendingFriends = rsvpsByEvent[event.id] || [];
        const friendsGoing = attendingFriends.filter((f) => f.status === 'going');
        const friendsMaybe = attendingFriends.filter((f) => f.status === 'maybe');

        const matchingInterests = [];
        interests.forEach((interest) => {
          const cats = INTEREST_TO_CATEGORY[interest] || [];
          if (event.category && cats.includes(event.category)) {
            matchingInterests.push(interest);
          }
        });

        const haystack = `${event.title || ''} ${(event.tags || []).join(' ')}`.toLowerCase();
        interests.forEach((interest) => {
          if (matchingInterests.includes(interest)) return;
          const firstWord = interest.split(/[\s&]+/)[0].toLowerCase();
          if (firstWord.length >= 4 && haystack.includes(firstWord)) {
            matchingInterests.push(interest);
          }
        });

        const score =
          matchingInterests.length * INTEREST_WEIGHT +
          friendsGoing.length * FRIEND_GOING_WEIGHT +
          friendsMaybe.length * FRIEND_MAYBE_WEIGHT;

        return {
          event,
          score,
          matchingInterests,
          friendsGoing,
          friendsMaybe,
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.event.date.localeCompare(b.event.date);
      })
      .slice(0, limit);

    return scored;
  }, [events, friendRsvps, friendsById, profile, goingEventIds, limit]);

  return {
    recommendations,
    loading: loading || eventsLoading,
    refresh: fetchFriendRsvps,
  };
}
