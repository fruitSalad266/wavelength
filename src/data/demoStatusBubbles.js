/**
 * Demo status lines for DM partners (Instagram-style short notes).
 * Deterministic per user id so the same person always shows the same line.
 */
const DEMO_PHRASES = [
  'Coffee later? ☕',
  'At the HUB 📍',
  'Game tonight 🏀',
  'Study break @lib',
  'Who’s at the show?',
  'Running late — 10m',
  'Free after 3 ✨',
  'Dinner @ Ave?',
];

export function demoNoteForUserId(userId) {
  if (!userId) return DEMO_PHRASES[0];
  let h = 0;
  for (let i = 0; i < userId.length; i += 1) {
    h = (h << 5) - h + userId.charCodeAt(i);
    h |= 0;
  }
  return DEMO_PHRASES[Math.abs(h) % DEMO_PHRASES.length];
}

/** Extra bubbles when the inbox is thin — looks like IG’s mixed row */
export const EXTRA_STATUS_BUBBLES = [
  {
    id: 'demo-status-maya',
    name: 'Maya',
    avatar: 'https://i.pravatar.cc/200?img=5',
    text: 'New playlist out 🎧',
  },
  {
    id: 'demo-status-jordan',
    name: 'Jordan',
    avatar: 'https://i.pravatar.cc/200?img=12',
    text: 'Pickleball anyone?',
  },
  {
    id: 'demo-status-sam',
    name: 'Sam',
    avatar: 'https://i.pravatar.cc/200?img=33',
    text: 'WFH today 💻',
  },
];
