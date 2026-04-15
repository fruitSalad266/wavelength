import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useEvents } from '../../hooks/useEvents';
import { useMyRSVPs } from '../../hooks/useRSVP';
import { EventImage } from '../../components/EventImage';
import { Badge } from '../../components/Badge';
import { fonts } from '../../theme/fonts';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getLocalToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function YourEventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={onPress}>
      <EventImage uri={event.backgroundImage} source={event.source} style={s.cardImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={s.cardOverlay} />
      <View style={s.cardContent}>
        <View style={s.cardTopRow}>
          <Badge label={event.category} />
          <View style={s.goingChip}>
            <Feather name="check-circle" size={12} color="#fff" />
            <Text style={s.goingChipText}>Going</Text>
          </View>
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
        <View style={s.metaRow}>
          <Feather name="users" size={13} color="rgba(255,255,255,0.9)" />
          <Text style={s.metaText}>{event.attendees} attending</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function YourEventsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { events, loading: eventsLoading } = useEvents();
  const { goingEventIds, loading: rsvpLoading, refresh: refreshRSVPs } = useMyRSVPs();

  useFocusEffect(
    useCallback(() => {
      refreshRSVPs();
    }, [refreshRSVPs])
  );

  const loading = eventsLoading || rsvpLoading;
  const today = getLocalToday();

  const yourEvents = useMemo(() => {
    return events
      .filter((e) => goingEventIds.includes(e.id) && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, goingEventIds, today]);

  return (
    <View style={s.root}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Your Events</Text>
          <View style={{ width: 22 }} />
        </View>
      </View>

      {loading ? (
        <View style={s.centerWrap}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : yourEvents.length === 0 ? (
        <View style={s.centerWrap}>
          <Feather name="calendar" size={48} color="rgba(255,255,255,0.3)" />
          <Text style={s.emptyTitle}>No upcoming events</Text>
          <Text style={s.emptySub}>RSVP to events to see them here</Text>
        </View>
      ) : (
        <FlatList
          data={yourEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
          renderItem={({ item }) => (
            <YourEventCard
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
  centerWrap: {
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
    height: 220,
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
  goingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,172,155,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  goingChipText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.semiBold,
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
