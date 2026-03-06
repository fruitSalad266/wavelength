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
import { Avatar } from '../../components/Avatar';
import { fonts } from '../../theme/fonts';
import { MEMBER_META, FALLBACK_SQUAD_MEMBERS, buildSquadInitialMessages } from '../../data/mockMatchSquad';

function ChatBubble({ msg, isMe }) {
  return (
    <View style={[s.bubbleWrap, isMe && s.bubbleWrapMe]}>
      <View style={[s.bubbleRow, isMe && s.bubbleRowMe]}>
        {!isMe && (
          <Avatar
            uri={msg.senderAvatar}
            name={msg.senderName}
            size={30}
            style={{ borderWidth: 0 }}
          />
        )}
        <View style={s.bubbleContent}>
          {!isMe && (
            <Text style={s.bubbleSender}>{msg.senderName}</Text>
          )}
          <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleOther]}>
            <Text style={[s.bubbleText, isMe && s.bubbleTextMe]}>{msg.text}</Text>
          </View>
          <Text style={[s.bubbleTime, isMe && { textAlign: 'right' }]}>{msg.timestamp}</Text>
        </View>
      </View>
    </View>
  );
}

export default function MatchGroupChatScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);

  const eventTitle = route.params?.eventTitle || 'This Event';
  const matchedAttendees = route.params?.matchedAttendees || [];

  const fallbackMembers = FALLBACK_SQUAD_MEMBERS;
  const rawMembers = matchedAttendees.length > 0 ? matchedAttendees : fallbackMembers;

  const members = rawMembers.map((m) => {
    const meta = MEMBER_META[m.name] || {};
    return { ...m, ...meta };
  });

  const majors = members.map((m) => m.major).filter(Boolean);
  const years = members.map((m) => m.year).filter(Boolean);

  const buildCommonBadges = (items) => {
    const counts = {};
    items.forEach((val) => {
      if (!val) return;
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([value, count]) => `${count}× ${value}`);
  };

  const commonMajorBadges = buildCommonBadges(majors);
  const commonYearBadges = buildCommonBadges(years);

  const _unusedInitialMessages = [
    {
      id: '1',
      senderId: members[0]?.id || '1',
      senderName: members[0]?.name || 'Sarah Mitchell',
      senderAvatar: members[0]?.avatar || fallbackMembers[0].avatar,
      text: "So excited for tonight! Anyone want to meet up near the merch stand before the show?",
      timestamp: '2h ago',
    },
    {
      id: '2',
      senderId: members[1]?.id || '2',
      senderName: members[1]?.name || 'Michael Chen',
      senderAvatar: members[1]?.avatar || fallbackMembers[1].avatar,
      text: 'Yes! I was thinking of getting there around 6:15 so we have time to grab drinks.',
      timestamp: '1h ago',
    },
    {
      id: '3',
      senderId: members[2]?.id || '3',
      senderName: members[2]?.name || 'Emma Rodriguez',
      senderAvatar: members[2]?.avatar || fallbackMembers[2].avatar,
      text: 'I’m in! I’ll be wearing a purple Huskies hoodie if you want to spot me 👀',
      timestamp: '45m ago',
    },
    {
      id: '4',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: '',
      text: 'Love this squad. Let’s meet by the north entrance right after doors open?',
      timestamp: 'Just now',
    },
  ];

  const initialMsgs = buildSquadInitialMessages(members, fallbackMembers);
  const [messages, setMessages] = useState(initialMsgs);
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newMsg = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      senderAvatar: '',
      text: trimmed,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Your Squad</Text>
            <Text style={s.headerSubtitle} numberOfLines={1}>
              Matches for {eventTitle}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
      </View>

      {/* Content */}
      <View style={s.cardWrap}>
        {/* Squad members row */}
        <View style={s.squadHeader}>
          <View style={s.squadTitleRow}>
            <Feather name="users" size={16} color="#9810FA" />
            <Text style={s.squadLabel}>Small match-based group</Text>
          </View>
          <View style={s.squadAvatarsRow}>
            {members.map((m, idx) => (
              <View
                key={m.id || idx}
                style={{ marginLeft: idx > 0 ? -10 : 0, zIndex: members.length - idx }}
              >
                <Avatar
                  uri={m.avatar}
                  name={m.name}
                  size={38}
                  style={{ borderWidth: 2, borderColor: '#fff' }}
                />
              </View>
            ))}
          </View>
          {(commonMajorBadges.length > 0 || commonYearBadges.length > 0) && (
            <View style={s.traitsRow}>
              {commonYearBadges.map((label) => (
                <View key={`year-${label}`} style={s.traitPill}>
                  <Feather name="calendar" size={12} color="#7300ff" style={{ marginRight: 4 }} />
                  <Text style={s.traitText}>{label}</Text>
                </View>
              ))}
              {commonMajorBadges.map((label) => (
                <View key={`major-${label}`} style={s.traitPill}>
                  <Feather name="book-open" size={12} color="#7300ff" style={{ marginRight: 4 }} />
                  <Text style={s.traitText}>{label}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={s.squadHint}>
            Just you and a handful of people with the highest match scores for this event.
          </Text>
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
            <ChatBubble key={msg.id} msg={msg} isMe={msg.senderId === 'me'} />
          ))}
        </ScrollView>

        {/* Input bar */}
        <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={s.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Say hi to your squad..."
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
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 2,
  },

  cardWrap: {
    flex: 1,
    backgroundColor: 'rgba(249,250,251,0.96)',
  },

  squadHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  squadTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  squadLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: '#4a5565',
  },
  squadAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  traitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: 'rgba(115,0,255,0.25)',
  },
  traitText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: '#4b0082',
  },
  squadHint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#6b7280',
  },

  messagesScroll: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
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

  // Bubbles
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
  bubbleContent: {
    flexShrink: 1,
  },
  bubbleSender: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#4a5565',
    marginBottom: 3,
    marginLeft: 4,
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
    color: '#9ca3af',
    marginTop: 3,
    marginLeft: 4,
  },
});

