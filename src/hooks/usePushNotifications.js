import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

async function registerPushToken() {
  if (!Device.isDevice) return { token: null, status: 'unsupported' };

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return { token: null, status: finalStatus };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Wavelength',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return { token: null, status: 'no_project' };

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return { token: data, status: 'granted' };
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
  const [permissionStatus, setPermissionStatus] = useState('undetermined');

  const requestPermission = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'denied') {
      Linking.openSettings();
      return;
    }
    const { token, status: newStatus } = await registerPushToken();
    setPermissionStatus(newStatus);
    if (token && user) {
      tokenRef.current = token;
      await savePushToken(user.id, token);
    }
  }, [user]);

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
      const { token, status } = await registerPushToken();
      if (cancelled) return;
      setPermissionStatus(status);
      if (!token) return;
      tokenRef.current = token;
      await savePushToken(user.id, token);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { permissionStatus, requestPermission };
}
