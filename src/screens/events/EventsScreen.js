import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents } from '../../hooks/useEvents';
import { useMyRSVPs } from '../../hooks/useRSVP';
import { Badge } from '../../components/Badge';
import { EventImage } from '../../components/EventImage';
import { fonts } from '../../theme/fonts';

const categories = ['All', 'UW', 'Music', 'Art', 'Food', 'Sports', 'Networking', 'Technology'];

const whenFilters = [
  { key: 'today', label: 'Today' },
  { key: 'thisWeek', label: 'This week' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'weekend', label: 'Weekend' },
  { key: 'evening', label: 'Evening' },
];

const moreFilters = [
  { key: 'free', label: 'Free' },
  { key: 'budget', label: 'Under $25' },
  { key: 'popular', label: 'Popular' },
  { key: 'intimate', label: 'Intimate' },
  { key: 'tickets', label: 'Tickets' },
  { key: 'saved', label: 'Saved' },
];

/** @returns {number|null} minutes from midnight, or null if unparseable */
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

function isWeekendDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDay();
  return day === 0 || day === 6;
}

function isSameCalendarMonth(dateStr, ref) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
}

/** Cheapest listed price, or null if unknown */
function cheapestListedPrice(event) {
  const a = event.priceMin;
  const b = event.priceMax;
  if (a == null && b == null) return null;
  if (a == null) return b;
  if (b == null) return a;
  return Math.min(a, b);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const LargeEventCard = React.memo(function LargeEventCard({ event, onPress, isStarred }) {
  return (
    <TouchableOpacity style={s.eventCard} activeOpacity={0.85} onPress={onPress}>
      <EventImage uri={event.backgroundImage} source={event.source} style={s.eventCardImage} />
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
});

export default function EventsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedQuickFilters, setSelectedQuickFilters] = useState([]);
  const { events: supabaseEvents, loading } = useEvents();
  const { starredEventIds } = useMyRSVPs();

  const toggleQuickFilter = useCallback((filterKey) => {
    setSelectedQuickFilters((prev) => (
      prev.includes(filterKey)
        ? prev.filter((key) => key !== filterKey)
        : [...prev, filterKey]
    ));
  }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    return supabaseEvents.filter((event) => {
      if (selectedCategory !== 'All' && event.category !== selectedCategory) {
        return false;
      }

      for (const filterKey of selectedQuickFilters) {
        if (filterKey === 'today') {
          const eventDate = new Date(`${event.date}T00:00:00`);
          if (eventDate.toDateString() !== now.toDateString()) return false;
        }

        if (filterKey === 'thisWeek') {
          const eventDate = new Date(`${event.date}T00:00:00`);
          if (eventDate < now || eventDate > endOfWeek) return false;
        }

        if (filterKey === 'thisMonth') {
          if (!isSameCalendarMonth(event.date, now)) return false;
        }

        if (filterKey === 'weekend') {
          if (!isWeekendDate(event.date)) return false;
        }

        if (filterKey === 'evening') {
          const mins = parseTimeToMinutes(event.time);
          if (mins == null || mins < 17 * 60) return false;
        }

        if (filterKey === 'free') {
          if ((event.priceMin ?? 0) > 0) return false;
        }

        if (filterKey === 'budget') {
          const p = cheapestListedPrice(event);
          if (p == null || p > 25) return false;
        }

        if (filterKey === 'popular') {
          if ((event.attendees ?? 0) < 50) return false;
        }

        if (filterKey === 'intimate') {
          if ((event.attendees ?? 0) >= 50) return false;
        }

        if (filterKey === 'tickets') {
          if (!event.ticketUrl) return false;
        }

        if (filterKey === 'saved') {
          if (!starredEventIds.includes(event.id)) return false;
        }
      }

      return true;
    });
  }, [supabaseEvents, selectedCategory, selectedQuickFilters, starredEventIds]);

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

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews
        ListHeaderComponent={
          <>
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
            <Text style={s.filterSectionTitle}>When</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.quickFilterRow}
              style={{ marginTop: 8 }}
            >
              {whenFilters.map((filter) => {
                const isActive = selectedQuickFilters.includes(filter.key);
                return (
                  <TouchableOpacity
                    key={filter.key}
                    style={[s.quickFilterPill, isActive && s.quickFilterPillActive]}
                    onPress={() => toggleQuickFilter(filter.key)}
                  >
                    <Text style={[s.quickFilterText, isActive && s.quickFilterTextActive]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={s.filterSectionTitle}>More</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.quickFilterRow}
              style={{ marginTop: 8 }}
            >
              {moreFilters.map((filter) => {
                const isActive = selectedQuickFilters.includes(filter.key);
                return (
                  <TouchableOpacity
                    key={filter.key}
                    style={[s.quickFilterPill, isActive && s.quickFilterPillActive]}
                    onPress={() => toggleQuickFilter(filter.key)}
                  >
                    <Text style={[s.quickFilterText, isActive && s.quickFilterTextActive]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={s.resultCount}>{filteredEvents.length} events found</Text>
          </>
        }
        renderItem={({ item }) => (
          <LargeEventCard
            event={item}
            isStarred={starredEventIds.includes(item.id)}
            onPress={() => navigation.navigate('EventDetail', { event: item })}
          />
        )}
      />
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
  quickFilterRow: {
    gap: 8,
    paddingRight: 20,
  },
  filterSectionTitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: fonts.medium,
    marginTop: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
  quickFilterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  quickFilterPillActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(255,255,255,0.95)',
  },
  quickFilterText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  quickFilterTextActive: {
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
