import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const categories = ['All', 'UW', 'Music', 'Art', 'Food', 'Sports', 'Networking', 'Technology'];

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
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const { events: supabaseEvents, loading } = useEvents();
  const { starredEventIds } = useMyRSVPs();

  const filteredEvents = useMemo(() => {
    let events = supabaseEvents;
    if (selectedCategory !== 'All') {
      events = events.filter((e) => e.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      events = events.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q)
      );
    }
    return events;
  }, [supabaseEvents, selectedCategory, searchQuery]);

  const toggleSearch = () => {
    if (searchVisible) {
      setSearchQuery('');
      setSearchVisible(false);
    } else {
      setSearchVisible(true);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#6610f2', '#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <Text style={s.headerTitle}>Events</Text>
          <View style={s.headerRight}>
            <TouchableOpacity style={[s.searchBtn, searchVisible && s.searchBtnActive]} onPress={toggleSearch}>
              <Feather name={searchVisible ? 'x' : 'search'} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {searchVisible && (
          <View style={s.searchBarWrap}>
            <Feather name="search" size={16} color="rgba(255,255,255,0.6)" style={{ marginRight: 8 }} />
            <TextInput
              ref={searchRef}
              style={s.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search events..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x-circle" size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>
        )}
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
  searchBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.regular,
    paddingVertical: 0,
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
