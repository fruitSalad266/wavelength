import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigateFromNotification(data) {
  if (!navigationRef.isReady() || !data) return;

  const type = data.type;
  const relatedUserId = data.relatedUserId ?? data.related_user_id;
  const relatedEventId = data.relatedEventId ?? data.related_event_id;

  if (type === 'friend_request' || type === 'friend_accepted') {
    if (relatedUserId) {
      navigationRef.navigate('UserProfile', { userId: relatedUserId });
    }
    return;
  }

  if (type === 'direct_message' && relatedUserId) {
    navigationRef.navigate('DirectMessage', { userId: relatedUserId });
    return;
  }

  if (type === 'friend_event' && relatedEventId) {
    navigationRef.navigate('EventDetail', { eventId: relatedEventId });
  }
}
