import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

async function getExpoPushToken() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Wavelength',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

async function savePushToken(userId, token) {
  await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      token,
      platform: Platform.OS,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,token' }
  );
}

async function removePushToken(userId, token) {
  if (!userId || !token) return;
  await supabase.from('push_tokens').delete().eq('user_id', userId).eq('token', token);
}

export function usePushNotifications() {
  const { user } = useAuth();
  const tokenRef = useRef(null);
  const userIdRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (userIdRef.current && tokenRef.current) {
        removePushToken(userIdRef.current, tokenRef.current);
      }
      tokenRef.current = null;
      userIdRef.current = null;
      return;
    }

    userIdRef.current = user.id;
    let cancelled = false;

    (async () => {
      const token = await getExpoPushToken();
      if (cancelled || !token) return;
      tokenRef.current = token;
      await savePushToken(user.id, token);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);
}
