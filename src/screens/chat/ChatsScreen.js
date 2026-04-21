import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Avatar } from '../../components/Avatar';
import { fonts } from '../../theme/fonts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useMyGroupChats } from '../../hooks/useGroupChats';
import { useDirectMessageThreads } from '../../hooks/useMessages';

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function UnreadDot() {
  return <View style={s.unreadDot} />;
}

function GroupChatRow({ chat, onPress, unread }) {
  const lastMsg = chat.lastMessage;
  return (
    <TouchableOpacity style={s.chatRow} activeOpacity={0.7} onPress={onPress}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={s.groupIcon}>
        <Text style={s.groupIconText}>{chat.icon}</Text>
      </LinearGradient>
      <View style={s.chatInfo}>
        <View style={s.chatNameRow}>
          <Text style={[s.chatName, unread && s.chatNameUnread]} numberOfLines={1}>{chat.name}</Text>
          {lastMsg && <Text style={s.chatTime}>{formatTime(lastMsg.time)}</Text>}
        </View>
        <View style={s.chatMessageRow}>
          <Text style={[s.chatMessage, unread && s.chatMessageUnread]} numberOfLines={1}>
            {lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : `${chat.memberCount} members`}
          </Text>
          {unread && <UnreadDot />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function DirectMessageRow({ chat, onPress, unread }) {
  return (
    <TouchableOpacity style={s.chatRow} activeOpacity={0.7} onPress={onPress}>
      <Avatar uri={chat.avatar} name={chat.name} size={48} style={{ borderWidth: 0 }} />
      <View style={s.chatInfo}>
        <View style={s.chatNameRow}>
          <Text style={[s.chatName, unread && s.chatNameUnread]} numberOfLines={1}>{chat.name}</Text>
          <Text style={s.chatTime}>{formatTime(chat.time)}</Text>
        </View>
        <View style={s.chatMessageRow}>
          <Text style={[s.chatMessage, unread && s.chatMessageUnread]} numberOfLines={1}>
            {chat.lastMessage}
          </Text>
          {unread && <UnreadDot />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ icon, text }) {
  return (
    <View style={s.emptyState}>
      <Feather name={icon} size={24} color="#9ca3af" />
      <Text style={s.emptyText}>{text}</Text>
    </View>
  );
}

export default function ChatsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { chats: groupChats, loading: gcLoading, refresh: refreshGC } = useMyGroupChats();
  const { threads: dmThreads, loading: dmLoading, refresh: refreshDMs } = useDirectMessageThreads();

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadIds, setUnreadIds] = useState(new Set());
  const searchRef = useRef(null);

  const loading = gcLoading || dmLoading;

  // Refresh lists whenever the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshGC();
      refreshDMs();
    }, [refreshGC, refreshDMs])
  );

  // Realtime subscription: mark sender as unread when a new DM arrives
  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel(`dm-inbox-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` },
        (payload) => {
          setUnreadIds((prev) => new Set([...prev, payload.new.sender_id]));
        }
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [user?.id]);

  const openGroupChat = (chat) => {
    setUnreadIds((prev) => { const n = new Set(prev); n.delete(chat.id); return n; });
    navigation.navigate('GroupChat', { groupId: chat.id, groupName: chat.name });
  };

  const openDM = (chat) => {
    setUnreadIds((prev) => { const n = new Set(prev); n.delete(chat.id); return n; });
    navigation.navigate('DirectMessage', { userId: chat.id, userName: chat.name });
  };

  const toggleSearch = () => {
    if (searchVisible) {
      setSearchQuery('');
      setSearchVisible(false);
    } else {
      setSearchVisible(true);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  };

  const q = searchQuery.toLowerCase();
  const filteredGroups = groupChats.filter((c) =>
    !q || c.name?.toLowerCase().includes(q) || c.lastMessage?.text?.toLowerCase().includes(q)
  );
  const filteredDMs = dmThreads.filter((c) =>
    !q || c.name?.toLowerCase().includes(q) || c.lastMessage?.toLowerCase().includes(q)
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#6610f2', '#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <Text style={s.headerTitle}>Chats</Text>
          <TouchableOpacity
            style={[s.searchBtn, searchVisible && s.searchBtnActive]}
            onPress={toggleSearch}
          >
            <Feather name={searchVisible ? 'x' : 'search'} size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {searchVisible && (
          <View style={s.searchBarWrap}>
            <Feather name="search" size={16} color="rgba(255,255,255,0.6)" style={{ marginRight: 8 }} />
            <TextInput
              ref={searchRef}
              style={s.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search chats..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x-circle" size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>
            <View style={s.sectionHeader}>
              <Feather name="users" size={16} color="#9810FA" />
              <Text style={s.sectionTitle}>Group Chats</Text>
              <View style={s.countBadge}>
                <Text style={s.countText}>{filteredGroups.length}</Text>
              </View>
            </View>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((chat) => (
                <GroupChatRow
                  key={chat.id}
                  chat={chat}
                  unread={unreadIds.has(chat.id)}
                  onPress={() => openGroupChat(chat)}
                />
              ))
            ) : (
              <EmptyState icon="users" text={q ? 'No matching group chats' : 'Join a group chat from an event page'} />
            )}

            <View style={s.divider} />

            <View style={s.sectionHeader}>
              <Feather name="message-circle" size={16} color="#9810FA" />
              <Text style={s.sectionTitle}>Direct Messages</Text>
              <View style={s.countBadge}>
                <Text style={s.countText}>{filteredDMs.length}</Text>
              </View>
            </View>
            {filteredDMs.length > 0 ? (
              filteredDMs.map((chat) => (
                <DirectMessageRow
                  key={chat.id}
                  chat={chat}
                  unread={unreadIds.has(chat.id)}
                  onPress={() => openDM(chat)}
                />
              ))
            ) : (
              <EmptyState icon="message-circle" text={q ? 'No matching messages' : 'No messages yet'} />
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  header: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontFamily: fonts.semiBold,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.regular,
    paddingVertical: 0,
  },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    margin: 16,
    backgroundColor: 'rgba(249,250,251,0.95)',
    borderRadius: 12,
    padding: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: '#101828',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#7300ff',
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 18,
  },

  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIconText: { fontSize: 22 },
  chatInfo: { flex: 1 },
  chatNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  chatName: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#101828',
    flex: 1,
    marginRight: 8,
  },
  chatNameUnread: { color: '#7300ff' },
  chatTime: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },
  chatMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatMessage: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#4a5565',
    flex: 1,
  },
  chatMessageUnread: {
    fontFamily: fonts.medium,
    color: '#101828',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7300ff',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#9ca3af',
  },
});
