import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
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

// ---------------------------------------------------------------------------
// Mock data — structured for easy swap to Supabase later.
// Each dataset would correspond to a table / view / RPC call.
// ---------------------------------------------------------------------------

const EVENT = {
  id: 'ed-sheeran-lumen',
  title: 'Ed Sheeran',
  venue: 'Lumen Field',
  date: 'August 1, 2026',
  time: '5:30 PM',
  attendeeCount: 1247,
  bannerImage:
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  tags: [
    { label: 'Concert', variant: 'purple' },
    { label: 'Large Event', variant: 'teal' },
    { label: 'Outdoor Venue', variant: 'outline' },
    { label: 'Stadium Tour', variant: 'outline' },
  ],
  tickets: {
    url: 'https://www.ticketmaster.com/ed-sheeran-tickets/artist/1595683',
    tiers: [
      { label: 'Floor', price: '$249.50' },
      { label: 'Lower Bowl', price: '$169.50' },
      { label: 'Upper Level', price: '$89.50' },
    ],
    startingPrice: '$89.50',
  },
  popularSong: {
    title: 'Shape of You',
    album: '÷',
    searchUrl: 'https://www.google.com/search?q=shape+of+you',
  },
};

const ATTENDEES = [
  { id: '1', name: 'Sarah Mitchell', avatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', isGoodMatch: true, status: 'going' },
  { id: '2', name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', isGoodMatch: false, status: 'going' },
  { id: '3', name: 'Emma Rodriguez', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', isGoodMatch: true, status: 'going' },
  { id: '4', name: 'James Park', avatar: 'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', isGoodMatch: false, status: 'maybe' },
  { id: '5', name: 'Lisa Anderson', avatar: 'https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', isGoodMatch: true, status: 'going' },
  { id: '6', name: 'David Thompson', avatar: 'https://images.unsplash.com/photo-1758686253859-8ef7e940096e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', isGoodMatch: false, status: 'going' },
  { id: '13', name: 'Olivia Foster', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', isGoodMatch: false, status: 'maybe' },
  { id: '14', name: 'Tyler Nguyen', avatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', isGoodMatch: false, status: 'maybe' },
];

const MUTUAL_CONNECTIONS = [
  { id: '7', name: 'Alex Kim', avatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', mutualFriends: 12 },
  { id: '8', name: 'Sophie Turner', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', mutualFriends: 8 },
  { id: '9', name: 'Marcus Johnson', avatar: 'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', mutualFriends: 5 },
  { id: '10', name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', mutualFriends: 15 },
  { id: '11', name: 'Ryan Martinez', avatar: 'https://images.unsplash.com/photo-1758686253859-8ef7e940096e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', mutualFriends: 3 },
  { id: '12', name: 'Nina Williams', avatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200', mutualFriends: 9 },
];

const GROUP_CHATS = [
  { id: '1', name: 'University of Washington Students', memberCount: 234, icon: '🎓', description: 'Current and former UW students going to the show', isVerified: true },
  { id: '2', name: 'OG Ed Sheeran Fans', memberCount: 567, icon: '🎸', description: 'Been listening since the + album days', isVerified: false },
  { id: '3', name: '50+ Fans', memberCount: 89, icon: '🌟', description: 'Mature fans who love great music', isVerified: false },
  { id: '4', name: 'Seattle Concert Meetup', memberCount: 412, icon: '🌆', description: 'Local Seattle fans coordinating meetups', isVerified: false },
  { id: '5', name: 'First Timers', memberCount: 178, icon: '🎉', description: 'Going to your first Ed Sheeran concert?', isVerified: false },
  { id: '6', name: 'Photography Enthusiasts', memberCount: 145, icon: '📸', description: 'Share tips for capturing the best moments', isVerified: false },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TagBadge({ label, variant }) {
  const bg =
    variant === 'purple'
      ? '#7300ff'
      : variant === 'teal'
      ? '#00ac9b'
      : 'rgba(255,255,255,0.9)';
  const color = variant === 'outline' ? '#101828' : '#fff';
  const border = variant === 'outline' ? '#e5e7eb' : bg;

  return (
    <View style={[s.tagBadge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[s.tagBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

function MutualPersonCard({ person }) {
  const firstName = person.name.split(' ')[0];
  return (
    <View style={s.mutualPerson}>
      <Avatar uri={person.avatar} name={person.name} size={44} style={{ borderWidth: 0 }} />
      <Text style={s.mutualName} numberOfLines={1}>{firstName}</Text>
      <Text style={s.mutualCount}>{person.mutualFriends} mutual</Text>
    </View>
  );
}

function AttendeeCard({ attendee }) {
  if (attendee.isGoodMatch) {
    return (
      <View style={[s.attendeeCard, s.attendeeCardMatch]}>
        <View style={s.attendeeAvatarWrap}>
          <Avatar uri={attendee.avatar} name={attendee.name} size={44} style={{ borderWidth: 0 }} />
          <View style={s.sparkBadge}>
            <Feather name="zap" size={10} color="#fff" />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.attendeeName} numberOfLines={1}>{attendee.name}</Text>
          <Text style={s.attendeeSub}>94% Match</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.attendeeCardCompact, attendee.status === 'maybe' && s.attendeeCardMaybe]}>
      <Avatar uri={attendee.avatar} name={attendee.name} size={34} style={{ borderWidth: 0 }} />
      <Text style={s.attendeeNameCompact} numberOfLines={1}>{attendee.name}</Text>
      {attendee.status === 'maybe' && (
        <Text style={s.attendeeMaybeLabel}>Maybe</Text>
      )}
    </View>
  );
}

function GroupChatRow({ group, onPress }) {
  const isHighlighted = group.isVerified;
  return (
    <TouchableOpacity
      style={[s.groupRow, isHighlighted && s.groupRowHighlight]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={s.groupIcon}>
        <Text style={s.groupIconText}>{group.icon}</Text>
      </LinearGradient>

      <View style={s.groupInfo}>
        <View style={s.groupNameRow}>
          <Text style={s.groupName} numberOfLines={1}>{group.name}</Text>
          {isHighlighted && (
            <Badge
              label="Verified UW Students"
              style={{ backgroundColor: '#7300ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}
              textStyle={{ fontSize: 9 }}
            />
          )}
        </View>
        <Text style={s.groupDesc} numberOfLines={1}>{group.description}</Text>
      </View>

      <View style={s.groupMemberRow}>
        <Feather name="users" size={12} color="#4a5565" />
        <Text style={s.groupMemberCount}>{group.memberCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function EventDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [isStarred, setIsStarred] = useState(false);
  // route.params?.eventId reserved for future Supabase lookup
  const event = EVENT;

  return (
    <View style={s.root}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Header bar */}
      <View style={[s.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backRow}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsStarred((prev) => !prev)}
          style={s.starBtn}
        >
          <Feather
            name="star"
            size={20}
            color={isStarred ? '#fbbf24' : 'rgba(255,255,255,0.9)'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* White card wrapper */}
        <View style={s.outerCard}>
          {/* Banner */}
          <View style={s.banner}>
            <Image source={{ uri: event.bannerImage }} style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(201,194,244,0.4)', 'rgba(201,194,244,0.95)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.bannerContent}>
              <Text style={s.bannerTitle}>{event.title}</Text>
              <Text style={s.bannerVenue}>@ {event.venue}</Text>
            </View>
          </View>

          {/* Content area */}
          <View style={s.body}>
            {/* Date & time */}
            <View style={s.dateRow}>
              <View style={s.dateItem}>
                <Feather name="calendar" size={18} color="#7300ff" />
                <Text style={s.dateText}>{event.date}</Text>
              </View>
              <View style={s.dateItem}>
                <Feather name="clock" size={18} color="#7300ff" />
                <Text style={s.dateText}>{event.time}</Text>
              </View>
            </View>

            {/* Tags */}
            <View style={s.tagsRow}>
              {event.tags.map((tag, i) => (
                <TagBadge key={i} label={tag.label} variant={tag.variant} />
              ))}
            </View>

            {/* Ticketmaster */}
            <LinearGradient colors={['#026cdf', '#0054a6']} style={s.ticketCard}>
              <View style={s.ticketHeader}>
                <View>
                  <Text style={s.ticketTitle}>Get Your Tickets</Text>
                  <Text style={s.ticketSub}>Starting from {event.tickets.startingPrice} + fees</Text>
                </View>
                <Feather name="external-link" size={20} color="#fff" />
              </View>
              <View style={s.tierRow}>
                {event.tickets.tiers.map((tier, i) => (
                  <View key={i} style={s.tierBox}>
                    <Text style={s.tierLabel}>{tier.label}</Text>
                    <Text style={s.tierPrice}>{tier.price}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={s.ticketBtn}
                activeOpacity={0.8}
                onPress={() => Linking.openURL(event.tickets.url)}
              >
                <Text style={s.ticketBtnText}>View on Ticketmaster</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Most Popular Song */}
            <Card>
              <View style={s.songRow}>
                <View style={s.songIcon}>
                  <Feather name="music" size={22} color="#9810FA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.songLabel}>Most popular song</Text>
                  <Text style={s.songTitle}>{event.popularSong.title}</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(event.popularSong.searchUrl)}>
                    <Text style={s.songAlbum}>{event.popularSong.album}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={s.voteBtn} activeOpacity={0.8}>
                  <Text style={s.voteBtnText}>Vote</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* People You May Know */}
            <Card>
              <Text style={s.cardTitle}>People you may know</Text>
              <FlatList
                data={MUTUAL_CONNECTIONS}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 16 }}
                renderItem={({ item }) => <MutualPersonCard person={item} />}
              />
            </Card>

            {/* Who's Going */}
            <Card>
              <View style={s.goingHeader}>
                <Text style={s.cardTitle}>Who's Going</Text>
                <Text style={s.goingCount}>{event.attendeeCount.toLocaleString()} attendees</Text>
              </View>
              <View style={s.attendeeGrid}>
                {ATTENDEES.map((a) => (
                  <AttendeeCard key={a.id} attendee={a} />
                ))}
              </View>
              <TouchableOpacity style={s.seeAllBtn} activeOpacity={0.7}>
                <Text style={s.seeAllText}>See all attendees</Text>
              </TouchableOpacity>
            </Card>

            {/* Group Chats */}
            <Card style={{ marginBottom: 0 }}>
              <View style={s.groupHeader}>
                <Feather name="message-circle" size={18} color="#9810FA" />
                <Text style={[s.cardTitle, { marginBottom: 0 }]}>Group Chats</Text>
              </View>
              <Text style={s.groupSubtext}>Connect with other fans attending the event</Text>
              {GROUP_CHATS.map((group) => (
                <GroupChatRow
                  key={group.id}
                  group={group}
                  onPress={() => navigation.navigate('GroupChat', { groupId: group.id })}
                />
              ))}
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const CARD_HORIZONTAL = 16;

const s = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 56,
  },
  starBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Outer card
  outerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: 'rgba(249,250,251,0.92)',
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Banner
  banner: {
    height: 320,
    overflow: 'hidden',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 52,
    fontFamily: fonts.bold,
    lineHeight: 56,
  },
  bannerVenue: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 22,
    fontFamily: fonts.semiBold,
    marginTop: 4,
  },

  // Body
  body: {
    padding: CARD_HORIZONTAL,
    backgroundColor: '#f9fafb',
  },

  // Date row
  dateRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 14,
    paddingTop: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: '#101828',
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagBadgeText: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },

  // Ticketmaster
  ticketCard: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ticketTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginBottom: 4,
  },
  ticketSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  tierRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tierBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tierLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontFamily: fonts.regular,
    marginBottom: 2,
  },
  tierPrice: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  ticketBtn: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  ticketBtnText: {
    color: '#026cdf',
    fontSize: 15,
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
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 12,
  },

  // Popular song
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  songIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  songLabel: {
    color: '#4a5565',
    fontSize: 13,
    fontFamily: fonts.regular,
    marginBottom: 2,
  },
  songTitle: {
    color: '#101828',
    fontSize: 17,
    fontFamily: fonts.semiBold,
  },
  songAlbum: {
    color: '#4a5565',
    fontSize: 15,
    fontFamily: fonts.regular,
    textDecorationLine: 'underline',
  },
  voteBtn: {
    backgroundColor: '#00ac9b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  voteBtnText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fonts.medium,
  },

  // People you may know
  mutualPerson: {
    alignItems: 'center',
    width: 64,
  },
  mutualName: {
    color: '#101828',
    fontSize: 12,
    fontFamily: fonts.medium,
    marginTop: 6,
    textAlign: 'center',
  },
  mutualCount: {
    color: '#4a5565',
    fontSize: 10,
    fontFamily: fonts.regular,
    marginTop: 1,
  },

  // Who's Going
  goingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goingCount: {
    color: '#4a5565',
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  attendeeGrid: {
    gap: 8,
  },
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
  },
  attendeeCardMatch: {
    borderWidth: 2,
    borderColor: '#7300ff',
    backgroundColor: '#f8f3ff',
  },
  attendeeCardCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  attendeeCardMaybe: {
    opacity: 0.6,
  },
  attendeeAvatarWrap: {
    position: 'relative',
  },
  sparkBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#00ac9b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeName: {
    color: '#101828',
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  attendeeNameCompact: {
    color: '#101828',
    fontSize: 13,
    fontFamily: fonts.medium,
    flex: 1,
  },
  attendeeSub: {
    color: '#4a5565',
    fontSize: 11,
    fontFamily: fonts.regular,
    marginTop: 1,
  },
  attendeeMaybeLabel: {
    color: '#4a5565',
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  seeAllBtn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  seeAllText: {
    color: '#9810FA',
    fontSize: 14,
    fontFamily: fonts.medium,
  },

  // Group chats
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  groupSubtext: {
    color: '#4a5565',
    fontSize: 13,
    fontFamily: fonts.regular,
    marginBottom: 14,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
    gap: 12,
  },
  groupRowHighlight: {
    borderColor: '#7300ff',
    backgroundColor: '#f8f3ff',
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIconText: {
    fontSize: 20,
  },
  groupInfo: {
    flex: 1,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 3,
  },
  groupName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#101828',
    flexShrink: 1,
  },
  groupDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },
  groupMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupMemberCount: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#4a5565',
  },
});
