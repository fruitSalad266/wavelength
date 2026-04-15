import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { fonts } from '../../theme/fonts';
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

function GroupChatRow({ chat, onPress }) {
  const lastMsg = chat.lastMessage;
  return (
    <TouchableOpacity style={s.chatRow} activeOpacity={0.7} onPress={onPress}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={s.groupIcon}>
        <Text style={s.groupIconText}>{chat.icon}</Text>
      </LinearGradient>
      <View style={s.chatInfo}>
        <View style={s.chatNameRow}>
          <Text style={s.chatName} numberOfLines={1}>{chat.name}</Text>
          {lastMsg && <Text style={s.chatTime}>{formatTime(lastMsg.time)}</Text>}
        </View>
        <View style={s.chatMessageRow}>
          <Text style={s.chatMessage} numberOfLines={1}>
            {lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : `${chat.memberCount} members`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function DirectMessageRow({ chat, onPress }) {
  return (
    <TouchableOpacity style={s.chatRow} activeOpacity={0.7} onPress={onPress}>
      <Avatar uri={chat.avatar} name={chat.name} size={48} style={{ borderWidth: 0 }} />
      <View style={s.chatInfo}>
        <View style={s.chatNameRow}>
          <Text style={s.chatName} numberOfLines={1}>{chat.name}</Text>
          <Text style={s.chatTime}>{formatTime(chat.time)}</Text>
        </View>
        <View style={s.chatMessageRow}>
          <Text style={s.chatMessage} numberOfLines={1}>
            {chat.lastMessage}
          </Text>
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
  const { chats: groupChats, loading: gcLoading } = useMyGroupChats();
  const { threads: dmThreads, loading: dmLoading } = useDirectMessageThreads();

  const loading = gcLoading || dmLoading;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#6610f2', '#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <Text style={s.headerTitle}>Chats</Text>
        </View>
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
                <Text style={s.countText}>{groupChats.length}</Text>
              </View>
            </View>
            {groupChats.length > 0 ? (
              groupChats.map((chat) => (
                <GroupChatRow
                  key={chat.id}
                  chat={chat}
                  onPress={() => navigation.navigate('GroupChat', { groupId: chat.id, groupName: chat.name })}
                />
              ))
            ) : (
              <EmptyState icon="users" text="Join a group chat from an event page" />
            )}

            <View style={s.divider} />

            <View style={s.sectionHeader}>
              <Feather name="message-circle" size={16} color="#9810FA" />
              <Text style={s.sectionTitle}>Direct Messages</Text>
              <View style={s.countBadge}>
                <Text style={s.countText}>{dmThreads.length}</Text>
              </View>
            </View>
            {dmThreads.length > 0 ? (
              dmThreads.map((chat) => (
                <DirectMessageRow
                  key={chat.id}
                  chat={chat}
                  onPress={() => navigation.navigate('DirectMessage', { userId: chat.id, userName: chat.name })}
                />
              ))
            ) : (
              <EmptyState icon="message-circle" text="No messages yet" />
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
  groupIconText: {
    fontSize: 22,
  },
  chatInfo: {
    flex: 1,
  },
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
