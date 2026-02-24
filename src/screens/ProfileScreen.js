import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { fonts } from '../theme/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const interests = [
  'Music Festivals',
  'Art & Culture',
  'Food & Dining',
  'Technology',
  'Photography',
  'Travel',
];

const recentEvents = [
  {
    id: '1',
    title: 'Summer Music Festival 2026',
    date: 'June 15, 2026',
    image:
      'https://images.unsplash.com/photo-1611810293387-c8afe03cd7dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
  {
    id: '2',
    title: 'Contemporary Art Exhibition',
    date: 'March 10, 2026',
    image:
      'https://images.unsplash.com/photo-1713779490284-a81ff6a8ffae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
  {
    id: '3',
    title: 'Street Food Festival',
    date: 'April 22, 2026',
    image:
      'https://images.unsplash.com/photo-1524584830732-b69165ddba9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
];

const topEvents = [
  { emoji: '🎵', title: 'Rufus Du Sol at the Gorge', desc: "The most magical sunset set I've ever experienced" },
  { emoji: '🏈', title: 'Oregon vs Washington 2024', desc: 'Best college football atmosphere - Go Dawgs!' },
  { emoji: '🏆', title: 'Super Bowl 2026', desc: 'Once in a lifetime experience with incredible halftime show' },
];

const socialLinks = [
  { icon: 'instagram', color: '#E60076', label: '@alex.events', url: 'https://instagram.com/alex.events' },
  { icon: 'twitter', color: '#51A2FF', label: '@alexevents', url: 'https://twitter.com/alexevents' },
  { icon: 'music', color: '#1DB954', label: 'alex_music', url: 'https://open.spotify.com/user/alex_music' },
  { icon: 'linkedin', color: '#155DFC', label: 'alex-johnson', url: 'https://linkedin.com/in/alex-johnson' },
];

const mutualFriends = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    avatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    interests: ['Art & Culture', 'Photography'],
    isUWStudent: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    interests: ['Technology', 'Music Festivals'],
    isUWStudent: true,
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    interests: ['Food & Dining', 'Travel'],
    isUWStudent: false,
  },
  {
    id: '4',
    name: 'James Park',
    avatar: 'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    interests: ['Music Festivals', 'Technology'],
    isUWStudent: true,
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    avatar: 'https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    interests: ['Art & Culture', 'Photography'],
    isUWStudent: false,
  },
  {
    id: '6',
    name: 'David Thompson',
    avatar: 'https://images.unsplash.com/photo-1758686253859-8ef7e940096e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    interests: ['Music Festivals', 'Travel'],
    isUWStudent: false,
  },
];

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function InterestChip({ label }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function EventThumb({ event }) {
  const size = (SCREEN_WIDTH - 48 - 24 - 12) / 3;
  return (
    <View style={[styles.eventThumb, { width: size, height: size }]}>
      <Image source={{ uri: event.image }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
      <View style={styles.eventThumbContent}>
        <Text style={styles.eventThumbTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.eventThumbDate}>{event.date}</Text>
      </View>
    </View>
  );
}

function FriendCard({ friend }) {
  const initials = friend.name.split(' ').map((n) => n[0]).join('');
  return (
    <View style={styles.friendCard}>
      <View style={styles.friendRow}>
        <View style={styles.friendAvatarWrap}>
          <Avatar uri={friend.avatar} name={friend.name} size={56} style={{ borderWidth: 0 }} />
          {friend.isUWStudent && (
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={10} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{friend.name}</Text>
          <View style={styles.friendChips}>
            {friend.interests.map((interest, idx) => (
              <View key={idx} style={styles.friendInterestChip}>
                <Text style={styles.friendInterestText}>{interest}</Text>
              </View>
            ))}
          </View>
          {friend.isUWStudent && (
            <View style={styles.uwBadge}>
              <Text style={styles.uwBadgeText}>UW Student</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Header bar */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Feather name="settings" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.settingsBtnText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreBtn}>
              <Feather name="more-vertical" size={20} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card container */}
        <View style={styles.profileCard}>
          {/* Banner */}
          <View style={styles.banner}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
              }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(249,250,251,1)']}
              style={StyleSheet.absoluteFill}
            />
          </View>

          {/* Profile picture - centered, overlapping the banner */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={48} color="#7300ff" />
              </View>
            </View>
          </View>

          {/* Name & info - centered */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Alex</Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={14} color="#4a5565" />
              <Text style={styles.locationText}>Seattle, WA</Text>
              <Text style={styles.ageText}>25-30</Text>
            </View>
            <View style={styles.mutualRow}>
              <Feather name="users" size={14} color="#7300ff" />
              <Text style={styles.mutualText}>{mutualFriends.length} mutual friends</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            {/* Interest chips */}
            <View style={styles.chipsWrap}>
              {interests.map((interest) => (
                <InterestChip key={interest} label={interest} />
              ))}
            </View>

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.addFriendBtn} activeOpacity={0.8}>
                <Text style={styles.addFriendText}>Add Friend</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageBtn} activeOpacity={0.8} onPress={() => navigation.navigate('DirectMessage', { userId: 'alex' })}>
                <Text style={styles.messageBtnText}>Message</Text>
              </TouchableOpacity>
            </View>

            {/* Bio */}
            <Card>
              <Text style={styles.cardTitle}>Bio</Text>
              <Text style={styles.bioText}>
                Front row seats, amazing friends, and singing along to every song at the top of my
                lungs. Bonus points if there's confetti and incredible light shows! 🎵✨
              </Text>
            </Card>

            {/* Top 3 Events */}
            <Card>
              <View style={styles.promptHeader}>
                <Feather name="heart" size={18} color="#9810FA" />
                <Text style={styles.promptLabel}>Top 3 events I've been to...</Text>
              </View>
              {topEvents.map((item, idx) => (
                <View key={idx} style={styles.topEventRow}>
                  <Text style={styles.topEventEmoji}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topEventTitle}>{item.title}</Text>
                    <Text style={styles.topEventDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </Card>

            {/* Current Anthem */}
            <Card>
              <View style={styles.anthemRow}>
                <View style={styles.anthemIcon}>
                  <Feather name="music" size={22} color="#9810FA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.anthemLabel}>Current Anthem</Text>
                  <Text style={styles.anthemTitle}>Blinding Lights</Text>
                  <Text style={styles.anthemArtist}>The Weeknd</Text>
                </View>
                <TouchableOpacity
                  style={styles.playBtn}
                  onPress={() => Linking.openURL('https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b')}
                >
                  <Feather name="play" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </Card>

            {/* Recently Attended Events */}
            <Card>
              <Text style={styles.cardTitle}>Recently Attended Events</Text>
              <View style={styles.eventGrid}>
                {recentEvents.map((event) => (
                  <EventThumb key={event.id} event={event} />
                ))}
              </View>
            </Card>

            {/* Connect */}
            <Card>
              <Text style={styles.cardTitle}>Connect</Text>
              <View style={styles.socialGrid}>
                {socialLinks.map((link, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.socialRow}
                    onPress={() => Linking.openURL(link.url)}
                  >
                    <Feather name={link.icon} size={18} color={link.color} />
                    <Text style={styles.socialLabel}>{link.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Mutual Friends */}
            <Card style={{ marginBottom: 0 }}>
              <Text style={styles.cardTitle}>Mutual Friends</Text>
              {mutualFriends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Header
  header: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBtnLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  settingsBtnText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile card wrapper
  profileCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: 'rgba(249,250,251,0.92)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  banner: {
    height: 180,
    overflow: 'hidden',
  },

  // Centered avatar
  avatarContainer: {
    alignItems: 'center',
    marginTop: -56,
    zIndex: 10,
  },
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
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile info (centered)
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  profileName: {
    fontSize: 36,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },
  ageText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginLeft: 12,
  },
  mutualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mutualText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#7300ff',
  },

  // Card body (content area inside the white card)
  cardBody: {
    padding: 16,
    paddingTop: 20,
  },

  // Interest chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#1e2939',
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  addFriendBtn: {
    flex: 1,
    backgroundColor: '#7300ff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addFriendText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  messageBtn: {
    flex: 1,
    backgroundColor: '#00ac9b',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  messageBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },

  // Card
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
  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 12,
  },

  // Bio
  bioText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#4a5565',
    lineHeight: 22,
  },

  // Top events prompt
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  promptLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#4a5565',
  },
  topEventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  topEventEmoji: {
    fontSize: 22,
  },
  topEventTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 2,
  },
  topEventDesc: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },

  // Anthem
  anthemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  anthemIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anthemLabel: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginBottom: 2,
  },
  anthemTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: '#101828',
  },
  anthemArtist: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },

  // Event grid
  eventGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  eventThumb: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  eventThumbContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  eventThumbTitle: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.semiBold,
    marginBottom: 2,
  },
  eventThumbDate: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    fontFamily: fonts.regular,
  },

  // Social grid
  socialGrid: {
    gap: 4,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  socialLabel: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#101828',
  },

  // Mutual friends
  friendCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  friendAvatarWrap: {
    position: 'relative',
  },
  verifiedBadge: {
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
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 6,
  },
  friendChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  friendInterestChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  friendInterestText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#1e2939',
  },
  uwBadge: {
    backgroundColor: '#7300ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  uwBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.medium,
  },
});
