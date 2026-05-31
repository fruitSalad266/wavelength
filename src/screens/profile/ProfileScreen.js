import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useFriends } from '../../hooks/useFriends';
import { useMyRSVPs } from '../../hooks/useRSVP';
import { supabase } from '../../lib/supabase';
import { fonts } from '../../theme/fonts';
import { getPromptById } from '../../data/profilePrompts';

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function InterestChip({ label }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function ProfilePromptCard({ promptData }) {
  const def = getPromptById(promptData.id);
  if (!def || !promptData.answer) return null;

  const icon = def.icon;
  const label = def.label;

  if (def.type === 'text') {
    return (
      <Card>
        <View style={styles.promptHeader}>
          <Feather name={icon} size={18} color="#9810FA" />
          <Text style={styles.promptLabel}>{label}</Text>
        </View>
        <Text style={styles.bioText}>{promptData.answer}</Text>
      </Card>
    );
  }

  if (def.type === 'anthem') {
    const a = promptData.answer;
    return (
      <Card>
        <View style={styles.anthemRow}>
          <View style={styles.anthemIcon}>
            <Feather name="music" size={22} color="#9810FA" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.anthemLabel}>{label}</Text>
            <Text style={styles.anthemTitle}>{a.title}</Text>
            <Text style={styles.anthemArtist}>{a.artist}</Text>
          </View>
          {a.url ? (
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => Linking.openURL(a.url)}
            >
              <Feather name="play" size={20} color="#fff" />
            </TouchableOpacity>
          ) : null}
        </View>
      </Card>
    );
  }

  if (def.type === 'list') {
    const items = Array.isArray(promptData.answer) ? promptData.answer : [];
    return (
      <Card>
        <View style={styles.promptHeader}>
          <Feather name={icon} size={18} color="#9810FA" />
          <Text style={styles.promptLabel}>{label}</Text>
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={styles.topEventRow}>
            <Text style={styles.topEventEmoji}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.topEventTitle}>{item.title}</Text>
              {item.desc ? <Text style={styles.topEventDesc}>{item.desc}</Text> : null}
            </View>
          </View>
        ))}
      </Card>
    );
  }

  return null;
}

function FriendExpandedRow({ friend }) {
  return (
    <View style={styles.friendExpandedRow}>
      <View style={styles.friendAvatarWrap}>
        <Avatar uri={friend.avatar} name={friend.name} size={44} style={{ borderWidth: 0 }} />
        {friend.isUWStudent && (
          <View style={styles.verifiedBadge}>
            <Feather name="check" size={8} color="#fff" />
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.friendExpandedName}>{friend.name}</Text>
        <Text style={styles.friendExpandedInterests}>
          {friend.interests.join(' · ')}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const { pending, friends, acceptRequest, removeFriend } = useFriends();
  const { goingEventIds } = useMyRSVPs();
  const [nextEvent, setNextEvent] = useState(null);

  useEffect(() => {
    if (!goingEventIds || goingEventIds.length === 0) {
      setNextEvent(null);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const fetchNextEvent = async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title, date, time, location, background_image')
        .in('id', goingEventIds)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(1);
      setNextEvent(data?.[0] || null);
    };
    fetchNextEvent();
  }, [goingEventIds]);

  const displayName = profile?.full_name || 'User';
  const avatarUrl = profile?.avatar_url;
  const location = profile?.location || '';
  const ageRange = profile?.age_range || '';
  const interests = profile?.interests || [];
  const classYear = profile?.class_year || '';
  const major = profile?.major || '';
  const clubs = profile?.extras?.clubs || [];
  const socialLinks = profile?.extras?.social_links || [];
  const prompts = profile?.extras?.prompts || [];

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Header bar */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <Text style={styles.headerTitleText}>Profile</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('People')}
            >
              <Feather name="user-plus" size={16} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Feather name="settings" size={16} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          {profile?.banner_url ? (
            <Image
              source={{ uri: profile.banner_url }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="disk"
              transition={200}
            />
          ) : (
            <LinearGradient
              colors={['#5a00cc', '#7300ff']}
              style={StyleSheet.absoluteFill}
            />
          )}
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(115,0,255,0.6)', '#7300ff']}
            locations={[0, 0.35, 0.75, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Profile picture */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarOuter}>
            <Avatar
              uri={avatarUrl}
              name={displayName}
              size={112}
              style={{ borderWidth: 0 }}
            />
          </View>
        </View>

        {/* Name & info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{displayName}</Text>
          <View style={styles.locationRow}>
            {location ? (
              <>
                <Feather name="map-pin" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.locationText}>{location}</Text>
              </>
            ) : null}
            {ageRange ? <Text style={styles.ageText}>{ageRange}</Text> : null}
          </View>
        </View>

        {/* Interest chips */}
        <View style={styles.chipsWrap}>
          <View style={styles.uwChip}>
            <Feather name="check-circle" size={16} color="#7300ff" />
            <Text style={styles.uwChipText}>Verified UW Student</Text>
          </View>
          {interests.map((interest) => (
            <InterestChip key={interest} label={interest} />
          ))}
        </View>

        

        <View style={styles.cardBody}>
          {/* Friend Requests */}
          {pending.length > 0 && (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Feather name="users" size={16} color="#9810FA" />
                <Text style={styles.cardTitle}>Friend Requests ({pending.length})</Text>
              </View>
              {pending.map((person) => (
                <View key={person.id} style={styles.requestRow}>
                  <Avatar uri={person.avatar_url} name={person.full_name} size={40} style={{ borderWidth: 0 }} />
                  <Text style={styles.requestName} numberOfLines={1}>{person.full_name}</Text>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => acceptRequest(person.id)}
                  >
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => removeFriend(person.id)}
                  >
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
          )}

          {/* Friends strip */}
          {friends.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Friends')}
              style={styles.friendsStrip}
            >
              <View style={styles.friendsStripLeft}>
                <View style={styles.avatarStack}>
                  {friends.slice(0, 6).map((f, i) => (
                    <View key={f.id} style={[styles.stackedAvatar, { marginLeft: i === 0 ? 0 : -10, zIndex: 6 - i }]}>
                      <Avatar uri={f.avatar_url} name={f.full_name} size={36} style={{ borderWidth: 2, borderColor: '#fff' }} />
                    </View>
                  ))}
                  {friends.length > 6 && (
                    <View style={[styles.stackedAvatar, styles.overflowBubble, { marginLeft: -10 }]}>
                      <Text style={styles.overflowText}>+{friends.length - 6}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.friendsStripText}>
                  {friends.length} {friends.length === 1 ? 'Friend' : 'Friends'}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}

          {/* UW Section */}
          <View style={styles.uwSection}>
            <LinearGradient colors={['#4b0096', '#7300ff']} style={StyleSheet.absoluteFill} borderRadius={12} />
            <View style={styles.uwHeader}>
              <Text style={styles.uwEmoji}>🎓</Text>
              <Text style={styles.uwTitle}>University of Washington</Text>
            </View>
            <View style={styles.uwGrid}>
              {classYear ? (
                <View style={styles.uwItem}>
                  <Feather name="calendar" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.uwItemLabel}>Class of</Text>
                  <Text style={styles.uwItemValue}>{classYear}</Text>
                </View>
              ) : null}
              {major ? (
                <View style={styles.uwItem}>
                  <Feather name="book-open" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.uwItemLabel}>Major</Text>
                  <Text style={styles.uwItemValue}>{major}</Text>
                </View>
              ) : null}
            </View>
            {clubs.length > 0 && (
              <View style={styles.uwClubsSection}>
                <Text style={styles.uwClubsLabel}>Affiliated Clubs</Text>
                <View style={styles.uwClubsWrap}>
                  {clubs.map((club, idx) => (
                    <View key={idx} style={styles.uwClub}>
                      <Text style={styles.uwClubText}>{club}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
          </View>

          {/* Profile Prompts */}
          {prompts.length > 0 ? (
            prompts.map((p) => (
              <ProfilePromptCard key={p.id} promptData={p} />
            ))
          ) : (
            <TouchableOpacity
              style={styles.promptNudge}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={styles.promptNudgeIcon}>
                <Feather name="message-circle" size={22} color="#7300ff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promptNudgeTitle}>Add prompts to your profile</Text>
                <Text style={styles.promptNudgeSub}>Help others get to know you — pick fun questions to answer</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}

          {/* Next Event */}
          {nextEvent && (
            <TouchableOpacity
              style={styles.nextEventCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EventDetail', { eventId: nextEvent.id })}
            >
              {nextEvent.background_image ? (
                <Image source={{ uri: nextEvent.background_image }} style={styles.nextEventBg} contentFit="cover" cachePolicy="disk" transition={200} />
              ) : (
                <LinearGradient colors={['#00ac9b', '#007a6e']} style={styles.nextEventBg} />
              )}
              <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFill} borderRadius={12} />
              <View style={styles.nextEventContent}>
                <View style={styles.nextEventHeader}>
                  <Feather name="calendar" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.nextEventLabel}>Next Event</Text>
                </View>
                <Text style={styles.nextEventTitle} numberOfLines={2}>{nextEvent.title}</Text>
                <View style={styles.nextEventMeta}>
                  {nextEvent.date && (
                    <Text style={styles.nextEventDate}>
                      {new Date(`${nextEvent.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  )}
                  {nextEvent.time && <Text style={styles.nextEventDate}> · {nextEvent.time}</Text>}
                </View>
                {nextEvent.location && (
                  <View style={styles.nextEventLocRow}>
                    <Feather name="map-pin" size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.nextEventLoc} numberOfLines={1}>{nextEvent.location}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Connect */}
          {socialLinks.length > 0 && (
            <Card>
              <Text style={styles.cardTitle}>Connect</Text>
              <View style={styles.socialGrid}>
                {socialLinks.map((link, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.socialRow}
                    onPress={() => link.url && Linking.openURL(link.url)}
                  >
                    <Feather name={link.icon || 'link'} size={18} color={link.color || '#7300ff'} />
                    <Text style={styles.socialLabel}>{link.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Header
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
  headerTitleText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: fonts.semiBold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  settingsBtnText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  

  banner: {
    height: 180,
    overflow: 'hidden',
  },

  avatarContainer: {
    alignItems: 'center',
    marginTop: -56,
    zIndex: 10,
  },
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
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 14,
  },
  profileName: {
    fontSize: 36,
    fontFamily: fonts.semiBold,
    color: '#fff',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.8)',
  },
  ageText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 12,
  },

  cardBody: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  uwChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#7300ff',
    backgroundColor: '#FFFFE0',
  },
  uwChipText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#7300ff',
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#fff',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  addFriendBtn: {
    flex: 1,
    backgroundColor: '#7300ff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addFriendText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  messageBtn: {
    flex: 1,
    backgroundColor: '#00ac9b',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  messageBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },

  // Friends strip
  friendsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  friendsStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    borderRadius: 999,
  },
  overflowBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  overflowText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#4a5565',
  },
  friendsStripText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#101828',
  },

  // Friend requests
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  requestName: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#101828',
  },
  acceptBtn: {
    backgroundColor: '#7300ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  acceptBtnText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: '#fff',
  },
  declineBtn: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  declineBtnText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: '#4a5565',
  },
  // Card
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
  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 12,
  },

  // Bio
  bioText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#4a5565',
    lineHeight: 22,
  },

  // Top events prompt
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  promptLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#4a5565',
  },
  topEventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  topEventEmoji: {
    fontSize: 22,
  },
  topEventTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 2,
  },
  topEventDesc: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },

  // Anthem
  anthemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  anthemIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anthemLabel: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginBottom: 2,
  },
  anthemTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: '#101828',
  },
  anthemArtist: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },

  // Event grid
  // Social grid
  socialGrid: {
    gap: 4,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  socialLabel: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#101828',
  },

  promptNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  promptNudgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptNudgeTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 2,
  },
  promptNudgeSub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },

  // UW Section
  uwSection: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    overflow: 'hidden',
  },
  uwHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  uwEmoji: {
    fontSize: 22,
  },
  uwTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: '#fff',
  },
  uwGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uwItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  uwItemLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  uwItemValue: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#fff',
  },
  uwClubsSection: {
    marginBottom: 14,
  },
  uwClubsLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  uwClubsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  uwClub: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  uwClubText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: '#fff',
  },
  

  // Mutual friends
  mutualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  friendAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreCircleText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#7300ff',
  },
  friendExpandedList: {
    gap: 10,
  },
  friendExpandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendAvatarWrap: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7300ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendExpandedName: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#101828',
  },
  friendExpandedInterests: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginTop: 1,
  },
  collapseFriendsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  collapseFriendsText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: '#7300ff',
  },

  // Next Event card
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
