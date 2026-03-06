export const MEMBER_META = {
  'Sarah Mitchell': {
    major: 'Business Administration',
    year: 'UW 2025',
  },
  'Michael Chen': {
    major: 'Computer Science',
    year: 'UW 2026',
  },
  'Emma Rodriguez': {
    major: 'Communications',
    year: 'UW 2025',
  },
};

export const FALLBACK_SQUAD_MEMBERS = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    avatar:
      'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar:
      'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
  },
];

/**
 * Build default squad chat messages from members (for MatchGroupChatScreen).
 * @param {Array} members - Array of { id, name, avatar }
 * @returns {Array} Initial messages
 */
export function buildSquadInitialMessages(members, fallbackMembers) {
  const m0 = members[0] || fallbackMembers[0];
  const m1 = members[1] || fallbackMembers[1];
  const m2 = members[2] || fallbackMembers[2];
  return [
    {
      id: '1',
      senderId: m0?.id || '1',
      senderName: m0?.name || 'Sarah Mitchell',
      senderAvatar: m0?.avatar || fallbackMembers[0]?.avatar,
      text: "So excited for tonight! Anyone want to meet up near the merch stand before the show?",
      timestamp: '2h ago',
    },
    {
      id: '2',
      senderId: m1?.id || '2',
      senderName: m1?.name || 'Michael Chen',
      senderAvatar: m1?.avatar || fallbackMembers[1]?.avatar,
      text: 'Yes! I was thinking of getting there around 6:15 so we have time to grab drinks.',
      timestamp: '1h ago',
    },
    {
      id: '3',
      senderId: m2?.id || '3',
      senderName: m2?.name || 'Emma Rodriguez',
      senderAvatar: m2?.avatar || fallbackMembers[2]?.avatar,
      text: "I'm in! I'll be wearing a purple Huskies hoodie if you want to spot me 👀",
      timestamp: '45m ago',
    },
    {
      id: '4',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: '',
      text: "Love this squad. Let's meet by the north entrance right after doors open?",
      timestamp: 'Just now',
    },
  ];
}
