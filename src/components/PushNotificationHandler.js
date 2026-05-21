import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { navigateFromNotification } from '../navigation/navigationRef';

export default function PushNotificationHandler() {
  usePushNotifications();

  useEffect(() => {
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse?.notification) {
      navigateFromNotification(lastResponse.notification.request.content.data);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      navigateFromNotification(response.notification.request.content.data);
    });

    return () => subscription.remove();
  }, []);

  return null;
}
