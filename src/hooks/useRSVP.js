import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Manages RSVP + star status for a single event.
 *
 * Props: eventId (string)
 *
 * Returns:
 *   rsvpStatus    – 'going' | 'maybe' | null
 *   isStarred     – boolean
 *   isPublic      – boolean (whether RSVP is visible to others)
 *   attendees     – [{ id, full_name, avatar_url, status }]
 *   attendeeCount – number (going only)
 *   loading       – boolean
 *   setRSVP       – (status: 'going'|'maybe'|null) → upsert/delete
 *   toggleStar    – () → toggle bookmark
 *   setPublic     – (bool) → toggle visibility
 */
export function useRSVP(eventId) {
  const { user } = useAuth();
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  const [isPublic, setIsPublicState] = useState(true);
  const [attendees, setAttendees] = useState([]);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch the user's own RSVP row
  const fetchMyRSVP = useCallback(async () => {
    if (!user || !eventId) return;
    const { data } = await supabase
      .from('event_rsvps')
      .select('status, is_starred, is_public')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .maybeSingle();

    if (data) {
      setRsvpStatus(data.status);
      setIsStarred(data.is_starred);
      setIsPublicState(data.is_public);
    } else {
      setRsvpStatus(null);
      setIsStarred(false);
      setIsPublicState(true);
    }
  }, [user, eventId]);

  // Fetch all attendees for this event
  const fetchAttendees = useCallback(async () => {
    if (!eventId) return;
    const { data } = await supabase
      .from('event_rsvps')
      .select(`
        status,
        user:profiles!event_rsvps_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq('event_id', eventId)
      .eq('is_public', true);

    const list = (data || []).map((row) => ({
      id: row.user?.id,
      name: row.user?.full_name,
      avatar: row.user?.avatar_url,
      status: row.status,
    }));
    setAttendees(list);
    setAttendeeCount(list.filter((a) => a.status === 'going').length);
  }, [eventId]);

  useEffect(() => {
    Promise.all([fetchMyRSVP(), fetchAttendees()]).then(() => setLoading(false));
  }, [fetchMyRSVP, fetchAttendees]);

  const setRSVP = useCallback(async (status) => {
    if (!user || !eventId) return;

    if (!status) {
      // Remove RSVP
      await supabase
        .from('event_rsvps')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', eventId);
      setRsvpStatus(null);
    } else {
      // Upsert
      await supabase
        .from('event_rsvps')
        .upsert({
          user_id: user.id,
          event_id: eventId,
          status,
          is_starred: isStarred,
          is_public: isPublic,
        }, { onConflict: 'user_id,event_id' });
      setRsvpStatus(status);
    }
    // Refresh attendees after change
    fetchAttendees();
  }, [user, eventId, isStarred, isPublic, fetchAttendees]);

  const toggleStar = useCallback(async () => {
    if (!user || !eventId) return;
    const newVal = !isStarred;

    if (rsvpStatus) {
      // Row exists – update it
      await supabase
        .from('event_rsvps')
        .update({ is_starred: newVal })
        .eq('user_id', user.id)
        .eq('event_id', eventId);
    } else {
      // No RSVP row yet – create one with just the star (status defaults to 'going')
      // We'll use 'maybe' so it doesn't count as an attendee
      await supabase
        .from('event_rsvps')
        .upsert({
          user_id: user.id,
          event_id: eventId,
          status: 'maybe',
          is_starred: newVal,
          is_public: isPublic,
        }, { onConflict: 'user_id,event_id' });
      setRsvpStatus('maybe');
    }
    setIsStarred(newVal);
  }, [user, eventId, isStarred, rsvpStatus, isPublic]);

  const setPublic = useCallback(async (val) => {
    if (!user || !eventId) return;
    setIsPublicState(val);
    if (rsvpStatus) {
      await supabase
        .from('event_rsvps')
        .update({ is_public: val })
        .eq('user_id', user.id)
        .eq('event_id', eventId);
    }
  }, [user, eventId, rsvpStatus]);

  return {
    rsvpStatus,
    isStarred,
    isPublic,
    attendees,
    attendeeCount,
    loading,
    setRSVP,
    toggleStar,
    setPublic,
  };
}

/**
 * Fetch all events the current user has RSVPed to or starred.
 * Useful for the "You're Going" section on the feed.
 */
export function useMyRSVPs() {
  const { user } = useAuth();
  const [rsvps, setRsvps] = useState([]);
  const [starred, setStarred] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('event_rsvps')
      .select('event_id, status, is_starred')
      .eq('user_id', user.id);

    const goingIds = [];
    const starredIds = [];
    (data || []).forEach((row) => {
      if (row.status === 'going') goingIds.push(row.event_id);
      if (row.is_starred) starredIds.push(row.event_id);
    });
    setRsvps(goingIds);
    setStarred(starredIds);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { goingEventIds: rsvps, starredEventIds: starred, loading, refresh: fetchAll };
}
