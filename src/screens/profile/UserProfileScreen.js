import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { fonts } from '../../theme/fonts';
import { USERS } from '../../data/mockUsers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

function EventThumb({ event }) {
  const size = (SCREEN_WIDTH - 48 - 24 - 12) / 3;
  return (
    <View style={[s.eventThumb, { width: size, height: size }]}>
      <Image source={{ uri: event.image }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
      <View style={s.eventThumbContent}>
        <Text style={s.eventThumbTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={s.eventThumbDate}>{event.date}</Text>
      </View>
    </View>
  );
}

export default function UserProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const userId = route.params?.userId || 'dyllan';
  const user = USERS[userId];
  const [friendsExpanded, setFriendsExpanded] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  if (!user) {
    return (
      <View style={s.root}>
        <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 100, fontFamily: fonts.medium }}>User not found</Text>
      </View>
    );
  }

  const PREVIEW_COUNT = 4;
  const visibleFriends = friendsExpanded ? user.mutualFriends : user.mutualFriends.slice(0, PREVIEW_COUNT);
  const hasMore = user.mutualFriends.length > PREVIEW_COUNT;

  const handleBlock = () => {
    setMenuVisible(false);
    Alert.alert('Block User', `Are you sure you want to block ${user.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: () => Alert.alert('Blocked', `${user.name} has been blocked.`) },
    ]);
  };

  const handleReport = () => {
    setMenuVisible(false);
    Alert.alert('Report User', `Are you sure you want to report ${user.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thank you. We will review this report.') },
    ]);
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={s.moreBtn} onPress={() => setMenuVisible(true)}>
            <Feather name="more-vertical" size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Three-dot menu modal */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={s.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[s.menuCard, { marginTop: insets.top + 52 }]}>
            <TouchableOpacity style={s.menuItem} onPress={handleBlock}>
              <Feather name="slash" size={18} color="#ef4444" />
              <Text style={s.menuItemTextDanger}>Block {user.name.split(' ')[0]}</Text>
            </TouchableOpacity>
            <View style={s.menuDivider} />
            <TouchableOpacity style={s.menuItem} onPress={handleReport}>
              <Feather name="flag" size={18} color="#ef4444" />
              <Text style={s.menuItemTextDanger}>Report {user.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={s.banner}>
          <Image source={{ uri: user.banner }} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(115,0,255,0.6)']} style={StyleSheet.absoluteFill} />
        </View>

        {/* Avatar */}
        <View style={s.avatarContainer}>
          <View style={s.avatarOuter}>
            <Avatar uri={user.avatar} name={user.name} size={104} style={{ borderWidth: 0 }} />
          </View>
        </View>

        {/* Name & info */}
        <View style={s.profileInfo}>
          <Text style={s.profileName}>{user.name}</Text>
          <View style={s.locationRow}>
            <Feather name="map-pin" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={s.locationText}>{user.location}</Text>
            <Text style={s.ageText}>{user.age}</Text>
          </View>
        </View>

        {/* Chips */}
        <View style={s.chipsWrap}>
          {user.isUWStudent && (
            <View style={s.uwChip}>
              <Feather name="check-circle" size={16} color="#7300ff" />
              <Text style={s.uwChipText}>Verified UW Student</Text>
            </View>
          )}
          {user.interests.map((interest) => (
            <View key={interest} style={s.chip}>
              <Text style={s.chipText}>{interest}</Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.addFriendBtn} activeOpacity={0.8}>
            <Feather name="user-plus" size={16} color="#fff" />
            <Text style={s.addFriendText}>Add Friend</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.messageBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DirectMessage', { userId: user.id })}
          >
            <Feather name="send" size={16} color="#fff" />
            <Text style={s.messageBtnText}>Message</Text>
          </TouchableOpacity>
        </View>

        <View style={s.cardBody}>
          {/* UW Section */}
          {user.isUWStudent && (
            <View style={s.uwSection}>
              <LinearGradient colors={['#4b0096', '#7300ff']} style={StyleSheet.absoluteFill} borderRadius={12} />
              <View style={s.uwHeader}>
                <Text style={s.uwEmoji}>🎓</Text>
                <Text style={s.uwTitle}>University of Washington</Text>
              </View>
              <View style={s.uwGrid}>
                <View style={s.uwItem}>
                  <Feather name="calendar" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={s.uwItemLabel}>Class of</Text>
                  <Text style={s.uwItemValue}>{user.uwYear}</Text>
                </View>
                <View style={s.uwItem}>
                  <Feather name="book-open" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={s.uwItemLabel}>Major</Text>
                  <Text style={s.uwItemValue}>{user.uwMajor}</Text>
                </View>
              </View>
              <View style={s.uwClubsSection}>
                <Text style={s.uwClubsLabel}>Affiliated Clubs</Text>
                <View style={s.uwClubsWrap}>
                  {user.uwClubs.map((club) => (
                    <View key={club} style={s.uwClub}>
                      <Text style={s.uwClubText}>{club}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Bio */}
          <Card>
            <Text style={s.cardTitle}>Bio</Text>
            <Text style={s.bioText}>{user.bio}</Text>
          </Card>

          {/* Top 3 Events */}
          <Card>
            <View style={s.promptHeader}>
              <Feather name="heart" size={18} color="#9810FA" />
              <Text style={s.promptLabel}>Top 3 events I've been to...</Text>
            </View>
            {user.topEvents.map((item, idx) => (
              <View key={idx} style={s.topEventRow}>
                <Text style={s.topEventEmoji}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.topEventTitle}>{item.title}</Text>
                  <Text style={s.topEventDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Current Anthem */}
          <Card>
            <View style={s.anthemRow}>
              <View style={s.anthemIcon}>
                <Feather name="music" size={22} color="#9810FA" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.anthemLabel}>Current Anthem</Text>
                <Text style={s.anthemTitle}>{user.anthem.title}</Text>
                <Text style={s.anthemArtist}>{user.anthem.artist}</Text>
              </View>
              <TouchableOpacity style={s.playBtn} onPress={() => Linking.openURL(user.anthem.url)}>
                <Feather name="play" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Recently Attended Events */}
          <Card>
            <Text style={s.cardTitle}>Recently Attended Events</Text>
            <View style={s.eventGrid}>
              {user.recentEvents.map((event) => (
                <EventThumb key={event.id} event={event} />
              ))}
            </View>
          </Card>

          {/* Connect */}
          <Card>
            <Text style={s.cardTitle}>Connect</Text>
            <View style={s.socialGrid}>
              {user.socialLinks.map((link, idx) => (
                <TouchableOpacity key={idx} style={s.socialRow} onPress={() => Linking.openURL(link.url)}>
                  <Feather name={link.icon} size={18} color={link.color} />
                  <Text style={s.socialLabel}>{link.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Mutual Friends */}
          <Card style={{ marginBottom: 0 }}>
            <View style={s.mutualHeader}>
              <Feather name="users" size={16} color="#7300ff" />
              <Text style={s.cardTitle}>{user.mutualFriends.length} Mutual Friends</Text>
            </View>

            {!friendsExpanded && (
              <TouchableOpacity
                style={s.friendAvatarsRow}
                activeOpacity={0.8}
                onPress={() => setFriendsExpanded(true)}
              >
                {visibleFriends.map((friend, idx) => (
                  <View key={friend.id} style={{ marginLeft: idx > 0 ? -10 : 0, zIndex: PREVIEW_COUNT - idx }}>
                    <Avatar uri={friend.avatar} name={friend.name} size={42} style={{ borderWidth: 2, borderColor: '#fff' }} />
                  </View>
                ))}
                {hasMore && (
                  <View style={[s.moreCircle, { marginLeft: -10 }]}>
                    <Text style={s.moreCircleText}>+{user.mutualFriends.length - PREVIEW_COUNT}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {friendsExpanded && (
              <View style={s.friendExpandedList}>
                {user.mutualFriends.map((friend) => (
                  <View key={friend.id} style={s.friendExpandedRow}>
                    <Avatar uri={friend.avatar} name={friend.name} size={40} style={{ borderWidth: 0 }} />
                    <Text style={s.friendExpandedName}>{friend.name}</Text>
                  </View>
                ))}
                <TouchableOpacity style={s.collapseFriendsBtn} activeOpacity={0.7} onPress={() => setFriendsExpanded(false)}>
                  <Feather name="chevron-up" size={16} color="#7300ff" />
                  <Text style={s.collapseFriendsText}>Show less</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  header: { backgroundColor: 'rgba(255,255,255,0.25)' },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  moreBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  // Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuCard: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  menuItemTextDanger: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: '#ef4444',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },

  banner: { height: 180, overflow: 'hidden' },
  avatarContainer: { alignItems: 'center', marginTop: -56, zIndex: 10 },
  avatarOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  profileInfo: { alignItems: 'center', paddingHorizontal: 24, marginTop: 12, marginBottom: 14 },
  profileName: { fontSize: 36, fontFamily: fonts.semiBold, color: '#fff', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { fontSize: 15, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.8)' },
  ageText: { fontSize: 15, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.8)', marginLeft: 12 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, paddingHorizontal: 16 },
  uwChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#7300ff',
    backgroundColor: '#FFFFE0',
  },
  uwChipText: { fontSize: 14, fontFamily: fonts.semiBold, color: '#7300ff' },
  chip: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 14, fontFamily: fonts.regular, color: '#fff' },

  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20, paddingHorizontal: 16 },
  addFriendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7300ff',
    paddingVertical: 14,
    borderRadius: 10,
  },
  addFriendText: { color: '#fff', fontSize: 16, fontFamily: fonts.semiBold },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00ac9b',
    paddingVertical: 14,
    borderRadius: 10,
  },
  messageBtnText: { color: '#fff', fontSize: 16, fontFamily: fonts.semiBold },

  cardBody: { paddingHorizontal: 16, paddingTop: 4 },

  // UW Section
  uwSection: { borderRadius: 12, padding: 18, marginBottom: 12, overflow: 'hidden' },
  uwHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  uwEmoji: { fontSize: 22 },
  uwTitle: { fontSize: 17, fontFamily: fonts.semiBold, color: '#fff' },
  uwGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  uwItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: 12, gap: 4 },
  uwItemLabel: { fontSize: 11, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  uwItemValue: { fontSize: 15, fontFamily: fonts.semiBold, color: '#fff' },
  uwClubsSection: { marginBottom: 4 },
  uwClubsLabel: { fontSize: 12, fontFamily: fonts.medium, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  uwClubsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  uwClub: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  uwClubText: { fontSize: 13, fontFamily: fonts.medium, color: '#fff' },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: { fontSize: 18, fontFamily: fonts.semiBold, color: '#101828', marginBottom: 12 },
  bioText: { fontSize: 15, fontFamily: fonts.regular, color: '#4a5565', lineHeight: 22 },

  promptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  promptLabel: { fontSize: 14, fontFamily: fonts.medium, color: '#4a5565' },
  topEventRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  topEventEmoji: { fontSize: 22 },
  topEventTitle: { fontSize: 15, fontFamily: fonts.semiBold, color: '#101828', marginBottom: 2 },
  topEventDesc: { fontSize: 13, fontFamily: fonts.regular, color: '#4a5565' },

  anthemRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  anthemIcon: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center' },
  anthemLabel: { fontSize: 13, fontFamily: fonts.regular, color: '#4a5565', marginBottom: 2 },
  anthemTitle: { fontSize: 17, fontFamily: fonts.semiBold, color: '#101828' },
  anthemArtist: { fontSize: 15, fontFamily: fonts.regular, color: '#4a5565' },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1DB954', alignItems: 'center', justifyContent: 'center', paddingLeft: 3 },

  eventGrid: { flexDirection: 'row', gap: 6 },
  eventThumb: { borderRadius: 8, overflow: 'hidden' },
  eventThumbContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 },
  eventThumbTitle: { color: '#fff', fontSize: 11, fontFamily: fonts.semiBold, marginBottom: 2 },
  eventThumbDate: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontFamily: fonts.regular },

  socialGrid: { gap: 4 },
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8 },
  socialLabel: { fontSize: 15, fontFamily: fonts.regular, color: '#101828' },

  // Mutual friends
  mutualHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  friendAvatarsRow: { flexDirection: 'row', alignItems: 'center' },
  moreCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  moreCircleText: { fontSize: 12, fontFamily: fonts.semiBold, color: '#7300ff' },
  friendExpandedList: { gap: 10 },
  friendExpandedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  friendExpandedName: { fontSize: 15, fontFamily: fonts.semiBold, color: '#101828' },
  collapseFriendsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, marginTop: 4 },
  collapseFriendsText: { fontSize: 13, fontFamily: fonts.medium, color: '#7300ff' },
});
