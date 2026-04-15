import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvents } from '../../hooks/useEvents';
import { useMyRSVPs } from '../../hooks/useRSVP';
import { EventImage } from '../../components/EventImage';
import { Badge } from '../../components/Badge';
import { fonts } from '../../theme/fonts';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SavedEventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={onPress}>
      <EventImage uri={event.backgroundImage} source={event.source} style={s.cardImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={s.cardOverlay} />
      <View style={s.cardContent}>
        <View style={s.cardTopRow}>
          <Badge label={event.category} />
          <Ionicons name="star" size={16} color="#fbbf24" />
        </View>
        <View style={{ flex: 1 }} />
        <Text style={s.cardTitle}>{event.title}</Text>
        <View style={s.metaRow}>
          <Feather name="calendar" size={13} color="rgba(255,255,255,0.9)" />
          <Text style={s.metaText}>{formatDate(event.date)} • {event.time}</Text>
        </View>
        <View style={s.metaRow}>
          <Feather name="map-pin" size={13} color="rgba(255,255,255,0.9)" />
          <Text style={s.metaText}>{event.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SavedEventsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { events, loading: eventsLoading } = useEvents();
  const { starredEventIds, goingEventIds, loading: rsvpLoading } = useMyRSVPs();

  const loading = eventsLoading || rsvpLoading;

  const savedEvents = useMemo(() => {
    const ids = new Set([...starredEventIds, ...goingEventIds]);
    return events.filter((e) => ids.has(e.id));
  }, [events, starredEventIds, goingEventIds]);

  return (
    <View style={s.root}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Saved Events</Text>
          <View style={{ width: 22 }} />
        </View>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : savedEvents.length === 0 ? (
        <View style={s.emptyWrap}>
          <Feather name="star" size={48} color="rgba(255,255,255,0.3)" />
          <Text style={s.emptyTitle}>No saved events yet</Text>
          <Text style={s.emptySub}>Star or RSVP to events to see them here</Text>
        </View>
      ) : (
        <FlatList
          data={savedEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
          renderItem={({ item }) => (
            <SavedEventCard
              event={item}
              onPress={() => navigation.navigate('EventDetail', { event: item })}
            />
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
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
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: fonts.semiBold,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: fonts.semiBold,
  },
  emptySub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  card: {
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardImage: { resizeMode: 'cover' },
  cardOverlay: { ...StyleSheet.absoluteFillObject },
  cardContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: fonts.semiBold,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontFamily: fonts.regular,
  },
});
