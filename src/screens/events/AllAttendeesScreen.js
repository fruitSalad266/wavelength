import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { fonts } from '../../theme/fonts';
import { ALL_ATTENDEES } from '../../data/mockAllAttendees';

function AttendeeRow({ attendee, onPress }) {
  const Wrapper = attendee.userId ? TouchableOpacity : View;
  const wrapperProps = attendee.userId ? { activeOpacity: 0.7, onPress } : {};

  return (
    <View style={s.attendeeWrap}>
      {attendee.note && (
        <View style={s.thoughtBubble}>
          <Text style={s.thoughtText}>{attendee.note}</Text>
          <View style={s.thoughtTail} />
        </View>
      )}
      <Wrapper style={s.attendeeRow} {...wrapperProps}>
        <Avatar uri={attendee.avatar} name={attendee.name} size={48} style={{ borderWidth: 0 }} />
        <View style={s.attendeeInfo}>
          <View style={s.attendeeNameRow}>
            <Text style={s.attendeeName} numberOfLines={1}>{attendee.name}</Text>
            {attendee.matchPct && (
              <View style={s.matchBadge}>
                <Feather name="zap" size={10} color="#fff" />
                <Text style={s.matchText}>{attendee.matchPct}%</Text>
              </View>
            )}
          </View>
          {attendee.favoriteSong && (
            <View style={s.songRow}>
              <Feather name="music" size={12} color="#9810FA" />
              <Text style={s.songText} numberOfLines={1}>
                {attendee.favoriteSong.title}
                <Text style={s.songArtist}> — {attendee.favoriteSong.artist}</Text>
              </Text>
            </View>
          )}
        </View>
        <View style={[s.statusBadge, attendee.status === 'maybe' && s.statusBadgeMaybe]}>
          <Text style={[s.statusText, attendee.status === 'maybe' && s.statusTextMaybe]}>
            {attendee.status === 'going' ? 'Going' : 'Maybe'}
          </Text>
        </View>
      </Wrapper>
    </View>
  );
}

export default function AllAttendeesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('all');

  const filters = [
    { key: 'all', label: `All (${ALL_ATTENDEES.length})` },
    { key: 'going', label: `Going (${ALL_ATTENDEES.filter((a) => a.status === 'going').length})` },
    { key: 'maybe', label: `Maybe (${ALL_ATTENDEES.filter((a) => a.status === 'maybe').length})` },
  ];

  const filtered = filter === 'all' ? ALL_ATTENDEES : ALL_ATTENDEES.filter((a) => a.status === filter);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Attendees</Text>
            <Text style={s.headerCount}>{ALL_ATTENDEES.length} people</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
      </View>

      {/* Filters */}
      <View style={s.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtersRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[s.filterPill, filter === f.key && s.filterPillActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[s.filterPillText, filter === f.key && s.filterPillTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Song legend */}
      <View style={s.legendRow}>
        <Feather name="music" size={12} color="rgba(255,255,255,0.6)" />
        <Text style={s.legendText}>Showing each attendee's voted favorite song</Text>
      </View>

      <ScrollView
        style={s.list}
        contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((attendee) => (
          <AttendeeRow
            key={attendee.id}
            attendee={attendee}
            onPress={attendee.userId ? () => navigation.navigate('UserProfile', { userId: attendee.userId }) : undefined}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  header: { backgroundColor: 'rgba(255,255,255,0.15)', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.2)' },
  headerInner: { flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 14 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: fonts.semiBold },
  headerCount: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: fonts.regular },

  filtersWrap: { paddingVertical: 12, paddingHorizontal: 16 },
  filtersRow: { flexDirection: 'row', gap: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)' },
  filterPillActive: { backgroundColor: '#fff' },
  filterPillText: { fontSize: 13, fontFamily: fonts.medium, color: 'rgba(255,255,255,0.9)' },
  filterPillTextActive: { color: '#7300ff' },

  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, marginBottom: 8 },
  legendText: { fontSize: 11, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.5)' },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, gap: 10 },

  attendeeWrap: {},
  thoughtBubble: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    marginLeft: 24,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  thoughtText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: '#101828',
    lineHeight: 18,
  },
  thoughtTail: {
    position: 'absolute',
    bottom: -6,
    left: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },

  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 14,
  },
  attendeeInfo: { flex: 1 },
  attendeeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  attendeeName: { fontSize: 15, fontFamily: fonts.semiBold, color: '#101828', flexShrink: 1 },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#00ac9b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  matchText: { fontSize: 10, fontFamily: fonts.bold, color: '#fff' },

  songRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  songText: { fontSize: 12, fontFamily: fonts.medium, color: '#4a5565', flex: 1 },
  songArtist: { fontFamily: fonts.regular, color: '#9ca3af' },

  statusBadge: { backgroundColor: '#e6f9f5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusBadgeMaybe: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 11, fontFamily: fonts.semiBold, color: '#00ac9b' },
  statusTextMaybe: { color: '#d97706' },
});
