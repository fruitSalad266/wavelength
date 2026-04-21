import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { fonts } from '../../theme/fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../hooks/useMessages';

function formatMsgTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (now - d < 60000) return 'Just now';
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ChatBubble({ msg }) {
  return (
    <View style={[s.bubbleWrap, msg.isMine && s.bubbleWrapMe]}>
      <View style={[s.bubbleRow, msg.isMine && s.bubbleRowMe]}>
        {!msg.isMine && (
          <View style={s.bubbleAvatar}>
            <Feather name="user" size={14} color="#7300ff" />
          </View>
        )}
        <View style={s.bubbleContent}>
          <View style={[s.bubble, msg.isMine ? s.bubbleMe : s.bubbleOther]}>
            <Text style={[s.bubbleText, msg.isMine && s.bubbleTextMe]}>{msg.body}</Text>
          </View>
          <Text style={[s.bubbleTime, msg.isMine && { textAlign: 'right' }]}>
            {formatMsgTime(msg.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function DirectMessageScreen({ navigation, route }) {
  const { userId, userName } = route?.params || {};
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { messages, loading, send } = useMessages({ recipientId: userId });

  const [messageText, setMessageText] = useState('');
  const [recipientProfile, setRecipientProfile] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const scrollRef = useRef(null);
  const typingChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const sendTypingRef = useRef(null);

  // Fetch recipient profile for avatar / location
  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, location, age_range')
      .eq('id', userId)
      .single()
      .then(({ data }) => { if (data) setRecipientProfile(data); });
  }, [userId]);

  // Typing indicator channel
  useEffect(() => {
    if (!userId || !user?.id) return;
    const channelId = [user.id, userId].sort().join('-');
    const ch = supabase
      .channel(`typing-dm-${channelId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === user.id) return;
        setPartnerTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 4000);
      })
      .subscribe();
    typingChannelRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(sendTypingRef.current);
    };
  }, [userId, user?.id]);

  const handleTextChange = (text) => {
    setMessageText(text);
    clearTimeout(sendTypingRef.current);
    sendTypingRef.current = setTimeout(() => {
      typingChannelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user?.id },
      });
    }, 500);
  };

  const handleSend = async () => {
    if (!messageText.trim()) return;
    const text = messageText.trim();
    setMessageText('');
    await send(text);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const displayName = recipientProfile?.full_name || userName || 'Unknown';

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[s.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backRow}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.9)" />
          <Text style={s.backLabel}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={s.cardWrap}>
        {/* Person header */}
        <View style={s.personHeader}>
          <View style={s.personRow}>
            <Avatar uri={recipientProfile?.avatar_url} name={displayName} size={56} style={{ borderWidth: 2, borderColor: '#7300ff' }} />
            <View style={s.personInfo}>
              <Text style={s.personName}>{displayName}</Text>
              {(recipientProfile?.location || recipientProfile?.age_range) ? (
                <View style={s.personMeta}>
                  {recipientProfile.location ? (
                    <>
                      <Feather name="map-pin" size={13} color="#4a5565" />
                      <Text style={s.personMetaText}>{recipientProfile.location}</Text>
                    </>
                  ) : null}
                  {recipientProfile.location && recipientProfile.age_range ? (
                    <Text style={s.personMetaText}>•</Text>
                  ) : null}
                  {recipientProfile.age_range ? (
                    <Text style={s.personMetaText}>{recipientProfile.age_range}</Text>
                  ) : null}
                </View>
              ) : null}
            </View>
            <TouchableOpacity
              style={s.viewProfileBtn}
              onPress={() => navigation.navigate('UserProfile', { userId })}
            >
              <Text style={s.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color="#7300ff" />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={s.messagesScroll}
            contentContainerStyle={s.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)}
            {partnerTyping && (
              <View style={s.typingWrap}>
                <Text style={s.typingText}>{displayName} is typing...</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Input */}
        <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={s.textInput}
            value={messageText}
            onChangeText={handleTextChange}
            placeholder="Type your message..."
            placeholderTextColor="#9ca3af"
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={s.sendBtn} activeOpacity={0.8} onPress={handleSend}>
            <Feather name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  header: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 50,
  },
  backLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: fonts.regular,
  },

  cardWrap: {
    flex: 1,
    backgroundColor: 'rgba(249,250,251,0.92)',
    overflow: 'hidden',
  },

  personHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 16,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personInfo: { flex: 1 },
  personName: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 4,
  },
  personMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  personMetaText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },
  viewProfileBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7300ff',
  },
  viewProfileText: {
    color: '#7300ff',
    fontSize: 13,
    fontFamily: fonts.medium,
  },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  messagesScroll: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },

  typingWrap: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  typingText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  bubbleWrap: { alignItems: 'flex-start' },
  bubbleWrapMe: { alignItems: 'flex-end' },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    maxWidth: '80%',
  },
  bubbleRowMe: { flexDirection: 'row-reverse' },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleContent: { flexShrink: 1 },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleOther: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bubbleMe: { backgroundColor: '#7300ff' },
  bubbleText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#101828',
    lineHeight: 20,
  },
  bubbleTextMe: { color: '#fff' },
  bubbleTime: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginTop: 3,
    marginLeft: 4,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#101828',
    backgroundColor: '#f9fafb',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#7300ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
