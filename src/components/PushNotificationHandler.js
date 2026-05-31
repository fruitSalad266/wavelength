import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Feather } from '@expo/vector-icons';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { navigateFromNotification } from '../navigation/navigationRef';
import { fonts } from '../theme/fonts';

export default function PushNotificationHandler() {
  const { permissionStatus, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

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

export function NotificationPromptBanner() {
  const { permissionStatus, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || permissionStatus === 'granted' || permissionStatus === 'undetermined') {
    return null;
  }

  return (
    <View style={ps.banner}>
      <View style={ps.iconWrap}>
        <Feather name="bell" size={18} color="#7300ff" />
      </View>
      <View style={ps.textWrap}>
        <Text style={ps.title}>Enable notifications</Text>
        <Text style={ps.body}>Get notified about messages, friend requests, and events</Text>
      </View>
      <TouchableOpacity style={ps.enableBtn} activeOpacity={0.8} onPress={requestPermission}>
        <Text style={ps.enableText}>Enable</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setDismissed(true)} hitSlop={8}>
        <Feather name="x" size={16} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );
}

const ps = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 1,
  },
  body: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },
  enableBtn: {
    backgroundColor: '#7300ff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  enableText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
});
