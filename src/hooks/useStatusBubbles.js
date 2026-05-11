import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMyStatusNote } from './useMyStatusNote';
import { demoNoteForUserId, EXTRA_STATUS_BUBBLES } from '../data/demoStatusBubbles';

/**
 * Builds the Instagram-style status row: your note first, then DM friends, then demo fillers.
 */
export function useStatusBubbles(dmThreads) {
  const { user, profile } = useAuth();
  const { note: myNote, ready, saveNote } = useMyStatusNote();

  const bubbles = useMemo(() => {
    const list = [];
    const seen = new Set();

    if (user && profile) {
      const selfName = profile.full_name?.split(' ')[0] || 'You';
      list.push({
        id: 'self',
        isSelf: true,
        userId: user.id,
        name: selfName,
        displayTitle: 'Your note',
        avatar: profile.avatar_url,
        text: myNote,
      });
      seen.add(user.id);
    }

    for (const t of dmThreads || []) {
      if (!t?.id || seen.has(t.id)) continue;
      seen.add(t.id);
      const first = (t.name || 'Friend').split(' ')[0];
      list.push({
        id: t.id,
        isSelf: false,
        userId: t.id,
        name: first,
        displayTitle: first,
        avatar: t.avatar,
        text: demoNoteForUserId(t.id),
      });
    }

    for (const extra of EXTRA_STATUS_BUBBLES) {
      if (list.length >= 6) break;
      if (seen.has(extra.id)) continue;
      seen.add(extra.id);
      list.push({
        id: extra.id,
        isSelf: false,
        userId: null,
        name: extra.name,
        displayTitle: extra.name,
        avatar: extra.avatar,
        text: extra.text,
      });
    }

    return list.slice(0, 14);
  }, [user, profile, dmThreads, myNote]);

  return { bubbles, myNoteReady: ready, saveMyNote: saveNote };
}
