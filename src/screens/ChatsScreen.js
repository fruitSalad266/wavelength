import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { fonts } from '../theme/fonts';

const GROUP_CHATS = [
  {
    id: '1',
    name: 'University of Washington Students',
    icon: '🎓',
    lastMessage: 'Sarah: Who else is going to the after-party?',
    time: '2m ago',
    unread: 5,
    memberCount: 234,
  },
  {
    id: '2',
    name: 'OG Ed Sheeran Fans',
    icon: '🎸',
    lastMessage: "Mike: Can't wait for the Mathematics tour!",
    time: '15m ago',
    unread: 0,
    memberCount: 567,
  },
  {
    id: '3',
    name: 'Seattle Concert Meetup',
    icon: '🌆',
    lastMessage: 'Emma: Meeting at the south entrance at 4pm',
    time: '1h ago',
    unread: 12,
    memberCount: 412,
  },
  {
    id: '4',
    name: 'Summer Music Festival Group',
    icon: '🎵',
    lastMessage: 'James: Just got my tickets!!',
    time: '3h ago',
    unread: 0,
    memberCount: 89,
  },
];

const DIRECT_MESSAGES = [
  {
    id: 'dm-1',
    name: 'Sarah Mitchell',
    avatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    lastMessage: 'Are you going to the Ed Sheeran show?',
    time: '5m ago',
    unread: 2,
  },
  {
    id: 'dm-2',
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    lastMessage: 'Let me know if you find extra tickets',
    time: '30m ago',
    unread: 0,
  },
  {
    id: 'dm-3',
    name: 'Emma Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    lastMessage: 'That art show was amazing!',
    time: '2h ago',
    unread: 0,
  },
  {
    id: 'dm-4',
    name: 'Lisa Anderson',
    avatar: 'https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    lastMessage: "See you at the food truck rally!",
    time: '1d ago',
    unread: 0,
  },
];

function GroupChatRow({ chat, onPress }) {
  return (
    <TouchableOpacity style={s.chatRow} activeOpacity={0.7} onPress={onPress}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={s.groupIcon}>
        <Text style={s.groupIconText}>{chat.icon}</Text>
      </LinearGradient>
      <View style={s.chatInfo}>
        <View style={s.chatNameRow}>
          <Text style={s.chatName} numberOfLines={1}>{chat.name}</Text>
          <Text style={s.chatTime}>{chat.time}</Text>
        </View>
        <View style={s.chatMessageRow}>
          <Text style={[s.chatMessage, chat.unread > 0 && s.chatMessageUnread]} numberOfLines={1}>
            {chat.lastMessage}
          </Text>
          {chat.unread > 0 && (
            <View style={s.unreadBadge}>
              <Text style={s.unreadText}>{chat.unread}</Text>
            </View>
          )}
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
          <Text style={s.chatTime}>{chat.time}</Text>
        </View>
        <View style={s.chatMessageRow}>
          <Text style={[s.chatMessage, chat.unread > 0 && s.chatMessageUnread]} numberOfLines={1}>
            {chat.lastMessage}
          </Text>
          {chat.unread > 0 && (
            <View style={s.unreadBadge}>
              <Text style={s.unreadText}>{chat.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#6610f2', '#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <Text style={s.headerTitle}>Chats</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.card}>
          <View style={s.sectionHeader}>
            <Feather name="users" size={16} color="#9810FA" />
            <Text style={s.sectionTitle}>Group Chats</Text>
            <View style={s.countBadge}>
              <Text style={s.countText}>{GROUP_CHATS.length}</Text>
            </View>
          </View>
          {GROUP_CHATS.map((chat) => (
            <GroupChatRow
              key={chat.id}
              chat={chat}
              onPress={() => navigation.navigate('GroupChat', { groupId: chat.id })}
            />
          ))}

          <View style={s.divider} />

          <View style={s.sectionHeader}>
            <Feather name="message-circle" size={16} color="#9810FA" />
            <Text style={s.sectionTitle}>Direct Messages</Text>
            <View style={s.countBadge}>
              <Text style={s.countText}>{DIRECT_MESSAGES.length}</Text>
            </View>
          </View>
          {DIRECT_MESSAGES.map((chat) => (
            <DirectMessageRow
              key={chat.id}
              chat={chat}
              onPress={() => navigation.navigate('DirectMessage', { userId: chat.id })}
            />
          ))}
        </View>
      </ScrollView>
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
  chatMessageUnread: {
    fontFamily: fonts.medium,
    color: '#101828',
  },
  unreadBadge: {
    backgroundColor: '#7300ff',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },
});
