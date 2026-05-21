import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { StatusNoteModal } from '../../components/StatusNoteModal';
import { fonts } from '../../theme/fonts';
import { useRSVP } from '../../hooks/useRSVP';
import { useAuth } from '../../contexts/AuthContext';
import { calculateMatchScore } from '../../utils/matchScore';

function ThoughtBubble({ text }) {
  return (
    <View style={s.thoughtWrap}>
      <View style={s.thoughtBubble}>
        <Text style={s.thoughtText} numberOfLines={2}>{text}</Text>
      </View>
      <View style={s.thoughtTail} />
    </View>
  );
}

function AttendeeRow({ attendee, onPress }) {
  const Wrapper = attendee.id ? TouchableOpacity : View;
  const wrapperProps = attendee.id ? { activeOpacity: 0.7, onPress } : {};

  return (
    <View style={s.attendeeWrap}>
      {attendee.note ? <ThoughtBubble text={attendee.note} /> : null}
      <Wrapper style={s.attendeeRow} {...wrapperProps}>
        <Avatar uri={attendee.avatar} name={attendee.name} size={48} style={{ borderWidth: 0 }} />
        <View style={s.attendeeInfo}>
          <View style={s.attendeeNameRow}>
            <Text style={s.attendeeName} numberOfLines={1}>{attendee.name}</Text>
            {attendee.matchPct > 0 && (
              <View style={s.matchBadge}>
                <Feather name="zap" size={10} color="#fff" />
                <Text style={s.matchText}>{attendee.matchPct}%</Text>
              </View>
            )}
          </View>
          {attendee.major && (
            <Text style={s.subtitleText} numberOfLines={1}>{attendee.major}</Text>
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

export default function AllAttendeesScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const eventId = route?.params?.eventId;
  const { user, profile } = useAuth();
  const { attendees, myNote, loading, saveNote, rsvpStatus } = useRSVP(eventId);
  const [filter, setFilter] = useState('all');
  const [modalBubble, setModalBubble] = useState(null);

  const enriched = attendees.map((a) => {
    const { score } = calculateMatchScore(profile || {}, {
      id: a.id,
      interests: a.interests,
      major: a.major,
      class_year: a.class_year,
      extras: a.extras,
    });
    const isSelf = a.id === user?.id;
    return { ...a, matchPct: isSelf ? 0 : score, note: isSelf ? myNote : a.note, isSelf };
  });

  const goingCount = enriched.filter((a) => a.status === 'going').length;
  const maybeCount = enriched.filter((a) => a.status === 'maybe').length;

  const filters = [
    { key: 'all', label: `All (${enriched.length})` },
    { key: 'going', label: `Going (${goingCount})` },
    { key: 'maybe', label: `Maybe (${maybeCount})` },
  ];

  const filtered = filter === 'all' ? enriched : enriched.filter((a) => a.status === filter);

  const selfBubble = useMemo(() => {
    if (!user || !profile || !rsvpStatus) return null;
    return {
      id: 'self',
      isSelf: true,
      userId: user.id,
      name: 'Your thought',
      displayTitle: 'Your thought',
      avatar: profile.avatar_url,
      text: myNote,
    };
  }, [user, profile, rsvpStatus, myNote]);

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
            <Text style={s.headerCount}>{enriched.length} people</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
      </View>

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

      {selfBubble && (
        <TouchableOpacity style={s.thoughtBtn} activeOpacity={0.8} onPress={() => setModalBubble(selfBubble)}>
          <Feather name="message-circle" size={15} color="#fff" />
          <Text style={s.thoughtBtnText}>
            {myNote ? 'Edit your thought' : 'Share a thought'}
          </Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.loadingWrap}>
          <Feather name="users" size={28} color="rgba(255,255,255,0.5)" />
          <Text style={s.emptyText}>No attendees yet</Text>
        </View>
      ) : (
        <ScrollView
          style={s.list}
          contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((attendee) => (
            <AttendeeRow
              key={attendee.id}
              attendee={attendee}
              onPress={attendee.id ? () => navigation.navigate('UserProfile', { userId: attendee.id }) : undefined}
            />
          ))}
        </ScrollView>
      )}

      <StatusNoteModal
        visible={!!modalBubble}
        bubble={modalBubble}
        onClose={() => setModalBubble(null)}
        onSaveMine={(text) => saveNote(text)}
        onMessage={(userId, userName) => navigation.navigate('DirectMessage', { userId, userName })}
        subtitle="Share what you're thinking about this event — other attendees will see it here."
      />
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

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 15, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.6)' },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, gap: 10 },

  thoughtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  thoughtBtnText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#fff',
  },

  thoughtWrap: {
    alignItems: 'flex-start',
    paddingLeft: 24,
    marginBottom: -2,
  },
  thoughtBubble: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '80%',
  },
  thoughtText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#374151',
    lineHeight: 18,
  },
  thoughtTail: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    marginTop: -5,
    marginLeft: 16,
  },

  attendeeWrap: {},

  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 14,
  },
  attendeeInfo: { flex: 1 },
  attendeeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  attendeeName: { fontSize: 15, fontFamily: fonts.semiBold, color: '#101828', flexShrink: 1 },
  subtitleText: { fontSize: 12, fontFamily: fonts.regular, color: '#4a5565' },
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

  statusBadge: { backgroundColor: '#e6f9f5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusBadgeMaybe: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 11, fontFamily: fonts.semiBold, color: '#00ac9b' },
  statusTextMaybe: { color: '#d97706' },
});
