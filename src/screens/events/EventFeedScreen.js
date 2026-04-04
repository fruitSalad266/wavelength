import React from 'react';
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
import { GOING_EVENT_IDS } from '../../data/mockEvents';
import { STARRED_EVENT_IDS, recentlyHappening, friendsAttending } from '../../data/mockEventFeed';
import { useEvents } from '../../hooks/useEvents';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { fonts } from '../../theme/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.6;
const RECENT_CARD_WIDTH = SCREEN_WIDTH * 0.58;

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function RecentCard({ item }) {
  return (
    <View style={styles.recentCard}>
      <Image source={{ uri: item.image }} style={styles.recentImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.recentOverlay} />
      <View style={styles.recentContent}>
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{item.time}</Text>
        </View>
        <Text style={styles.recentTitle}>{item.title}</Text>
      </View>
    </View>
  );
}

function FriendEventCard({ event, friends, onPress, isStarred }) {
  return (
    <TouchableOpacity style={styles.friendCard} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: event.backgroundImage }} style={styles.friendCardImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.friendCardOverlay} />

      <View style={styles.friendCardTop}>
        <Badge label={event.category} />
        {isStarred && (
          <Ionicons name="star" size={16} color="#fbbf24" />
        )}
      </View>

      <View style={styles.friendCardBottom}>
        <View style={styles.avatarRow}>
          {friends.map((friend, index) => (
            <Avatar
              key={index}
              uri={friend.avatar}
              name={friend.name}
              size={26}
              style={{ marginLeft: index > 0 ? -8 : 0, borderWidth: 1.5, borderColor: '#fff' }}
            />
          ))}
        </View>
        <Text style={styles.friendCardTitle}>{event.title}</Text>
        <View style={styles.metaRow}>
          <Feather name="calendar" size={13} color="rgba(255,255,255,0.9)" />
          <Text style={styles.metaText}>{formatDate(event.date)}</Text>
          <Feather name="users" size={13} color="rgba(255,255,255,0.9)" style={{ marginLeft: 12 }} />
          <Text style={styles.metaText}>
            {friends.length} friend{friends.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EventCard({ event, onPress, isStarred }) {
  return (
    <TouchableOpacity style={styles.eventCard} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: event.backgroundImage }} style={styles.eventCardImage} />
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

export default function EventFeedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { events: supabaseEvents, loading } = useEvents();
  const goingEvents = supabaseEvents.filter((e) => GOING_EVENT_IDS.includes(e.id));

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
          <Text style={styles.welcomeTitle}>Welcome back, Alex!</Text>
          <Text style={styles.welcomeSub}>Discover amazing events happening around you</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Happening</Text>
            <Badge label="Live Now" />
          </View>
          <FlatList
            data={recentlyHappening}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => <RecentCard item={item} />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events Your Friends Are Attending</Text>
          {friendsAttending.map(({ event, friends }) => (
            <FriendEventCard
              key={event.id}
              event={event}
              friends={friends}
              isStarred={STARRED_EVENT_IDS.includes(event.id)}
              onPress={() => navigation.navigate('EventDetail', { event })}
            />
          ))}
        </View>

        {goingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>You’re Going</Text>
            </View>
            <FlatList
              data={goingEvents}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <View style={styles.recentCard}>
                  <Image source={{ uri: item.backgroundImage }} style={styles.recentImage} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.recentOverlay} />
                  <View style={styles.recentContent}>
                    <Text style={styles.recentTitle}>{item.title}</Text>
                    <Text style={styles.metaTextSmall}>
                      {formatDate(item.date)} • {item.time}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('EventDetail', { event: item })}
                  />
                </View>
              )}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.upcomingTitle}>Upcoming Events</Text>
          <Text style={styles.upcomingSub}>Find events happening near you</Text>
        </View>

        {supabaseEvents.slice(0, 3).map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isStarred={STARRED_EVENT_IDS.includes(event.id)}
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
  welcomeTitle: { color: '#fff', fontSize: 30, fontFamily: fonts.semiBold, marginBottom: 6 },
  welcomeSub: { color: '#c4dcff', fontSize: 16, fontFamily: fonts.regular },
  horizontalList: { gap: 14, paddingRight: 20 },
  recentCard: { width: RECENT_CARD_WIDTH, height: 140, borderRadius: 14, overflow: 'hidden' },
  recentImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  recentOverlay: { ...StyleSheet.absoluteFillObject },
  recentContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  liveText: { color: '#fff', fontSize: 11, fontFamily: fonts.medium },
  recentTitle: { color: '#fff', fontSize: 16, fontFamily: fonts.semiBold },
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
});
