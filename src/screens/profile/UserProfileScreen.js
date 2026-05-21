import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { fonts } from '../../theme/fonts';
import { useFriends } from '../../hooks/useFriends';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { calculateMatchScore } from '../../utils/matchScore';
import { MatchBadge } from '../../components/MatchBadge';
import { getPromptById } from '../../data/profilePrompts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export default function UserProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const userId = route.params?.userId;
  const [menuVisible, setMenuVisible] = useState(false);
  const { friends, sendRequest, acceptRequest, removeFriend, getFriendship } = useFriends();
  const friendship = getFriendship(userId);
  const { profile: myProfile } = useAuth();
  const [matchResult, setMatchResult] = useState(null);
  const [realProfile, setRealProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [nextEvent, setNextEvent] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetchAndScore = async () => {
      setProfileLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, banner_url, interests, major, class_year, extras, settings, location, age_range')
        .eq('id', userId)
        .single();
      if (data) {
        setRealProfile(data);
        if (myProfile && userId !== myProfile.id) {
          const result = calculateMatchScore(myProfile, data);
          if (result.score >= 80) setMatchResult(result);
          else setMatchResult(null);
        } else {
          setMatchResult(null);
        }
      }
      setProfileLoading(false);
    };
    fetchAndScore();
  }, [userId, myProfile]);

  // Compute mutual friends
  useEffect(() => {
    if (!userId || !friends.length) return;
    const myFriendIds = new Set(friends.map((f) => f.id));

    const fetchTheirFriends = async () => {
      const { data } = await supabase
        .from('friendships')
        .select('user_id, friend_id, status, requester:profiles!friendships_user_id_fkey(id, full_name, avatar_url), recipient:profiles!friendships_friend_id_fkey(id, full_name, avatar_url)')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      const theirFriends = (data || []).map((row) => {
        const isRequester = row.user_id === userId;
        return isRequester ? row.recipient : row.requester;
      }).filter(Boolean);

      const mutual = theirFriends.filter((f) => myFriendIds.has(f.id));
      setMutualFriends(mutual);
    };
    fetchTheirFriends();
  }, [userId, friends]);

  // Fetch next upcoming event this user is attending
  useEffect(() => {
    if (!userId || !realProfile) return;

    const privacySetting = realProfile.settings?.privacy?.showNextEvent || 'friends';
    const isFriend = friendship?.status === 'accepted';

    if (privacySetting === 'private') return;
    if (privacySetting === 'friends' && !isFriend) return;

    const today = new Date().toISOString().split('T')[0];
    const fetchNextEvent = async () => {
      const { data } = await supabase
        .from('event_rsvps')
        .select('event:events!event_rsvps_event_id_fkey(id, title, date, time, location, background_image)')
        .eq('user_id', userId)
        .eq('status', 'going')
        .eq('is_public', true);

      if (!data || data.length === 0) return;

      const upcoming = data
        .map((r) => r.event)
        .filter((e) => e && e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));

      if (upcoming.length > 0) setNextEvent(upcoming[0]);
    };
    fetchNextEvent();
  }, [userId, realProfile, friendship]);

  const backBtn = (
    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
      <Feather name="arrow-left" size={20} color="#fff" />
    </TouchableOpacity>
  );

  if (profileLoading) {
    return (
      <View style={s.root}>
        <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />
        <View style={[s.header, { paddingTop: insets.top }]}>
          <View style={s.headerInner}>{backBtn}</View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  if (!realProfile) {
    return (
      <View style={s.root}>
        <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />
        <View style={[s.header, { paddingTop: insets.top }]}>
          <View style={s.headerInner}>{backBtn}</View>
        </View>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 100, fontFamily: fonts.medium }}>User not found</Text>
      </View>
    );
  }

  const { full_name, avatar_url, banner_url, interests, major, class_year, extras, location, age_range } = realProfile;
  const clubs = extras?.clubs || [];
  const socialLinks = extras?.social_links || [];
  const prompts = extras?.prompts || [];
  const firstName = full_name?.split(' ')[0] ?? '';

  const myInterests = new Set((myProfile?.interests || []).map((i) => i.toLowerCase()));
  const myClubs = new Set((myProfile?.extras?.clubs || []).map((c) => c.toLowerCase()));
  const hasMatch = !!matchResult;
  const interestMatches = (i) => hasMatch && myInterests.has(i.toLowerCase());
  const clubMatches = (c) => hasMatch && myClubs.has(c.toLowerCase());
  const majorMatches = hasMatch && myProfile?.major && major && myProfile.major.trim().toLowerCase() === major.trim().toLowerCase();
  const yearMatches = hasMatch && myProfile?.class_year && class_year && myProfile.class_year === class_year;

  const handleBlock = () => {
    setMenuVisible(false);
    Alert.alert('Block User', `Are you sure you want to block ${firstName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: () => Alert.alert('Blocked', `${firstName} has been blocked.`) },
    ]);
  };

  const handleReport = () => {
    setMenuVisible(false);
    Alert.alert('Report User', `Are you sure you want to report ${firstName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thank you. We will review this report.') },
    ]);
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          {backBtn}
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={s.moreBtn} onPress={() => setMenuVisible(true)}>
            <Feather name="more-vertical" size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={s.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[s.menuCard, { marginTop: insets.top + 52 }]}>
            <TouchableOpacity style={s.menuItem} onPress={handleBlock}>
              <Feather name="slash" size={18} color="#ef4444" />
              <Text style={s.menuItemTextDanger}>Block {firstName}</Text>
            </TouchableOpacity>
            <View style={s.menuDivider} />
            <TouchableOpacity style={s.menuItem} onPress={handleReport}>
              <Feather name="flag" size={18} color="#ef4444" />
              <Text style={s.menuItemTextDanger}>Report {firstName}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <View style={s.banner}>
          {banner_url ? (
            <Image source={{ uri: banner_url }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="disk" transition={200} />
          ) : (
            <LinearGradient colors={['#5a00cc', '#7300ff']} style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(115,0,255,0.6)', '#7300ff']}
            locations={[0, 0.35, 0.75, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={s.avatarContainer}>
          <View style={s.avatarOuter}>
            <Avatar uri={avatar_url} name={full_name} size={104} style={{ borderWidth: 0 }} />
            {matchResult && <MatchBadge score={matchResult.score} breakdown={matchResult.breakdown} name={full_name} />}
          </View>
        </View>

        <View style={s.profileInfo}>
          <Text style={s.profileName}>{full_name}</Text>
          {(location || age_range) && (
            <View style={s.locationRow}>
              {location && (
                <>
                  <Feather name="map-pin" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={s.locationText}>{location}</Text>
                </>
              )}
              {age_range && <Text style={s.ageText}>{age_range}</Text>}
            </View>
          )}
        </View>

        <View style={s.chipsWrap}>
          <View style={s.uwChip}>
            <Feather name="check-circle" size={14} color="#fff" />
            <Text style={s.uwChipText}>Verified UW Student</Text>
          </View>
          {interests?.map((interest) => (
            <View key={interest} style={[s.chip, interestMatches(interest) && s.matchHighlight]}>
              <Text style={s.chipText}>{interest}</Text>
            </View>
          ))}
        </View>

        <View style={s.actionRow}>
          {friendship?.status === 'accepted' ? (
            <TouchableOpacity style={[s.addFriendBtn, { backgroundColor: '#00ac9b' }]} activeOpacity={0.8}
              onPress={() => Alert.alert('Remove Friend', `Remove ${firstName} as a friend?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => removeFriend(userId) }])}>
              <Feather name="user-check" size={16} color="#fff" />
              <Text style={s.addFriendText}>Friends</Text>
            </TouchableOpacity>
          ) : friendship?.status === 'pending' && friendship?.direction === 'incoming' ? (
            <TouchableOpacity style={[s.addFriendBtn, { backgroundColor: '#f59e0b' }]} activeOpacity={0.8} onPress={() => acceptRequest(userId)}>
              <Feather name="user-check" size={16} color="#fff" />
              <Text style={s.addFriendText}>Accept Request</Text>
            </TouchableOpacity>
          ) : friendship?.status === 'pending' && friendship?.direction === 'outgoing' ? (
            <TouchableOpacity style={[s.addFriendBtn, { opacity: 0.6 }]} activeOpacity={0.8} onPress={() => removeFriend(userId)}>
              <Feather name="clock" size={16} color="#fff" />
              <Text style={s.addFriendText}>Requested</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.addFriendBtn} activeOpacity={0.8} onPress={() => sendRequest(userId)}>
              <Feather name="user-plus" size={16} color="#fff" />
              <Text style={s.addFriendText}>Add Friend</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.messageBtn} activeOpacity={0.8}
            onPress={() => navigation.navigate('DirectMessage', { userId, userName: full_name })}>
            <Feather name="send" size={16} color="#fff" />
            <Text style={s.messageBtnText}>Message</Text>
          </TouchableOpacity>
        </View>

        <View style={s.cardBody}>
          {(major || class_year || clubs.length > 0) && (
            <View style={s.uwSection}>
              <LinearGradient colors={['#4b0096', '#7300ff']} style={StyleSheet.absoluteFill} borderRadius={12} />
              <View style={s.uwHeader}>
                <Text style={s.uwEmoji}>🎓</Text>
                <Text style={s.uwTitle}>University of Washington</Text>
              </View>
              <View style={s.uwGrid}>
                {class_year && (
                  <View style={[s.uwItem, yearMatches && s.matchHighlight]}>
                    <Feather name="calendar" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={s.uwItemLabel}>Class of</Text>
                    <Text style={s.uwItemValue}>{class_year}</Text>
                  </View>
                )}
                {major && (
                  <View style={[s.uwItem, majorMatches && s.matchHighlight]}>
                    <Feather name="book-open" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={s.uwItemLabel}>Major</Text>
                    <Text style={s.uwItemValue}>{major}</Text>
                  </View>
                )}
              </View>
              {clubs.length > 0 && (
                <View style={s.uwClubsSection}>
                  <Text style={s.uwClubsLabel}>Affiliated Clubs</Text>
                  <View style={s.uwClubsWrap}>
                    {clubs.map((club) => (
                      <View key={club} style={[s.uwClub, clubMatches(club) && s.matchHighlight]}>
                        <Text style={s.uwClubText}>{club}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Prompts */}
          {prompts.length > 0 && prompts.map((prompt, idx) => {
            if (!prompt.answer) return null;
            if (typeof prompt.answer === 'string' && !prompt.answer.trim()) return null;
            const promptDef = getPromptById(prompt.id);
            const label = promptDef?.label || prompt.question || prompt.id;
            return (
              <Card key={idx}>
                <View style={s.promptLabelRow}>
                  {promptDef?.icon && <Feather name={promptDef.icon} size={14} color="#7300ff" />}
                  <Text style={s.promptLabel}>{label}</Text>
                </View>
                {typeof prompt.answer === 'string' && (
                  <Text style={s.bioText}>{prompt.answer}</Text>
                )}
                {Array.isArray(prompt.answer) && prompt.answer.filter((i) => i.title?.trim()).map((item, i) => (
                  <View key={i} style={s.topEventRow}>
                    <Text style={s.topEventEmoji}>{item.emoji || '🎵'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.topEventTitle}>{item.title}</Text>
                      {item.desc && <Text style={s.topEventDesc}>{item.desc}</Text>}
                    </View>
                  </View>
                ))}
                {typeof prompt.answer === 'object' && !Array.isArray(prompt.answer) && prompt.answer.title && (
                  <View style={s.anthemRow}>
                    <View style={s.anthemIcon}>
                      <Feather name="music" size={22} color="#9810FA" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.anthemTitle}>{prompt.answer.title}</Text>
                      {prompt.answer.artist && <Text style={s.anthemArtist}>{prompt.answer.artist}</Text>}
                    </View>
                    {prompt.answer.url && (
                      <TouchableOpacity style={s.playBtn} onPress={() => Linking.openURL(prompt.answer.url)}>
                        <Feather name="play" size={20} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </Card>
            );
          })}

          {nextEvent && (
            <TouchableOpacity
              style={s.nextEventCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EventDetail', { eventId: nextEvent.id })}
            >
              {nextEvent.background_image ? (
                <Image source={{ uri: nextEvent.background_image }} style={s.nextEventBg} contentFit="cover" cachePolicy="disk" transition={200} />
              ) : (
                <LinearGradient colors={['#00ac9b', '#007a6e']} style={s.nextEventBg} />
              )}
              <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFill} borderRadius={12} />
              <View style={s.nextEventContent}>
                <View style={s.nextEventHeader}>
                  <Feather name="calendar" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={s.nextEventLabel}>Next Event</Text>
                </View>
                <Text style={s.nextEventTitle} numberOfLines={2}>{nextEvent.title}</Text>
                <View style={s.nextEventMeta}>
                  {nextEvent.date && (
                    <Text style={s.nextEventDate}>
                      {new Date(`${nextEvent.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  )}
                  {nextEvent.time && <Text style={s.nextEventDate}> · {nextEvent.time}</Text>}
                </View>
                {nextEvent.location && (
                  <View style={s.nextEventLocRow}>
                    <Feather name="map-pin" size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={s.nextEventLoc} numberOfLines={1}>{nextEvent.location}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <Card>
              <Text style={s.cardTitle}>Connect</Text>
              <View style={s.socialGrid}>
                {socialLinks.map((link, idx) => (
                  <TouchableOpacity key={idx} style={s.socialRow} onPress={() => link.url && Linking.openURL(link.url)}>
                    <Feather name={link.icon || 'link'} size={18} color={link.color || '#7300ff'} />
                    <Text style={s.socialLabel}>{link.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* Mutual Friends */}
          {mutualFriends.length > 0 && (
            <Card style={{ marginBottom: 0 }}>
              <View style={s.mutualHeader}>
                <Feather name="users" size={16} color="#7300ff" />
                <Text style={s.cardTitle}>{mutualFriends.length} Mutual {mutualFriends.length === 1 ? 'Friend' : 'Friends'}</Text>
              </View>
              <View style={s.friendAvatarsRow}>
                {mutualFriends.slice(0, 6).map((friend, idx) => (
                  <TouchableOpacity
                    key={friend.id}
                    style={{ marginLeft: idx > 0 ? -10 : 0, zIndex: 6 - idx }}
                    activeOpacity={0.7}
                    onPress={() => navigation.push('UserProfile', { userId: friend.id })}
                  >
                    <Avatar uri={friend.avatar_url} name={friend.full_name} size={42} style={{ borderWidth: 2, borderColor: '#fff' }} />
                  </TouchableOpacity>
                ))}
                {mutualFriends.length > 6 && (
                  <View style={[s.moreCircle, { marginLeft: -10 }]}>
                    <Text style={s.moreCircleText}>+{mutualFriends.length - 6}</Text>
                  </View>
                )}
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  header: { backgroundColor: 'rgba(255,255,255,0.25)' },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  moreBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuCard: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  menuItemTextDanger: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: '#ef4444',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },

  banner: { height: 180, overflow: 'hidden' },
  avatarContainer: { alignItems: 'center', marginTop: -56, zIndex: 10 },
  avatarOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  profileInfo: { alignItems: 'center', paddingHorizontal: 24, marginTop: 12, marginBottom: 14 },
  profileName: { fontSize: 36, fontFamily: fonts.semiBold, color: '#fff', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { fontSize: 15, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.8)' },
  ageText: { fontSize: 15, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.8)', marginLeft: 12 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, paddingHorizontal: 16 },
  uwChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#7300ff',
  },
  uwChipText: { fontSize: 14, fontFamily: fonts.semiBold, color: '#fff' },
  chip: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 14, fontFamily: fonts.regular, color: '#fff' },
  matchHighlight: { borderWidth: 2, borderColor: '#00dc9b', backgroundColor: 'rgba(0,220,155,0.15)' },

  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20, paddingHorizontal: 16 },
  addFriendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7300ff',
    paddingVertical: 14,
    borderRadius: 10,
  },
  addFriendText: { color: '#fff', fontSize: 16, fontFamily: fonts.semiBold },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00ac9b',
    paddingVertical: 14,
    borderRadius: 10,
  },
  messageBtnText: { color: '#fff', fontSize: 16, fontFamily: fonts.semiBold },

  cardBody: { paddingHorizontal: 16, paddingTop: 4 },

  uwSection: { borderRadius: 12, padding: 18, marginBottom: 12, overflow: 'hidden' },
  uwHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  uwEmoji: { fontSize: 22 },
  uwTitle: { fontSize: 17, fontFamily: fonts.semiBold, color: '#fff' },
  uwGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  uwItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: 12, gap: 4 },
  uwItemLabel: { fontSize: 11, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  uwItemValue: { fontSize: 15, fontFamily: fonts.semiBold, color: '#fff' },
  uwClubsSection: { marginBottom: 4 },
  uwClubsLabel: { fontSize: 12, fontFamily: fonts.medium, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  uwClubsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  uwClub: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  uwClubText: { fontSize: 13, fontFamily: fonts.medium, color: '#fff' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: { fontSize: 18, fontFamily: fonts.semiBold, color: '#101828', marginBottom: 12 },
  bioText: { fontSize: 15, fontFamily: fonts.regular, color: '#4a5565', lineHeight: 22 },

  promptLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  promptLabel: { fontSize: 14, fontFamily: fonts.medium, color: '#4a5565' },
  topEventRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  topEventEmoji: { fontSize: 22 },
  topEventTitle: { fontSize: 15, fontFamily: fonts.semiBold, color: '#101828', marginBottom: 2 },
  topEventDesc: { fontSize: 13, fontFamily: fonts.regular, color: '#4a5565' },

  anthemRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  anthemIcon: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center' },
  anthemTitle: { fontSize: 17, fontFamily: fonts.semiBold, color: '#101828' },
  anthemArtist: { fontSize: 15, fontFamily: fonts.regular, color: '#4a5565' },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1DB954', alignItems: 'center', justifyContent: 'center', paddingLeft: 3 },

  socialGrid: { gap: 4 },
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8 },
  socialLabel: { fontSize: 15, fontFamily: fonts.regular, color: '#101828' },

  mutualHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  friendAvatarsRow: { flexDirection: 'row', alignItems: 'center' },
  moreCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  moreCircleText: { fontSize: 12, fontFamily: fonts.semiBold, color: '#7300ff' },

  nextEventCard: { borderRadius: 12, height: 180, marginBottom: 12, overflow: 'hidden' },
  nextEventBg: { ...StyleSheet.absoluteFillObject, borderRadius: 12 },
  nextEventContent: { flex: 1, justifyContent: 'flex-end', padding: 18 },
  nextEventHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  nextEventLabel: { fontSize: 12, fontFamily: fonts.medium, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5 },
  nextEventTitle: { fontSize: 20, fontFamily: fonts.semiBold, color: '#fff', marginBottom: 4 },
  nextEventMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  nextEventDate: { fontSize: 14, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.9)' },
  nextEventLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  nextEventLoc: { fontSize: 13, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.7)' },
});
