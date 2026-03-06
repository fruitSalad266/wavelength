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
import { Avatar } from '../../components/Avatar';
import { fonts } from '../../theme/fonts';
import { GROUP_CHATS_LIST, DIRECT_MESSAGES_LIST } from '../../data/mockChats';

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
              <Text style={s.countText}>{GROUP_CHATS_LIST.length}</Text>
            </View>
          </View>
          {GROUP_CHATS_LIST.map((chat) => (
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
              <Text style={s.countText}>{DIRECT_MESSAGES_LIST.length}</Text>
            </View>
          </View>
          {DIRECT_MESSAGES_LIST.map((chat) => (
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
