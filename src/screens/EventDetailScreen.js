import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockEvents } from '../data/mockEvents';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EventDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { eventId } = route.params;
  const event = mockEvents.find((e) => e.id === eventId);

  if (!event) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#6610f2', '#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />
        <Text style={styles.notFound}>Event not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#6610f2', '#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Back button */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Hero image */}
        <View style={styles.hero}>
          <Image source={{ uri: event.backgroundImage }} style={styles.heroImage} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            <Text style={styles.heroTitle}>{event.title}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Feather name="calendar" size={18} color="#c4dcff" />
            <Text style={styles.detailText}>
              {formatDate(event.date)} • {event.time}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="map-pin" size={18} color="#c4dcff" />
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="users" size={18} color="#c4dcff" />
            <Text style={styles.detailText}>{event.attendees} attending</Text>
          </View>
        </View>

        {/* Attend button */}
        <TouchableOpacity style={styles.attendBtn} activeOpacity={0.8}>
          <Text style={styles.attendBtnText}>Attend Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  notFound: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  hero: {
    height: 300,
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  details: {
    padding: 24,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    color: '#fff',
    fontSize: 16,
  },
  attendBtn: {
    marginHorizontal: 24,
    backgroundColor: '#00ac9b',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  attendBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
