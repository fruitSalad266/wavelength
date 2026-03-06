export const EVENT = {
  id: 'ed-sheeran-lumen',
  title: 'Ed Sheeran',
  venue: 'Lumen Field',
  date: 'August 1, 2026',
  time: '5:30 PM',
  attendeeCount: 1247,
  bannerImage:
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  tags: [
    { label: 'Concert', variant: 'purple' },
    { label: 'Large Event', variant: 'teal' },
    { label: 'Outdoor Venue', variant: 'outline' },
    { label: 'Stadium Tour', variant: 'outline' },
  ],
  tickets: {
    url: 'https://www.ticketmaster.com/ed-sheeran-tickets/artist/1595683',
    tiers: [
      { label: 'Floor', price: '$249.50' },
      { label: 'Lower Bowl', price: '$169.50' },
      { label: 'Upper Level', price: '$89.50' },
    ],
    startingPrice: '$89.50',
  },
  popularSong: {
    title: 'Shape of You',
    album: '÷',
    searchUrl: 'https://www.google.com/search?q=shape+of+you',
  },
};

export const ATTENDEES = [
  {
    id: 'dyllan',
    name: 'Dyllan Krouse',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    isGoodMatch: true,
    status: 'going',
    userId: 'dyllan',
    matchScore: 96,
  },
  {
    id: '1',
    name: 'Sarah Mitchell',
    avatar:
      'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    isGoodMatch: true,
    status: 'going',
    matchScore: 94,
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar:
      'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    isGoodMatch: false,
    status: 'going',
    matchScore: 88,
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    isGoodMatch: true,
    status: 'going',
    matchScore: 90,
  },
  {
    id: '4',
    name: 'James Park',
    avatar:
      'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    isGoodMatch: false,
    status: 'maybe',
    matchScore: 72,
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    avatar:
      'https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    isGoodMatch: true,
    status: 'going',
    matchScore: 86,
  },
  {
    id: '6',
    name: 'David Thompson',
    avatar:
      'https://images.unsplash.com/photo-1758686253859-8ef7e940096e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    isGoodMatch: false,
    status: 'going',
    matchScore: 80,
  },
  {
    id: '13',
    name: 'Olivia Foster',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    isGoodMatch: false,
    status: 'maybe',
    matchScore: 75,
  },
  {
    id: '14',
    name: 'Tyler Nguyen',
    avatar:
      'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    isGoodMatch: false,
    status: 'maybe',
    matchScore: 70,
  },
];

export const MUTUAL_CONNECTIONS = [
  { id: '7', name: 'Alex Kim', avatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', mutualFriends: 12 },
  { id: '8', name: 'Sophie Turner', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', mutualFriends: 8 },
  { id: '9', name: 'Marcus Johnson', avatar: 'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', mutualFriends: 5 },
  { id: '10', name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', mutualFriends: 15 },
  { id: '11', name: 'Ryan Martinez', avatar: 'https://images.unsplash.com/photo-1758686253859-8ef7e940096e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', mutualFriends: 3 },
  { id: '12', name: 'Nina Williams', avatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', mutualFriends: 9 },
];

export const FRIENDS_GOING = [
  { id: '1', name: 'Sarah Mitchell', avatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
  { id: '2', name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
  { id: '3', name: 'Emma Rodriguez', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
];

export const GROUP_CHATS = [
  { id: '1', name: 'University of Washington Students', memberCount: 234, icon: '🎓', description: 'Current and former UW students going to the show', isVerified: true },
  { id: '2', name: 'OG Ed Sheeran Fans', memberCount: 567, icon: '🎸', description: 'Been listening since the + album days', isVerified: false },
  { id: '3', name: '50+ Fans', memberCount: 89, icon: '🌟', description: 'Mature fans who love great music', isVerified: false },
  { id: '4', name: 'Seattle Concert Meetup', memberCount: 412, icon: '🌆', description: 'Local Seattle fans coordinating meetups', isVerified: false },
  { id: '5', name: 'First Timers', memberCount: 178, icon: '🎉', description: 'Going to your first Ed Sheeran concert?', isVerified: false },
  { id: '6', name: 'Photography Enthusiasts', memberCount: 145, icon: '📸', description: 'Share tips for capturing the best moments', isVerified: false },
];
