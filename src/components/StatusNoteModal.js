import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from './Avatar';
import { fonts } from '../theme/fonts';

const MAX_LEN = 56;

export function StatusNoteModal({ visible, bubble, onClose, onSaveMine, onMessage, subtitle }) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (visible && bubble?.isSelf) {
      setDraft(bubble.text || '');
    }
  }, [visible, bubble]);

  if (!bubble) return null;

  const handleSave = () => {
    onSaveMine?.(draft.slice(0, MAX_LEN));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.center}
        >
          <Pressable style={[styles.card, { paddingBottom: 20 + insets.bottom }]} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={12}>
              <Feather name="x" size={22} color="#6b7280" />
            </TouchableOpacity>

            {bubble.isSelf ? (
              <>
                <Text style={styles.title}>Your note</Text>
                <Text style={styles.sub}>{subtitle || 'Share a short note with other attendees.'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What’s on your mind?"
                  placeholderTextColor="#9ca3af"
                  value={draft}
                  onChangeText={(t) => setDraft(t.slice(0, MAX_LEN))}
                  multiline
                  maxLength={MAX_LEN}
                  autoFocus
                />
                <Text style={styles.counter}>{draft.length}/{MAX_LEN}</Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} activeOpacity={0.85}>
                  <Text style={styles.primaryBtnText}>Save note</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Avatar uri={bubble.avatar} name={bubble.name} size={72} style={{ borderWidth: 0, marginBottom: 12 }} />
                <Text style={styles.peerName}>{bubble.name}</Text>
                <Text style={styles.peerNote}>{bubble.text}</Text>
                {bubble.userId ? (
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => {
                      onMessage?.(bubble.userId, bubble.name);
                      onClose();
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryBtnText}>Message</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  center: {
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    paddingTop: 44,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: '#101828',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  counter: {
    alignSelf: 'flex-end',
    marginTop: 6,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#9ca3af',
  },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: '#7300ff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  peerName: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: '#101828',
    textAlign: 'center',
  },
  peerNote: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
});
