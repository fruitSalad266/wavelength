import React, { useState } from 'react';
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
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockEvents } from '../data/mockEvents';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { fonts } from '../theme/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.6;
const RECENT_CARD_WIDTH = SCREEN_WIDTH * 0.58;

const categories = ['All', 'Music', 'Art', 'Food', 'Sports', 'Networking', 'Technology'];

const recentlyHappening = [
  {
    id: 'recent-1',
    title: 'Live Jazz Night',
    time: 'Happening now',
    image:
      'https://images.unsplash.com/photo-1611810293387-c8afe03cd7dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
  {
    id: 'recent-2',
    title: 'Food Truck Rally',
    time: 'Happening now',
    image:
      'https://images.unsplash.com/photo-1524584830732-b69165ddba9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
  {
    id: 'recent-3',
    title: 'Art Walk Downtown',
    time: 'Happening now',
    image:
      'https://images.unsplash.com/photo-1713779490284-a81ff6a8ffae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
];

const friendsAttending = [
  {
    eventId: '1',
    event: mockEvents[0],
    friends: [
      { name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1575454211631-f5aba648b97d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
      { name: 'Mike', avatar: 'https://images.unsplash.com/photo-1724602048497-ecb722b13034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
      { name: 'Emma', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
    ],
  },
  {
    eventId: '3',
    event: mockEvents[2],
    friends: [
      { name: 'Lisa', avatar: 'https://images.unsplash.com/photo-1643816831186-b2427a8f9f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
      { name: 'James', avatar: 'https://images.unsplash.com/photo-1760574740271-55e6683afe76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
    ],
  },
];

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

function FriendEventCard({ event, friends, onPress }) {
  return (
    <TouchableOpacity style={styles.friendCard} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: event.backgroundImage }} style={styles.friendCardImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.friendCardOverlay} />

      <View style={styles.friendCardTop}>
        <Badge label={event.category} />
        <View style={styles.avatarRow}>
          {friends.map((friend, index) => (
            <Avatar
              key={index}
              uri={friend.avatar}
              name={friend.name}
              size={28}
              style={{ marginLeft: index > 0 ? -8 : 0 }}
            />
          ))}
        </View>
      </View>

      <View style={styles.friendCardBottom}>
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

function EventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={styles.eventCard} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: event.backgroundImage }} style={styles.eventCardImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.eventCardOverlay} />

      <View style={styles.eventCardContent}>
        <Badge label={event.category} />
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
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredEvents =
    selectedCategory === 'All'
      ? mockEvents
      : mockEvents.filter((e) => e.category === selectedCategory);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#6610f2', '#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={['#7300ff', '#00ac9b']} style={styles.logoBox}>
              <Text style={styles.logoText}>W</Text>
            </LinearGradient>
            <Text style={styles.headerTitle}>Wavelength</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Feather name="user" size={16} color="#fff" />
            <Text style={styles.profileBtnText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.section}>
          <Text style={styles.welcomeTitle}>Welcome back, Alex!</Text>
          <Text style={styles.welcomeSub}>Discover amazing events happening around you</Text>
        </View>

        {/* Recently Happening */}
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

        {/* Friends Attending */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events Your Friends Are Attending</Text>
          {friendsAttending.map(({ event, friends }) => (
            <FriendEventCard
              key={event.id}
              event={event}
              friends={friends}
              onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
            />
          ))}
        </View>

        {/* Category Filters */}
        <View style={styles.section}>
          <View style={styles.filterHeader}>
            <Feather name="filter" size={18} color="#fff" />
            <Text style={styles.sectionTitle}>Filter Events</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.upcomingTitle}>Upcoming Events</Text>
          <Text style={styles.upcomingSub}>Find events happening near you</Text>
        </View>

        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
          />
        ))}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.5,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00ac9b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.medium,
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  // Sections
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: fonts.semiBold,
    marginBottom: 4,
  },

  // Welcome
  welcomeTitle: {
    color: '#fff',
    fontSize: 30,
    fontFamily: fonts.semiBold,
    marginBottom: 6,
  },
  welcomeSub: {
    color: '#c4dcff',
    fontSize: 16,
    fontFamily: fonts.regular,
  },

  // Recently Happening
  horizontalList: {
    gap: 14,
    paddingRight: 20,
  },
  recentCard: {
    width: RECENT_CARD_WIDTH,
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
  },
  recentImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  recentOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  recentContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  liveText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  recentTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },

  // Friends Attending
  friendCard: {
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 12,
  },
  friendCardImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  friendCardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  friendCardTop: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
  },
  friendCardBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  friendCardTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginBottom: 8,
  },

  // Shared meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontFamily: fonts.regular,
  },

  // Category Filters
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryRow: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryPillActive: {
    backgroundColor: '#fff',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  categoryTextActive: {
    color: '#7300ff',
  },

  // Upcoming Events
  upcomingTitle: {
    color: '#fff',
    fontSize: 26,
    fontFamily: fonts.semiBold,
    marginBottom: 4,
  },
  upcomingSub: {
    color: '#c4dcff',
    fontSize: 15,
    fontFamily: fonts.regular,
  },

  // Event Card
  eventCard: {
    height: 240,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 16,
    marginHorizontal: 0,
  },
  eventCardImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  eventCardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  eventCardContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 18,
    justifyContent: 'space-between',
  },
  eventCardTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: fonts.semiBold,
    marginBottom: 10,
  },
  eventMeta: {
    gap: 4,
  },
});
