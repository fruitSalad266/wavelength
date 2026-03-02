import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockEvents } from '../data/mockEvents';
import { Badge } from '../components/Badge';
import { fonts } from '../theme/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const categories = ['All', 'UW', 'Music', 'Art', 'Food', 'Sports', 'Networking', 'Technology'];

const STARRED_EVENT_IDS = ['1', '3'];

const UW_EVENTS = [
  {
    id: 'uw-1',
    title: 'IFC Spring Rush 2026',
    date: '2026-03-15',
    time: '6:00 PM',
    location: 'UW Greek Row, Seattle',
    attendees: 420,
    category: 'UW',
    backgroundImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    uwOnly: true,
  },
  {
    id: 'uw-2',
    title: 'UW Career Fair — Spring 2026',
    date: '2026-04-02',
    time: '10:00 AM',
    location: 'HUB Ballroom, UW Campus',
    attendees: 1500,
    category: 'UW',
    backgroundImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    uwOnly: true,
  },
  {
    id: 'uw-3',
    title: 'Tech Industry Networking Night',
    date: '2026-03-20',
    time: '5:30 PM',
    location: 'Paul G. Allen Center, UW',
    attendees: 280,
    category: 'UW',
    backgroundImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    uwOnly: true,
  },
  {
    id: 'uw-4',
    title: 'Prof. Amy Zhang — AI Ethics Talk',
    date: '2026-03-25',
    time: '3:00 PM',
    location: 'Kane Hall, UW Campus',
    attendees: 350,
    category: 'UW',
    backgroundImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    uwOnly: true,
  },
  {
    id: 'uw-5',
    title: 'Dubstech General Meeting',
    date: '2026-03-18',
    time: '6:30 PM',
    location: 'Sieg Hall 134, UW',
    attendees: 95,
    category: 'UW',
    backgroundImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    uwOnly: true,
  },
  {
    id: 'uw-6',
    title: 'HuskyHacks 2026',
    date: '2026-04-12',
    time: '9:00 AM',
    location: 'HUB, UW Campus',
    attendees: 600,
    category: 'UW',
    backgroundImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    uwOnly: true,
  },
];

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function LargeEventCard({ event, onPress, isStarred }) {
  return (
    <TouchableOpacity style={s.eventCard} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: event.backgroundImage }} style={s.eventCardImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={s.eventCardOverlay} />

      <View style={s.eventCardContent}>
        <View style={s.eventCardTopRow}>
          <View style={s.badgeRow}>
            <Badge label={event.category} />
            {event.uwOnly && (
              <View style={s.uwOnlyChip}>
                <Feather name="check-circle" size={11} color="#7300ff" />
                <Text style={s.uwOnlyText}>Verified UW Students</Text>
              </View>
            )}
          </View>
          {isStarred && (
            <Ionicons name="star" size={16} color="#fbbf24" />
          )}
        </View>
        <View style={{ flex: 1 }} />
        <Text style={s.eventCardTitle}>{event.title}</Text>
        <View style={s.eventMeta}>
          <View style={s.metaRow}>
            <Feather name="calendar" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={s.metaText}>
              {formatDate(event.date)} • {event.time}
            </Text>
          </View>
          <View style={s.metaRow}>
            <Feather name="map-pin" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={s.metaText}>{event.location}</Text>
          </View>
          <View style={s.metaRow}>
            <Feather name="users" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={s.metaText}>{event.attendees} attending</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function EventsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const allEvents = [...mockEvents, ...UW_EVENTS];
  const filteredEvents =
    selectedCategory === 'All'
      ? allEvents
      : allEvents.filter((e) => e.category === selectedCategory);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#6610f2', '#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <Text style={s.headerTitle}>Events</Text>
          <View style={s.headerRight}>
            <TouchableOpacity style={s.searchBtn}>
              <Feather name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoryRow}
          style={{ marginTop: 16 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[s.categoryPill, selectedCategory === cat && s.categoryPillActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[s.categoryText, selectedCategory === cat && s.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={s.resultCount}>{filteredEvents.length} events found</Text>

        {filteredEvents.map((event) => (
          <LargeEventCard
            key={event.id}
            event={event}
            isStarred={STARRED_EVENT_IDS.includes(event.id)}
            onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
          />
        ))}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  categoryRow: {
    gap: 8,
    paddingRight: 20,
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

  resultCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: fonts.regular,
    marginTop: 16,
    marginBottom: 4,
  },

  eventCard: {
    height: 260,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 16,
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
  eventCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  uwOnlyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFE0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7300ff',
  },
  uwOnlyText: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    color: '#7300ff',
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
});
