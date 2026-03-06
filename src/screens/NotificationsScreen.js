import React, { useState } from 'react';
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
import { NOTIFICATIONS } from '../data/mockNotifications';

function NotificationCard({ notification, onPress }) {
  return (
    <TouchableOpacity
      style={[s.card, !notification.read && s.cardUnread]}
      activeOpacity={0.7}
      onPress={() => onPress(notification)}
    >
      <View style={s.cardLeft}>
        {notification.avatar ? (
          <View style={s.avatarWrap}>
            <Avatar uri={notification.avatar} name={notification.title} size={46} />
            <View style={[s.iconBadge, { backgroundColor: notification.iconBg }]}>
              <Feather name={notification.icon} size={11} color={notification.iconColor} />
            </View>
          </View>
        ) : (
          <View style={s.avatarWrap}>
            <View style={s.emojiCircle}>
              <Text style={s.emojiText}>{notification.emoji}</Text>
            </View>
            <View style={[s.iconBadge, { backgroundColor: notification.iconBg }]}>
              <Feather name={notification.icon} size={11} color={notification.iconColor} />
            </View>
          </View>
        )}
      </View>

      <View style={s.cardBody}>
        <View style={s.cardTitleRow}>
          <Text style={s.cardTitle} numberOfLines={1}>{notification.title}</Text>
          {!notification.read && <View style={s.unreadDot} />}
        </View>
        <Text style={s.cardText} numberOfLines={2}>{notification.body}</Text>
        <Text style={s.cardTime}>{notification.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'friend_event', label: 'Friends going' },
    { key: 'friend_request', label: 'Friend requests' },
    { key: 'new_event', label: 'New events' },
  ];

  const filtered =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filter);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={s.headerBadge}>
                <Text style={s.headerBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead} style={s.markAllBtn}>
              <Feather name="check-circle" size={16} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={s.filtersWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filtersRow}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[s.filterPill, filter === f.key && s.filterPillActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[s.filterPillText, filter === f.key && s.filterPillTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notification list */}
      <ScrollView
        style={s.list}
        contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={s.emptyWrap}>
            <Feather name="bell-off" size={40} color="rgba(255,255,255,0.4)" />
            <Text style={s.emptyText}>No notifications here</Text>
          </View>
        ) : (
          filtered.map((n) => (
            <NotificationCard key={n.id} notification={n} onPress={markAsRead} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  header: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  headerBadge: {
    backgroundColor: '#ef4444',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  markAllBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filtersWrap: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  filterPillActive: {
    backgroundColor: '#fff',
  },
  filterPillText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.9)',
  },
  filterPillTextActive: {
    color: '#7300ff',
  },

  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  cardUnread: {
    backgroundColor: '#fff',
    borderLeftWidth: 3,
    borderLeftColor: '#7300ff',
  },

  cardLeft: {},
  avatarWrap: {
    position: 'relative',
  },
  emojiCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  cardBody: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#101828',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7300ff',
  },
  cardText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#4a5565',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#9ca3af',
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.6)',
  },
});
