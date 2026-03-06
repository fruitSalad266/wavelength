export const GROUP_INFO = {
  id: '1',
  name: 'University of Washington Students',
  description: 'Current and former UW students going to the show',
  icon: '🎓',
  memberCount: 234,
};

export const MEMBERS = [
  { id: '1', name: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', major: 'Computer Science', year: 'UW 2025', mutualFriends: 5, isVerified: true, isFriend: false },
  { id: '2', name: 'Marcus Johnson', avatar: 'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', major: 'Business Administration', year: 'UW 2026', mutualFriends: 3, isVerified: true, isFriend: false },
  { id: '3', name: 'Dyllan Krouse', avatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', major: 'Business Administration', year: 'UW 2024', mutualFriends: 8, isVerified: true, isFriend: true },
  { id: '4', name: 'David Park', avatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', major: 'Engineering', year: 'UW 2027', mutualFriends: 2, isVerified: true, isFriend: false },
  { id: '5', name: 'Lisa Anderson', avatar: 'https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', major: 'Pre-Med', year: 'UW 2026', mutualFriends: 6, isVerified: true, isFriend: false },
  { id: '6', name: 'Jason Lee', avatar: 'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', year: 'UW 2025', mutualFriends: 1, isVerified: true, isFriend: false },
];

export const YEARS = ['All', 'UW 2024', 'UW 2025', 'UW 2026', 'UW 2027'];
export const MAJORS = ['All', 'Computer Science', 'Business Administration', 'Psychology', 'Engineering', 'Pre-Med'];

export const INITIAL_MESSAGES = [
  { id: '1', senderId: '1', senderName: 'Emily Chen', senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', text: 'Hey everyone! So excited for the concert! Anyone planning to tailgate before?', timestamp: '2 hours ago' },
  { id: '2', senderId: '2', senderName: 'Marcus Johnson', senderAvatar: 'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', text: 'Yes! A group of us from Foster are planning to meet at the North parking lot around 3pm', timestamp: '1 hour ago' },
  { id: '3', senderId: '3', senderName: 'Dyllan Krouse', senderAvatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', text: "That sounds awesome! Can I join? I'm bringing some snacks 🎉", timestamp: '45 minutes ago', isFriend: true },
  { id: '4', senderId: '4', senderName: 'David Park', senderAvatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', text: "For sure! The more the merrier. Does anyone know if there's a bag policy?", timestamp: '30 minutes ago' },
  { id: '5', senderId: '5', senderName: 'Lisa Anderson', senderAvatar: 'https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', text: 'Only clear bags or small clutches! I learned that the hard way at the last concert 😅', timestamp: '15 minutes ago' },
  { id: '6', senderId: '1', senderName: 'Emily Chen', senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', text: 'Good to know! See you all there! Go Dawgs! 💜💛', timestamp: '5 minutes ago' },
];
