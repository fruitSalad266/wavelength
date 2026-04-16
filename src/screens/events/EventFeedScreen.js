import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useEvents } from '../../hooks/useEvents';
import { useMyRSVPs } from '../../hooks/useRSVP';
import { useRecommendedEvents } from '../../hooks/useRecommendedEvents';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { EventImage } from '../../components/EventImage';
import { fonts } from '../../theme/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.6;

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function RecommendedEventCard({ event, friendsGoing, matchingInterests, onPress, isStarred }) {
  const reasonText = (() => {
    if (friendsGoing.length > 0) {
      const names = friendsGoing.slice(0, 2).map((f) => f.name?.split(' ')[0]).filter(Boolean);
      if (friendsGoing.length === 1) return `${names[0]} is going`;
      if (friendsGoing.length === 2) return `${names[0]} & ${names[1]} are going`;
      return `${names[0]}, ${names[1]} +${friendsGoing.length - 2} going`;
    }
    if (matchingInterests.length > 0) {
      return `Because you like ${matchingInterests[0]}`;
    }
    return null;
  })();

  return (
    <TouchableOpacity style={styles.friendCard} activeOpacity={0.85} onPress={onPress}>
      <EventImage uri={event.backgroundImage} source={event.source} style={styles.friendCardImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.friendCardOverlay} />

      <View style={styles.friendCardTop}>
        <Badge label={event.category} />
        {isStarred && <Ionicons name="star" size={16} color="#fbbf24" />}
      </View>

      <View style={styles.friendCardBottom}>
        {friendsGoing.length > 0 && (
          <View style={styles.avatarRow}>
            {friendsGoing.slice(0, 4).map((friend, index) => (
              <Avatar
                key={friend.id || index}
                uri={friend.avatar}
                name={friend.name}
                size={26}
                style={{ marginLeft: index > 0 ? -8 : 0, borderWidth: 1.5, borderColor: '#fff' }}
              />
            ))}
          </View>
        )}
        <Text style={styles.friendCardTitle}>{event.title}</Text>
        {!!reasonText && (
          <View style={styles.metaRow}>
            <Feather
              name={friendsGoing.length > 0 ? 'users' : 'heart'}
              size={13}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.metaText}>{reasonText}</Text>
          </View>
        )}
        <View style={styles.metaRow}>
          <Feather name="calendar" size={13} color="rgba(255,255,255,0.9)" />
          <Text style={styles.metaText}>{formatDate(event.date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EventCard({ event, onPress, isStarred }) {
  return (
    <TouchableOpacity style={styles.eventCard} activeOpacity={0.85} onPress={onPress}>
      <EventImage uri={event.backgroundImage} source={event.source} style={styles.eventCardImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.eventCardOverlay} />

      <View style={styles.eventCardContent}>
        <View style={styles.eventCardTopRow}>
          <Badge label={event.category} />
          {isStarred && (
            <Ionicons name="star" size={16} color="#fbbf24" />
          )}
        </View>
        <View style={{ flex: 1 }} />
        <Text style={styles.eventCardTitle}>{event.title}</Text>
        <View style={styles.eventMeta}>
          <View style={styles.metaRow}>
            <Feather name="calendar" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.metaText}>
              {formatDate(event.date)} • {event.time}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Feather name="users" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.metaText}>{event.attendees} attending</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SmallEventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={styles.smallCard} activeOpacity={0.85} onPress={onPress}>
      <EventImage uri={event.backgroundImage} source={event.source} style={styles.smallCardImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.smallCardOverlay} />
      <View style={styles.smallCardContent}>
        <Ionicons name="star" size={12} color="#fbbf24" style={styles.smallCardStar} />
        <Text style={styles.smallCardTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.smallCardDate}>{formatDate(event.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

function getLocalToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function EventFeedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { events: supabaseEvents, loading } = useEvents();
  const { goingEventIds, starredEventIds, refresh: refreshRSVPs } = useMyRSVPs();
  const { recommendations, refresh: refreshRecommendations } = useRecommendedEvents({ limit: 5 });

  // Refresh RSVP data whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshRSVPs();
      refreshRecommendations();
    }, [refreshRSVPs, refreshRecommendations])
  );

  const today = getLocalToday();

  // Today and future events
  const futureEvents = useMemo(
    () => supabaseEvents.filter((e) => e.date >= today),
    [supabaseEvents, today]
  );

  // Events user is going to (future only, chronological)
  const goingEvents = useMemo(
    () => futureEvents.filter((e) => goingEventIds.includes(e.id)).sort((a, b) => a.date.localeCompare(b.date)),
    [futureEvents, goingEventIds]
  );

  // Saved/starred events (future only)
  const savedEvents = useMemo(() => {
    const ids = new Set([...starredEventIds, ...goingEventIds]);
    return futureEvents.filter((e) => ids.has(e.id));
  }, [futureEvents, starredEventIds, goingEventIds]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#6610f2', '#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={['#7300ff', '#00ac9b']} style={styles.logoBox}>
              <Image source={require('../../../assets/splash-icon.png')} style={styles.logoImage} />
            </LinearGradient>
            <Text style={styles.headerTitle}>Wavelength</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Feather name="bell" size={20} color="#fff" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.welcomeTitle}>Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!</Text>
          <Text style={styles.welcomeSub}>Discover amazing events happening around you</Text>
        </View>

        {/* Saved Events */}
        {savedEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved Events</Text>
              <TouchableOpacity
                style={styles.viewAllBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('SavedEvents')}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={savedEvents.slice(0, 6)}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <SmallEventCard
                  event={item}
                  onPress={() => navigation.navigate('EventDetail', { event: item })}
                />
              )}
            />
          </View>
        )}

        {/* Your Events */}
        {goingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Events</Text>
              <TouchableOpacity
                style={styles.viewAllBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('YourEvents')}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
            {goingEvents.slice(0, 2).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.yourEventCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('EventDetail', { event: item })}
              >
                <EventImage uri={item.backgroundImage} source={item.source} style={styles.yourEventImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.yourEventOverlay} />
                <View style={styles.yourEventContent}>
                  <Text style={styles.yourEventTitle}>{item.title}</Text>
                  <View style={styles.metaRow}>
                    <Feather name="calendar" size={13} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.metaText}>{formatDate(item.date)} • {item.time}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Feather name="map-pin" size={13} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recommended for you */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <Text style={styles.sectionSub}>Based on your interests and what friends are up to</Text>
            {recommendations.map(({ event, friendsGoing, matchingInterests }) => (
              <RecommendedEventCard
                key={event.id}
                event={event}
                friendsGoing={friendsGoing}
                matchingInterests={matchingInterests}
                isStarred={starredEventIds.includes(event.id)}
                onPress={() => navigation.navigate('EventDetail', { event })}
              />
            ))}
          </View>
        )}

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.upcomingTitle}>Upcoming Events</Text>
          <Text style={styles.upcomingSub}>Find events happening near you</Text>
        </View>

        {futureEvents.slice(0, 3).map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isStarred={starredEventIds.includes(event.id)}
            onPress={() => navigation.navigate('EventDetail', { event })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoImage: { width: 40, height: 40, resizeMode: 'contain', tintColor: '#fff' },
  headerTitle: { color: '#fff', fontSize: 22, fontFamily: fonts.regular, letterSpacing: 0.5 },
  notifBtn: { position: 'relative', padding: 8 },
  notifDot: {
    position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#7300ff',
  },
  scrollContent: { paddingHorizontal: 20 },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: '#fff', fontSize: 20, fontFamily: fonts.semiBold, marginBottom: 4 },
  sectionSub: { color: '#c4dcff', fontSize: 13, fontFamily: fonts.regular, marginBottom: 10 },
  welcomeTitle: { color: '#fff', fontSize: 30, fontFamily: fonts.semiBold, marginBottom: 6 },
  welcomeSub: { color: '#c4dcff', fontSize: 16, fontFamily: fonts.regular },
  horizontalList: { gap: 14, paddingRight: 20 },
  yourEventCard: { height: 140, borderRadius: 14, overflow: 'hidden', marginBottom: 10 },
  yourEventImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  yourEventOverlay: { ...StyleSheet.absoluteFillObject },
  yourEventContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, gap: 4 },
  yourEventTitle: { color: '#fff', fontSize: 17, fontFamily: fonts.semiBold, marginBottom: 2 },
  friendCard: { height: 190, borderRadius: 14, overflow: 'hidden', marginTop: 12 },
  friendCardImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  friendCardOverlay: { ...StyleSheet.absoluteFillObject },
  friendCardTop: {
    position: 'absolute', top: 14, left: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  avatarRow: { flexDirection: 'row', marginBottom: 8 },
  friendCardBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
  friendCardTitle: { color: '#fff', fontSize: 18, fontFamily: fonts.semiBold, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontFamily: fonts.regular },
  metaTextSmall: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontFamily: fonts.regular, marginTop: 2 },
  upcomingTitle: { color: '#fff', fontSize: 26, fontFamily: fonts.semiBold, marginBottom: 4 },
  upcomingSub: { color: '#c4dcff', fontSize: 15, fontFamily: fonts.regular },
  eventCard: { height: 240, borderRadius: 14, overflow: 'hidden', marginTop: 16, marginHorizontal: 0 },
  eventCardImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  eventCardOverlay: { ...StyleSheet.absoluteFillObject },
  eventCardContent: { ...StyleSheet.absoluteFillObject, padding: 18, justifyContent: 'space-between' },
  eventCardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventCardTitle: { color: '#fff', fontSize: 22, fontFamily: fonts.semiBold, marginBottom: 10 },
  eventMeta: { gap: 4 },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  smallCard: {
    width: CARD_WIDTH * 0.75,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
  },
  smallCardImage: { resizeMode: 'cover' },
  smallCardOverlay: { ...StyleSheet.absoluteFillObject },
  smallCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  smallCardStar: {
    marginBottom: 4,
  },
  smallCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.semiBold,
    marginBottom: 2,
  },
  smallCardDate: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontFamily: fonts.regular,
  },
});
