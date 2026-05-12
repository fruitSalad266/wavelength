import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@wavelength/my_status_note';

export function useMyStatusNote() {
  const [note, setNote] = useState('');

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (!cancelled) setNote(v || '');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveNote = useCallback(async (text) => {
    const trimmed = (text || '').trim();
    setNote(trimmed);
    if (trimmed) {
      await AsyncStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { note, saveNote };
}
