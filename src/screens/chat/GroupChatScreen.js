import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { fonts } from '../../theme/fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../hooks/useMessages';
import { useGroupChat } from '../../hooks/useGroupChats';

function formatMsgTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (now - d < 60000) return 'Just now';
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ChatBubble({ msg }) {
  return (
    <View style={[s.bubbleWrap, msg.isMine && s.bubbleWrapMe]}>
      <View style={[s.bubbleRow, msg.isMine && s.bubbleRowMe]}>
        {!msg.isMine && (
          <Avatar uri={msg.senderAvatar} name={msg.senderName} size={30} style={{ borderWidth: 0 }} />
        )}
        <View style={s.bubbleContent}>
          {!msg.isMine && <Text style={s.bubbleSender}>{msg.senderName}</Text>}
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

function MemberCard({ member, onMessage }) {
  return (
    <View style={s.memberCard}>
      <View style={s.memberRow}>
        <Avatar uri={member.avatar} name={member.name} size={50} style={{ borderColor: '#7300ff' }} />
        <View style={s.memberInfo}>
          <Text style={s.memberName} numberOfLines={1}>{member.name}</Text>
          {member.major ? <Text style={s.memberMajor}>{member.major}</Text> : null}
          {member.classYear ? (
            <View style={s.memberBadges}>
              <View style={s.yearBadge}>
                <Text style={s.yearBadgeText}>Class of {member.classYear}</Text>
              </View>
            </View>
          ) : null}
        </View>
        <TouchableOpacity style={s.msgBtn} onPress={onMessage}>
          <Text style={s.msgBtnText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function GroupChatScreen({ navigation, route }) {
  const { groupId } = route?.params || {};
  const { user, profile: myProfile } = useAuth();
  const insets = useSafeAreaInsets();

  const { group, members, isMember, loading: groupLoading, join } = useGroupChat(groupId);
  const { messages, loading: msgsLoading, send } = useMessages({ groupChatId: groupId });

  const [view, setView] = useState('chat');
  const [showOverview, setShowOverview] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [anyoneTyping, setAnyoneTyping] = useState(false);

  const scrollRef = useRef(null);
  const typingChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const sendTypingRef = useRef(null);

  // Derived filter options from real members
  const classYears = useMemo(
    () => ['All', ...Array.from(new Set(members.map((m) => m.classYear).filter(Boolean))).sort()],
    [members]
  );
  const majors = useMemo(
    () => ['All', ...Array.from(new Set(members.map((m) => m.major).filter(Boolean))).sort()],
    [members]
  );
  const [filterYear, setFilterYear] = useState('All');
  const [filterMajor, setFilterMajor] = useState('All');

  const filteredMembers = useMemo(() => {
    let list = [...members];
    if (filterYear !== 'All') list = list.filter((m) => m.classYear === filterYear);
    if (filterMajor !== 'All') list = list.filter((m) => m.major === filterMajor);
    return list;
  }, [members, filterYear, filterMajor]);

  // Typing indicator channel
  useEffect(() => {
    if (!groupId) return;
    const ch = supabase
      .channel(`typing-group-${groupId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === user?.id) return;
        setAnyoneTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setAnyoneTyping(false), 4000);
      })
      .subscribe();
    typingChannelRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(sendTypingRef.current);
    };
  }, [groupId, user?.id]);

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

  if (groupLoading) {
    return (
      <View style={[s.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const groupName = group?.name || route?.params?.groupName || 'Group Chat';
  const groupIcon = group?.icon || '💬';

  // ------- Pre-join -------
  if (!isMember) {
    return (
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                <Text style={s.groupEmoji}>{groupIcon}</Text>
              </View>
              <View style={s.groupMeta}>
                <Text style={s.groupName} numberOfLines={2}>{groupName}</Text>
                {group?.isVerified && (
                  <Badge
                    label="Verified UW Students"
                    style={{ backgroundColor: '#fff', marginBottom: 4, alignSelf: 'flex-start' }}
                    textStyle={{ color: '#7300ff', fontFamily: fonts.semiBold }}
                  />
                )}
                {group?.description ? <Text style={s.groupDesc}>{group.description}</Text> : null}
                <View style={s.groupMemberCount}>
                  <Feather name="users" size={13} color="#fff" />
                  <Text style={s.groupMemberText}>{group?.memberCount || 0} members</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={s.joinBtnLarge} activeOpacity={0.8} onPress={join}>
              <Feather name="user-plus" size={15} color="#7300ff" />
              <Text style={s.joinBtnLargeText}>Join Group</Text>
            </TouchableOpacity>

            <View style={s.tabBar}>
              <TouchableOpacity style={[s.tab, view === 'chat' && s.tabActive]} onPress={() => setView('chat')}>
                <Text style={[s.tabText, view === 'chat' && s.tabTextActive]}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.tab, view === 'members' && s.tabActive]} onPress={() => setView('members')}>
                <Text style={[s.tabText, view === 'members' && s.tabTextActive]}>Members ({members.length})</Text>
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
                {messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)}
              </ScrollView>
              <View style={[s.joinPrompt, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <Text style={s.joinPromptText}>Join the group to start chatting</Text>
                <TouchableOpacity style={s.joinBtnInline} activeOpacity={0.8} onPress={join}>
                  <Feather name="user-plus" size={15} color="#fff" />
                  <Text style={s.joinBtnInlineText}>Join Group</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              style={s.membersList}
              contentContainerStyle={[s.membersContent, { paddingBottom: insets.bottom + 16 }]}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <MemberCard
                  member={item}
                  onMessage={() => navigation.navigate('DirectMessage', { userId: item.id, userName: item.name })}
                />
              )}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ------- Post-join -------
  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[s.compactHeader, { paddingTop: insets.top }]}>
        <View style={s.compactHeaderInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.compactBackBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.compactCenter} activeOpacity={0.7} onPress={() => setShowOverview(true)}>
            <View style={s.compactEmojiCircle}>
              <Text style={s.compactEmoji}>{groupIcon}</Text>
            </View>
            <View style={s.compactInfo}>
              <Text style={s.compactName} numberOfLines={1}>{groupName}</Text>
              <Text style={s.compactSub}>{group?.memberCount || members.length} members</Text>
            </View>
            <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
      </View>

      {showOverview ? (
        <View style={s.cardWrap}>
          <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />
          <ScrollView
            style={s.overviewScroll}
            contentContainerStyle={[s.overviewContent, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.overviewTop}>
              <View style={s.overviewEmojiCircle}>
                <Text style={s.overviewEmoji}>{groupIcon}</Text>
              </View>
              <Text style={s.overviewName}>{groupName}</Text>
              {group?.isVerified && (
                <Badge
                  label="Verified UW Students"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 10, alignSelf: 'center' }}
                  textStyle={{ color: '#fff', fontFamily: fonts.semiBold }}
                />
              )}
              {group?.description ? <Text style={s.overviewDesc}>{group.description}</Text> : null}
              <View style={s.overviewMemberCount}>
                <Feather name="users" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={s.overviewMemberText}>{group?.memberCount || members.length} members</Text>
              </View>
            </View>

            <View style={s.filtersCard}>
              <View style={s.filterRow}>
                <Text style={s.filterLabel}>Year</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterPills}>
                  {classYears.map((yr) => (
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
                  {majors.map((mj) => (
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
            </View>

            <View style={s.overviewMembersSection}>
              <Text style={s.overviewMembersTitle}>Members ({filteredMembers.length})</Text>
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onMessage={() => {
                    setShowOverview(false);
                    navigation.navigate('DirectMessage', { userId: member.id, userName: member.name });
                  }}
                />
              ))}
            </View>

            <TouchableOpacity style={s.backToChatBtn} activeOpacity={0.8} onPress={() => setShowOverview(false)}>
              <Feather name="message-circle" size={16} color="#7300ff" />
              <Text style={s.backToChatText}>Back to Chat</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      ) : (
        <View style={s.cardWrap}>
          <ScrollView
            ref={scrollRef}
            style={s.messagesScroll}
            contentContainerStyle={s.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {msgsLoading ? (
              <ActivityIndicator color="#7300ff" style={{ marginTop: 40 }} />
            ) : (
              messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)
            )}
            {anyoneTyping && (
              <View style={s.typingWrap}>
                <Text style={s.typingText}>Someone is typing...</Text>
              </View>
            )}
          </ScrollView>

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
      )}
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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

  cardWrap: {
    flex: 1,
    backgroundColor: 'rgba(249,250,251,0.92)',
    overflow: 'hidden',
  },

  // ===== PRE-JOIN =====
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
  groupEmoji: { fontSize: 28 },
  groupMeta: { flex: 1 },
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
  tabActive: { backgroundColor: '#fff' },
  tabText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  tabTextActive: { color: '#7300ff' },

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

  // ===== POST-JOIN: compact header =====
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
  compactEmoji: { fontSize: 17 },
  compactInfo: { flex: 1 },
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
  overviewScroll: { flex: 1 },
  overviewContent: { padding: 20 },
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
  overviewEmoji: { fontSize: 36 },
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

  filtersCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  filterRow: { marginBottom: 12 },
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
  filterPillActive: { backgroundColor: '#fff' },
  filterPillText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.9)',
  },
  filterPillTextActive: { color: '#7300ff' },

  overviewMembersSection: { marginBottom: 20 },
  overviewMembersTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#fff',
    marginBottom: 12,
  },

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

  // ===== Input bar =====
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

  // ===== Typing indicator =====
  typingWrap: { paddingHorizontal: 4, paddingBottom: 4 },
  typingText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  // ===== Bubbles =====
  bubbleWrap: { alignItems: 'flex-start' },
  bubbleWrapMe: { alignItems: 'flex-end' },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    maxWidth: '80%',
  },
  bubbleRowMe: { flexDirection: 'row-reverse' },
  bubbleContent: { flexShrink: 1 },
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

  // ===== Members =====
  membersList: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  membersContent: {
    padding: 14,
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
    alignItems: 'center',
    gap: 12,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 2,
  },
  memberMajor: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginBottom: 4,
  },
  memberBadges: {
    flexDirection: 'row',
    gap: 6,
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
  msgBtn: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  msgBtnText: {
    color: '#7300ff',
    fontSize: 12,
    fontFamily: fonts.medium,
  },
});
