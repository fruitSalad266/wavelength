import { mockEvents } from './mockEvents';

export const STARRED_EVENT_IDS = ['1', '3'];

export const recentlyHappening = [
  {
    id: 'recent-1',
    title: 'Live Jazz Night',
    time: 'Happening now',
    image:
      'https://images.unsplash.com/photo-1611810293387-c8afe03cd7dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
  {
    id: 'recent-2',
    title: 'Food Truck Rally',
    time: 'Happening now',
    image:
      'https://images.unsplash.com/photo-1524584830732-b69165ddba9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
  {
    id: 'recent-3',
    title: 'Art Walk Downtown',
    time: 'Happening now',
    image:
      'https://images.unsplash.com/photo-1713779490284-a81ff6a8ffae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
];

export const friendsAttending = [
  {
    eventId: '1',
    event: mockEvents[0],
    friends: [
      { name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
      { name: 'Mike', avatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
      { name: 'Emma', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
    ],
  },
  {
    eventId: '3',
    event: mockEvents[2],
    friends: [
      { name: 'Lisa', avatar: 'https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
      { name: 'James', avatar: 'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
    ],
  },
];
