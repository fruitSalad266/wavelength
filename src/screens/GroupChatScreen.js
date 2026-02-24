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
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { fonts } from '../theme/fonts';

// ---------------------------------------------------------------------------
// Mock data — will be replaced by Supabase queries
// ---------------------------------------------------------------------------

const GROUP_INFO = {
  id: '1',
  name: 'University of Washington Students',
  description: 'Current and former UW students going to the show',
  icon: '🎓',
  memberCount: 234,
};

const MEMBERS = [
  { id: '1', name: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', major: 'Computer Science', year: 'UW 2025', mutualFriends: 5, isVerified: true, isFriend: false },
  { id: '2', name: 'Marcus Johnson', avatar: 'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', major: 'Business Administration', year: 'UW 2026', mutualFriends: 3, isVerified: true, isFriend: false },
  { id: '3', name: 'Dyllan Krouse', avatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', major: 'Business Administration', year: 'UW 2024', mutualFriends: 8, isVerified: true, isFriend: true },
  { id: '4', name: 'David Park', avatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', major: 'Engineering', year: 'UW 2027', mutualFriends: 2, isVerified: true, isFriend: false },
  { id: '5', name: 'Lisa Anderson', avatar: 'https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', major: 'Pre-Med', year: 'UW 2026', mutualFriends: 6, isVerified: true, isFriend: false },
  { id: '6', name: 'Jason Lee', avatar: 'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', year: 'UW 2025', mutualFriends: 1, isVerified: true, isFriend: false },
];

const YEARS = ['All', 'UW 2024', 'UW 2025', 'UW 2026', 'UW 2027'];
const MAJORS = ['All', 'Computer Science', 'Business Administration', 'Psychology', 'Engineering', 'Pre-Med'];

const INITIAL_MESSAGES = [
  { id: '1', senderId: '1', senderName: 'Emily Chen', senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', text: 'Hey everyone! So excited for the concert! Anyone planning to tailgate before?', timestamp: '2 hours ago' },
  { id: '2', senderId: '2', senderName: 'Marcus Johnson', senderAvatar: 'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', text: 'Yes! A group of us from Foster are planning to meet at the North parking lot around 3pm', timestamp: '1 hour ago' },
  { id: '3', senderId: '3', senderName: 'Dyllan Krouse', senderAvatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', text: "That sounds awesome! Can I join? I'm bringing some snacks 🎉", timestamp: '45 minutes ago', isFriend: true },
  { id: '4', senderId: '4', senderName: 'David Park', senderAvatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', text: "For sure! The more the merrier. Does anyone know if there's a bag policy?", timestamp: '30 minutes ago' },
  { id: '5', senderId: '5', senderName: 'Lisa Anderson', senderAvatar: 'https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', text: 'Only clear bags or small clutches! I learned that the hard way at the last concert 😅', timestamp: '15 minutes ago' },
  { id: '6', senderId: '1', senderName: 'Emily Chen', senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', text: 'Good to know! See you all there! Go Dawgs! 💜💛', timestamp: '5 minutes ago' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ChatBubble({ msg, isMe }) {
  return (
    <View style={[s.bubbleWrap, isMe && s.bubbleWrapMe]}>
      <View style={[s.bubbleRow, isMe && s.bubbleRowMe]}>
        {!isMe && (
          <Avatar uri={msg.senderAvatar} name={msg.senderName} size={30} style={{ borderWidth: 0 }} />
        )}
        <View style={s.bubbleContent}>
          {!isMe && (
            <View style={s.senderRow}>
              <Text style={s.bubbleSender}>{msg.senderName}</Text>
              {msg.isFriend && (
                <View style={s.friendTag}>
                  <Feather name="user-check" size={9} color="#00ac9b" />
                  <Text style={s.friendTagText}>Friend</Text>
                </View>
              )}
            </View>
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

function MemberCard({ member }) {
  return (
    <View style={[s.memberCard, member.isFriend && s.memberCardFriend]}>
      <View style={s.memberRow}>
        <View style={s.memberAvatarWrap}>
          <Avatar uri={member.avatar} name={member.name} size={50} style={{ borderColor: member.isFriend ? '#00ac9b' : '#7300ff' }} />
          {member.isVerified && (
            <View style={s.verifiedDot}>
              <Feather name="check" size={9} color="#fff" />
            </View>
          )}
        </View>
        <View style={s.memberInfo}>
          <View style={s.memberNameRow}>
            <Text style={s.memberName} numberOfLines={1}>{member.name}</Text>
            {member.isFriend && (
              <View style={s.friendBadge}>
                <Text style={s.friendBadgeText}>Friend</Text>
              </View>
            )}
          </View>
          {member.major && <Text style={s.memberMajor}>{member.major}</Text>}
          <View style={s.memberBadges}>
            <View style={s.yearBadge}>
              <Text style={s.yearBadgeText}>{member.year}</Text>
            </View>
            {member.isVerified && (
              <View style={s.verifiedBadgeSmall}>
                <Text style={s.verifiedBadgeSmallText}>Verified</Text>
              </View>
            )}
          </View>
          {member.mutualFriends > 0 && (
            <Text style={s.memberMutual}>
              {member.mutualFriends} mutual friend{member.mutualFriends > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity style={s.msgBtn}>
          <Text style={s.msgBtnText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function GroupChatScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState('chat');
  const [hasJoined, setHasJoined] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const scrollRef = useRef(null);

  // Filters for overview members
  const [filterYear, setFilterYear] = useState('All');
  const [filterMajor, setFilterMajor] = useState('All');
  const [sortByMutual, setSortByMutual] = useState(false);

  const getFilteredMembers = () => {
    let filtered = [...MEMBERS];
    if (filterYear !== 'All') filtered = filtered.filter((m) => m.year === filterYear);
    if (filterMajor !== 'All') filtered = filtered.filter((m) => m.major === filterMajor);
    if (sortByMutual) filtered.sort((a, b) => (b.mutualFriends || 0) - (a.mutualFriends || 0));
    return filtered;
  };

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        senderId: 'me',
        senderName: 'You',
        senderAvatar: '',
        text: message.trim(),
        timestamp: 'Just now',
      },
    ]);
    setMessage('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ------- Pre-join: full group header with join button -------
  if (!hasJoined) {
    return (
      <KeyboardAvoidingView
        style={s.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

        <View style={[s.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backRow}>
            <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        <View style={s.cardWrap}>
          <LinearGradient colors={['#7300ff', '#00ac9b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.fullGroupHeader}>
            <View style={s.groupTopRow}>
              <View style={s.groupEmojiCircle}>
                <Text style={s.groupEmoji}>{GROUP_INFO.icon}</Text>
              </View>
              <View style={s.groupMeta}>
                <Text style={s.groupName} numberOfLines={2}>{GROUP_INFO.name}</Text>
                <Badge
                  label="Verified UW Students"
                  style={{ backgroundColor: '#fff', marginBottom: 4, alignSelf: 'flex-start' }}
                  textStyle={{ color: '#7300ff', fontFamily: fonts.semiBold }}
                />
                <Text style={s.groupDesc}>{GROUP_INFO.description}</Text>
                <View style={s.groupMemberCount}>
                  <Feather name="users" size={13} color="#fff" />
                  <Text style={s.groupMemberText}>{GROUP_INFO.memberCount} members</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={s.joinBtnLarge} activeOpacity={0.8} onPress={() => setHasJoined(true)}>
              <Feather name="user-plus" size={15} color="#7300ff" />
              <Text style={s.joinBtnLargeText}>Join Group</Text>
            </TouchableOpacity>

            <View style={s.tabBar}>
              <TouchableOpacity style={[s.tab, view === 'chat' && s.tabActive]} onPress={() => setView('chat')}>
                <Text style={[s.tabText, view === 'chat' && s.tabTextActive]}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.tab, view === 'members' && s.tabActive]} onPress={() => setView('members')}>
                <Text style={[s.tabText, view === 'members' && s.tabTextActive]}>Members ({MEMBERS.length})</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {view === 'chat' ? (
            <View style={s.chatArea}>
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
              <View style={[s.joinPrompt, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <Text style={s.joinPromptText}>Join the group to start chatting with other UW students</Text>
                <TouchableOpacity style={s.joinBtnInline} activeOpacity={0.8} onPress={() => setHasJoined(true)}>
                  <Feather name="user-plus" size={15} color="#fff" />
                  <Text style={s.joinBtnInlineText}>Join Group</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <FlatList
              data={MEMBERS}
              keyExtractor={(item) => item.id}
              style={s.membersList}
              contentContainerStyle={[s.membersContent, { paddingBottom: insets.bottom + 16 }]}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <MemberCard member={item} />}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ------- Post-join: compact header, tappable for overview -------
  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Compact header */}
      <View style={[s.compactHeader, { paddingTop: insets.top }]}>
        <View style={s.compactHeaderInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.compactBackBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={s.compactCenter} activeOpacity={0.7} onPress={() => setShowOverview(true)}>
            <View style={s.compactEmojiCircle}>
              <Text style={s.compactEmoji}>{GROUP_INFO.icon}</Text>
            </View>
            <View style={s.compactInfo}>
              <Text style={s.compactName} numberOfLines={1}>{GROUP_INFO.name}</Text>
              <Text style={s.compactSub}>{GROUP_INFO.memberCount} members</Text>
            </View>
            <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Overview panel */}
      {showOverview ? (
        <View style={s.cardWrap}>
          <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />
          <ScrollView
            style={s.overviewScroll}
            contentContainerStyle={[s.overviewContent, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Group overview header */}
            <View style={s.overviewTop}>
              <View style={s.overviewEmojiCircle}>
                <Text style={s.overviewEmoji}>{GROUP_INFO.icon}</Text>
              </View>
              <Text style={s.overviewName}>{GROUP_INFO.name}</Text>
              <Badge
                label="Verified UW Students"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 10, alignSelf: 'center' }}
                textStyle={{ color: '#fff', fontFamily: fonts.semiBold }}
              />
              <Text style={s.overviewDesc}>{GROUP_INFO.description}</Text>
              <View style={s.overviewMemberCount}>
                <Feather name="users" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={s.overviewMemberText}>{GROUP_INFO.memberCount} members</Text>
              </View>
            </View>

            {/* Filters */}
            <View style={s.filtersCard}>
              <View style={s.filterRow}>
                <Text style={s.filterLabel}>Year</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterPills}>
                  {YEARS.map((yr) => (
                    <TouchableOpacity
                      key={yr}
                      style={[s.filterPill, filterYear === yr && s.filterPillActive]}
                      onPress={() => setFilterYear(yr)}
                    >
                      <Text style={[s.filterPillText, filterYear === yr && s.filterPillTextActive]}>{yr}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={s.filterRow}>
                <Text style={s.filterLabel}>Major</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterPills}>
                  {MAJORS.map((mj) => (
                    <TouchableOpacity
                      key={mj}
                      style={[s.filterPill, filterMajor === mj && s.filterPillActive]}
                      onPress={() => setFilterMajor(mj)}
                    >
                      <Text style={[s.filterPillText, filterMajor === mj && s.filterPillTextActive]}>{mj}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <TouchableOpacity
                style={[s.sortBtn, sortByMutual && s.sortBtnActive]}
                onPress={() => setSortByMutual(!sortByMutual)}
              >
                <Feather name="arrow-down" size={14} color={sortByMutual ? '#fff' : '#7300ff'} />
                <Text style={[s.sortBtnText, sortByMutual && s.sortBtnTextActive]}>Sort by mutual friends</Text>
              </TouchableOpacity>
            </View>

            {/* Members section */}
            <View style={s.overviewMembersSection}>
              <Text style={s.overviewMembersTitle}>
                Members ({getFilteredMembers().length})
              </Text>
              {getFilteredMembers().map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </View>

            {/* Back to chat button */}
            <TouchableOpacity style={s.backToChatBtn} activeOpacity={0.8} onPress={() => setShowOverview(false)}>
              <Feather name="message-circle" size={16} color="#7300ff" />
              <Text style={s.backToChatText}>Back to Chat</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      ) : (
        <View style={s.cardWrap}>
          {/* Chat messages */}
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
      )}
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  root: { flex: 1 },

  // Shared header
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

  // Card wrapper
  cardWrap: {
    flex: 1,
    backgroundColor: 'rgba(249,250,251,0.92)',
    overflow: 'hidden',
  },

  // ===== PRE-JOIN: Full group header =====
  fullGroupHeader: {
    padding: 18,
    paddingBottom: 12,
  },
  groupTopRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  groupEmojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupEmoji: {
    fontSize: 28,
  },
  groupMeta: {
    flex: 1,
  },
  groupName: {
    color: '#fff',
    fontSize: 20,
    fontFamily: fonts.semiBold,
    marginBottom: 6,
  },
  groupDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontFamily: fonts.regular,
    marginBottom: 6,
  },
  groupMemberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  groupMemberText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  joinBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  joinBtnLargeText: {
    color: '#7300ff',
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },

  // Tabs (pre-join)
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  tabTextActive: {
    color: '#7300ff',
  },

  // Chat area
  chatArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesScroll: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },

  // Join prompt (pre-join, bottom of chat)
  joinPrompt: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  joinPromptText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#4a5565',
    textAlign: 'center',
    marginBottom: 14,
  },
  joinBtnInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7300ff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  joinBtnInlineText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },

  // ===== POST-JOIN: Compact header =====
  compactHeader: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  compactHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
    gap: 6,
  },
  compactBackBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactEmojiCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactEmoji: {
    fontSize: 17,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },
  compactSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: fonts.regular,
  },

  // ===== Overview panel =====
  overviewScroll: {
    flex: 1,
  },
  overviewContent: {
    padding: 20,
  },
  overviewTop: {
    alignItems: 'center',
    marginBottom: 24,
  },
  overviewEmojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  overviewEmoji: {
    fontSize: 36,
  },
  overviewName: {
    fontSize: 22,
    fontFamily: fonts.semiBold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  overviewDesc: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  overviewMemberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  overviewMemberText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.8)',
  },

  // Filters card
  filtersCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  filterPillActive: {
    backgroundColor: '#fff',
  },
  filterPillText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.9)',
  },
  filterPillTextActive: {
    color: '#7300ff',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 4,
  },
  sortBtnActive: {
    backgroundColor: '#7300ff',
  },
  sortBtnText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.9)',
  },
  sortBtnTextActive: {
    color: '#fff',
  },

  // Overview members section
  overviewMembersSection: {
    marginBottom: 20,
  },
  overviewMembersTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#fff',
    marginBottom: 12,
  },

  // Back to chat button
  backToChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 10,
  },
  backToChatText: {
    color: '#7300ff',
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },

  // ===== Input bar (post-join) =====
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

  // ===== Bubbles =====
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

  // ===== Members list + cards =====
  membersList: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  membersContent: {
    padding: 14,
    gap: 10,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  memberAvatarWrap: {
    position: 'relative',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#7300ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#101828',
  },
  memberMajor: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginBottom: 6,
  },
  memberBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  yearBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  yearBadgeText: {
    color: '#7300ff',
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  verifiedBadgeSmall: {
    backgroundColor: '#7300ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadgeSmallText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  memberCardFriend: {
    borderColor: '#00ac9b',
    borderWidth: 1.5,
  },
  friendBadge: {
    backgroundColor: '#e6f9f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  friendBadgeText: {
    fontSize: 9,
    fontFamily: fonts.semiBold,
    color: '#00ac9b',
  },
  memberMutual: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginTop: 2,
  },
  // Chat bubble friend tag
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
    marginLeft: 4,
  },
  friendTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#e6f9f5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  friendTagText: {
    fontSize: 9,
    fontFamily: fonts.semiBold,
    color: '#00ac9b',
  },
  msgBtn: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  msgBtnText: {
    color: '#7300ff',
    fontSize: 12,
    fontFamily: fonts.medium,
  },
});
