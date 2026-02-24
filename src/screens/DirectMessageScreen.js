import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { fonts } from '../theme/fonts';

// ---------------------------------------------------------------------------
// Mock data — will be replaced by Supabase queries
// ---------------------------------------------------------------------------

const PERSON = {
  name: 'Alex',
  location: 'Seattle, WA',
  ageRange: '25-30',
  avatar: null,
};

const CONNECTION = {
  event: 'Ed Sheeran @ Lumen Field',
  firstMessage: '2 hours ago',
};

const MUTUAL_FRIENDS = [
  { id: '1', name: 'Sarah Mitchell', avatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
  { id: '2', name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
  { id: '3', name: 'Emma Rodriguez', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
];

const INITIAL_MESSAGES = [
  {
    id: '1',
    sender: 'alex',
    text: "Hey! I saw you're going to the Ed Sheeran concert too! Would love to meet up before the show. Are you planning to get there early? 🎵",
    timestamp: '2 hours ago',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ChatBubble({ msg, isMe }) {
  return (
    <View style={[s.bubbleWrap, isMe && s.bubbleWrapMe]}>
      <View style={[s.bubbleRow, isMe && s.bubbleRowMe]}>
        {!isMe && (
          <View style={s.bubbleAvatar}>
            <Feather name="user" size={14} color="#7300ff" />
          </View>
        )}
        <View style={s.bubbleContent}>
          <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleOther]}>
            <Text style={[s.bubbleText, isMe && s.bubbleTextMe]}>{msg.text}</Text>
          </View>
          <Text style={[s.bubbleTime, isMe && { textAlign: 'right' }]}>{msg.timestamp}</Text>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function DirectMessageScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const scrollRef = useRef(null);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'me',
        text: message.trim(),
        timestamp: 'Just now',
      },
    ]);
    setMessage('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Header bar */}
      <View style={[s.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backRow}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.9)" />
          <Text style={s.backLabel}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Chat card */}
      <View style={s.cardWrap}>
        {/* Person info header */}
        <View style={s.personHeader}>
          <View style={s.personRow}>
            <View style={s.personAvatar}>
              <Feather name="user" size={28} color="#7300ff" />
            </View>
            <View style={s.personInfo}>
              <Text style={s.personName}>{PERSON.name}</Text>
              <View style={s.personMeta}>
                <Feather name="map-pin" size={13} color="#4a5565" />
                <Text style={s.personMetaText}>{PERSON.location}</Text>
                <Text style={s.personMetaText}>•</Text>
                <Text style={s.personMetaText}>{PERSON.ageRange}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={s.viewProfileBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={s.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Connection info */}
          <View style={s.connectionBox}>
            <Text style={s.connectionText}>
              <Text style={s.connectionBold}>Found through: </Text>
              {CONNECTION.event}
            </Text>
            <Text style={s.connectionText}>
              <Text style={s.connectionBold}>First message: </Text>
              {CONNECTION.firstMessage}
            </Text>
          </View>

          {/* Mutual friends */}
          <View style={s.mutualSection}>
            <View style={s.mutualHeader}>
              <Feather name="users" size={14} color="#7300ff" />
              <Text style={s.mutualTitle}>{MUTUAL_FRIENDS.length} Mutual Friends</Text>
            </View>
            <View style={s.mutualRow}>
              {MUTUAL_FRIENDS.map((friend) => (
                <View key={friend.id} style={s.mutualItem}>
                  <Avatar uri={friend.avatar} name={friend.name} size={40} style={{ borderWidth: 0 }} />
                  <Text style={s.mutualName} numberOfLines={1}>
                    {friend.name.split(' ')[0]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={s.messagesScroll}
          contentContainerStyle={s.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} isMe={msg.sender === 'me'} />
          ))}
        </ScrollView>

        {/* Input */}
        <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={s.textInput}
            value={message}
            onChangeText={setMessage}
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  root: { flex: 1 },

  // Header
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

  // Card
  cardWrap: {
    flex: 1,
    backgroundColor: 'rgba(249,250,251,0.92)',
    overflow: 'hidden',
  },

  // Person header
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
    marginBottom: 14,
  },
  personAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7300ff',
  },
  personInfo: {
    flex: 1,
  },
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

  // Connection
  connectionBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    gap: 4,
  },
  connectionText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },
  connectionBold: {
    fontFamily: fonts.semiBold,
  },

  // Mutual friends
  mutualSection: {},
  mutualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  mutualTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#101828',
  },
  mutualRow: {
    flexDirection: 'row',
    gap: 14,
  },
  mutualItem: {
    alignItems: 'center',
    width: 52,
  },
  mutualName: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginTop: 4,
    textAlign: 'center',
  },

  // Messages
  messagesScroll: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },

  // Bubble
  bubbleWrap: {
    alignItems: 'flex-start',
  },
  bubbleWrapMe: {
    alignItems: 'flex-end',
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    maxWidth: '80%',
  },
  bubbleRowMe: {
    flexDirection: 'row-reverse',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleContent: {
    flexShrink: 1,
  },
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
  bubbleMe: {
    backgroundColor: '#7300ff',
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#101828',
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: '#fff',
  },
  bubbleTime: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginTop: 3,
    marginLeft: 4,
  },

  // Input
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
