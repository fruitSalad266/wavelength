import React from 'react';
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
import { Avatar } from '../../components/Avatar';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';
import { useMatches } from '../../hooks/useMatches';
import { useFriends } from '../../hooks/useFriends';

function ScoreRing({ score }) {
  const color = score >= 95 ? '#00ac9b' : score >= 90 ? '#7300ff' : '#9810FA';
  return (
    <View style={[s.scoreRing, { borderColor: color }]}>
      <Text style={[s.scoreNumber, { color }]}>{score}</Text>
      <Text style={[s.scorePct, { color }]}>%</Text>
    </View>
  );
}

function MatchCard({ match, onAddFriend, onViewProfile, friendship }) {
  const sharedItems = [
    ...match.breakdown.sharedInterests,
    ...match.breakdown.sharedClubs,
  ];

  const actionLabel =
    friendship?.status === 'accepted'
      ? 'Friends'
      : friendship?.status === 'pending' && friendship?.direction === 'outgoing'
      ? 'Requested'
      : friendship?.status === 'pending' && friendship?.direction === 'incoming'
      ? 'Accept'
      : 'Add Friend';

  const actionColor =
    friendship?.status === 'accepted'
      ? colors.teal
      : friendship?.status === 'pending'
      ? colors.amber
      : colors.primary;

  return (
    <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={onViewProfile}>
      <View style={s.cardTop}>
        <Avatar uri={match.avatar_url} name={match.full_name} size={56} />
        <View style={s.cardInfo}>
          <Text style={s.cardName}>{match.full_name}</Text>
          <View style={s.metaRow}>
            {match.major ? (
              <View style={s.metaChip}>
                <Feather name="book-open" size={11} color={colors.textSecondary} />
                <Text style={s.metaText}>{match.major}</Text>
              </View>
            ) : null}
            {match.class_year ? (
              <View style={s.metaChip}>
                <Feather name="calendar" size={11} color={colors.textSecondary} />
                <Text style={s.metaText}>Class of {match.class_year}</Text>
              </View>
            ) : null}
          </View>
          {match.breakdown.mutualFriendCount > 0 && (
            <Text style={s.mutualText}>
              {match.breakdown.mutualFriendCount} mutual friend
              {match.breakdown.mutualFriendCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <ScoreRing score={match.matchScore} />
      </View>

      {sharedItems.length > 0 && (
        <View style={s.chipsRow}>
          {sharedItems.slice(0, 4).map((item) => (
            <View key={item} style={s.chip}>
              <Text style={s.chipText}>{item}</Text>
            </View>
          ))}
          {sharedItems.length > 4 && (
            <View style={s.chip}>
              <Text style={s.chipText}>+{sharedItems.length - 4} more</Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[s.addBtn, { backgroundColor: actionColor, opacity: friendship?.status === 'pending' && friendship?.direction === 'outgoing' ? 0.6 : 1 }]}
        activeOpacity={0.8}
        onPress={(e) => {
          e.stopPropagation();
          onAddFriend();
        }}
        disabled={friendship?.status === 'accepted' || (friendship?.status === 'pending' && friendship?.direction === 'outgoing')}
      >
        <Feather
          name={friendship?.status === 'accepted' ? 'user-check' : 'user-plus'}
          size={14}
          color="#fff"
        />
        <Text style={s.addBtnText}>{actionLabel}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function MatchesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { matches, loading, refresh } = useMatches();
  const { sendRequest, acceptRequest, getFriendship } = useFriends();

  return (
    <View style={s.root}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top }]}>
        <Text style={s.headerTitle}>Matches</Text>
        <Text style={s.headerSub}>Students who vibe with you (80%+)</Text>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : matches.length === 0 ? (
        <View style={s.centered}>
          <Feather name="users" size={48} color="rgba(255,255,255,0.5)" />
          <Text style={s.emptyTitle}>No matches yet</Text>
          <Text style={s.emptyBody}>
            Complete your profile with interests, major, and clubs to find your people.
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refresh}
          refreshing={loading}
          renderItem={({ item }) => {
            const friendship = getFriendship(item.id);
            return (
              <MatchCard
                match={item}
                friendship={friendship}
                onViewProfile={() => navigation.navigate('UserProfile', { userId: item.id })}
                onAddFriend={() => {
                  if (friendship?.status === 'pending' && friendship?.direction === 'incoming') {
                    acceptRequest(item.id);
                  } else if (!friendship) {
                    sendRequest(item.id);
                  }
                }}
              />
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: '#fff',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.75)',
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: '#fff',
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardInfo: { flex: 1, gap: 4 },
  cardName: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  metaText: { fontSize: 11, fontFamily: fonts.regular, color: colors.textSecondary },
  mutualText: { fontSize: 12, fontFamily: fonts.medium, color: colors.teal },

  scoreRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 1,
  },
  scoreNumber: { fontSize: 20, fontFamily: fonts.bold },
  scorePct: { fontSize: 11, fontFamily: fonts.semiBold, marginTop: 4 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip: {
    backgroundColor: colors.purpleLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.purpleLightBorder,
  },
  chipText: { fontSize: 12, fontFamily: fonts.medium, color: colors.primary },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: { fontSize: 14, fontFamily: fonts.semiBold, color: '#fff' },
});
