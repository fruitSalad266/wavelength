import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Linking,
  Modal,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { ScreenHeader } from '../../components/ScreenHeader';
import { GradientCard } from '../../components/GradientCard';
import { EventImage } from '../../components/EventImage';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';
import { useRSVP } from '../../hooks/useRSVP';
import { useEventGroupChats } from '../../hooks/useGroupChats';
import { EVENT as DEFAULT_EVENT_DETAIL, MUTUAL_CONNECTIONS, FRIENDS_GOING } from '../../data/mockEventDetail';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TagBadge({ label, variant }) {
  const bg =
    variant === 'purple'
      ? colors.primary
      : variant === 'teal'
      ? colors.teal
      : 'rgba(255,255,255,0.9)';
  const color = variant === 'outline' ? colors.text : colors.white;
  const border = variant === 'outline' ? colors.cardBorder : bg;

  return (
    <View style={[s.tagBadge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[s.tagBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

function MutualPersonCard({ person }) {
  const firstName = person.name.split(' ')[0];
  return (
    <View style={s.mutualPerson}>
      <Avatar uri={person.avatar} name={person.name} size={44} style={{ borderWidth: 0 }} />
      <Text style={s.mutualName} numberOfLines={1}>{firstName}</Text>
      <Text style={s.mutualCount}>{person.mutualFriends} mutual</Text>
    </View>
  );
}

function AttendeeCard({ attendee, onPress }) {
  const Wrapper = attendee.userId ? TouchableOpacity : View;
  const wrapperProps = attendee.userId ? { activeOpacity: 0.7, onPress } : {};

  if (attendee.isGoodMatch) {
    return (
      <Wrapper style={[s.attendeeCard, s.attendeeCardMatch]} {...wrapperProps}>
        <View style={s.attendeeAvatarWrap}>
          <Avatar uri={attendee.avatar} name={attendee.name} size={44} style={{ borderWidth: 0 }} />
          <View style={s.sparkBadge}>
            <Feather name="zap" size={10} color="#fff" />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.attendeeName} numberOfLines={1}>{attendee.name}</Text>
          <Text style={s.attendeeSub}>94% Match</Text>
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper style={[s.attendeeCardCompact, attendee.status === 'maybe' && s.attendeeCardMaybe]} {...wrapperProps}>
      <Avatar uri={attendee.avatar} name={attendee.name} size={34} style={{ borderWidth: 0 }} />
      <Text style={s.attendeeNameCompact} numberOfLines={1}>{attendee.name}</Text>
      {attendee.status === 'maybe' && (
        <Text style={s.attendeeMaybeLabel}>Maybe</Text>
      )}
    </Wrapper>
  );
}

function GroupChatRow({ group, onPress }) {
  const isHighlighted = group.isVerified;
  return (
    <TouchableOpacity
      style={[s.groupRow, isHighlighted && s.groupRowHighlight]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <LinearGradient colors={[colors.primary, colors.teal]} style={s.groupIcon}>
        <Text style={s.groupIconText}>{group.icon}</Text>
      </LinearGradient>

      <View style={s.groupInfo}>
        <View style={s.groupNameRow}>
          <Text style={s.groupName} numberOfLines={1}>{group.name}</Text>
          {isHighlighted && (
            <Badge
              label="Verified UW Students"
              style={{ backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}
              textStyle={{ fontSize: 9 }}
            />
          )}
        </View>
        <Text style={s.groupDesc} numberOfLines={1}>{group.description}</Text>
      </View>

      <View style={s.groupMemberRow}>
        <Feather name="users" size={12} color={colors.textMuted} />
        <Text style={s.groupMemberCount}>{group.memberCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

function formatShortDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function EventDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [markModalVisible, setMarkModalVisible] = useState(false);
  const passedEvent = route?.params?.event;
  const event = {
    ...DEFAULT_EVENT_DETAIL,
    ...(passedEvent ? {
      id: passedEvent.id,
      title: passedEvent.title,
      venue: passedEvent.location,
      date: formatShortDate(passedEvent.date),
      time: passedEvent.time,
      bannerImage: passedEvent.backgroundImage,
      detailType: passedEvent.detailType,
      detailCard: passedEvent.detailCard,
      tags: Array.isArray(passedEvent.tags) && passedEvent.tags.length > 0 ? passedEvent.tags : DEFAULT_EVENT_DETAIL.tags,
      tickets: passedEvent.tickets,
      signup: passedEvent.signup,
      source: passedEvent.source,
    } : {}),
  };

  const {
    rsvpStatus, isStarred, isPublic,
    attendees: realAttendees, attendeeCount,
    setRSVP, toggleStar, setPublic,
  } = useRSVP(event.id);

  const { chats: eventChats } = useEventGroupChats(event.id);

  const handleConfirmRsvp = () => {
    setMarkModalVisible(false);
  };

  const getMatchedAttendees = () => {
    return realAttendees.slice(0, 4);
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={StyleSheet.absoluteFill} />

      <ScreenHeader
        insets={insets}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            onPress={toggleStar}
            style={s.starBtn}
          >
            <Ionicons
              name={isStarred ? 'star' : 'star-outline'}
              size={20}
              color={isStarred ? colors.star : colors.whiteSoft}
            />
          </TouchableOpacity>
        }
        showBackground={false}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={s.banner}>
          <EventImage uri={event.bannerImage} source={event.source} />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(115,0,255,0.5)', 'rgba(115,0,255,0.85)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.bannerContent}>
            <Text style={s.bannerTitle}>{event.title}</Text>
            <Text style={s.bannerVenue}>@ {event.venue}</Text>
          </View>
        </View>

        {/* Date & time */}
        <View style={s.dateRow}>
          <View style={s.dateItem}>
            <Feather name="calendar" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={s.dateText}>{event.date}</Text>
          </View>
          <View style={s.dateItem}>
            <Feather name="clock" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={s.dateText}>{event.time}</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={s.tagsRow}>
          {event.tags.map((tag, i) => (
            <TagBadge key={i} label={tag.label} variant={tag.variant} />
          ))}
        </View>

        <View style={s.body}>
          {/* Friends Going */}
          <Card>
            <View style={s.friendsGoingHeader}>
              <Feather name="heart" size={14} color="#9810FA" />
              <Text style={s.friendsGoingLabel}>{FRIENDS_GOING.length} Friends Going</Text>
            </View>
            <View style={s.friendsGoingAvatars}>
              {FRIENDS_GOING.map((friend, idx) => (
                <View key={friend.id} style={{ marginLeft: idx > 0 ? -10 : 0, zIndex: FRIENDS_GOING.length - idx }}>
                  <Avatar uri={friend.avatar} name={friend.name} size={38} style={{ borderWidth: 2, borderColor: '#fff' }} />
                </View>
              ))}
            </View>
          </Card>

          {/* Tickets / Signup (optional) */}
          {!!event.tickets && !!event.tickets.url && (
            <GradientCard colors={['#026cdf', '#0054a6']} style={s.ticketCard}>
              <View style={s.ticketHeader}>
                <View>
                  <Text style={s.ticketTitle}>Get Your Tickets</Text>
                  {!!event.tickets.startingPrice && (
                    <Text style={s.ticketSub}>Starting from {event.tickets.startingPrice} + fees</Text>
                  )}
                </View>
                <Feather name="external-link" size={20} color="#fff" />
              </View>
              {!!event.tickets.tiers && (
                <View style={s.tierRow}>
                  {event.tickets.tiers.map((tier, i) => (
                    <View key={i} style={s.tierBox}>
                      <Text style={s.tierLabel}>{tier.label}</Text>
                      <Text style={s.tierPrice}>{tier.price}</Text>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity
                style={s.ticketBtn}
                activeOpacity={0.8}
                onPress={() => Linking.openURL(event.tickets.url)}
              >
                <Text style={s.ticketBtnText}>View tickets</Text>
              </TouchableOpacity>
            </GradientCard>
          )}

          {!event.tickets && !!event.signup && !!event.signup.url && (
            <GradientCard colors={[colors.primary, colors.teal]} style={s.ticketCard}>
              <View style={s.ticketHeader}>
                <View>
                  <Text style={s.ticketTitle}>{event.signup.platform || 'Signup'}</Text>
                  <Text style={s.ticketSub}>Save your spot for this event</Text>
                </View>
                <Feather name="external-link" size={20} color="#fff" />
              </View>
              <TouchableOpacity
                style={s.ticketBtn}
                activeOpacity={0.8}
                onPress={() => Linking.openURL(event.signup.url)}
              >
                <Text style={s.ticketBtnText}>{event.signup.label || 'Sign up'}</Text>
              </TouchableOpacity>
            </GradientCard>
          )}

          {/* Most Popular Song */}
          <Card>
            {event.detailCard?.type === 'prompt' ? (
              <View style={s.songRow}>
                <View style={s.songIcon}>
                  <Feather name={event.detailCard.icon || 'message-circle'} size={22} color="#9810FA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.songLabel}>{event.detailCard.label || 'Conversation starter'}</Text>
                  <Text style={s.songTitle}>{event.detailCard.title}</Text>
                  {!!event.detailCard.subtitle && (
                    <Text style={s.songAlbum}>{event.detailCard.subtitle}</Text>
                  )}
                </View>
                <TouchableOpacity style={s.voteBtn} activeOpacity={0.8}>
                  <Text style={s.voteBtnText}>{event.detailCard.actionLabel || 'Post'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.songRow}>
                <View style={s.songIcon}>
                  <Feather name="music" size={22} color="#9810FA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.songLabel}>{event.detailCard?.label || 'Most popular song'}</Text>
                  <Text style={s.songTitle}>{event.detailCard?.title || event.popularSong?.title}</Text>
                  <TouchableOpacity onPress={() => event.detailCard?.searchUrl && Linking.openURL(event.detailCard.searchUrl)}>
                    <Text style={s.songAlbum}>{event.detailCard?.subtitle || event.popularSong?.album}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={s.voteBtn} activeOpacity={0.8}>
                  <Text style={s.voteBtnText}>{event.detailCard?.actionLabel || 'Vote'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Attendees You May Know */}
          <Card>
            <Text style={s.cardTitle}>Attendees you may know</Text>
            <FlatList
              data={MUTUAL_CONNECTIONS}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16 }}
              renderItem={({ item }) => <MutualPersonCard person={item} />}
            />
          </Card>

          {/* Who's Going */}
          <Card>
            <View style={s.goingHeader}>
              <Text style={s.goingTitle}>Who's Going</Text>
              <Text style={s.goingCount}>{attendeeCount || event.attendeeCount?.toLocaleString() || 0} attendees</Text>
            </View>
            <View style={s.attendeeGrid}>
              {(realAttendees.length > 0 ? realAttendees : []).slice(0, 5).map((a) => (
                <AttendeeCard
                  key={a.id}
                  attendee={a}
                  onPress={a.id ? () => navigation.navigate('UserProfile', { userId: a.id }) : undefined}
                />
              ))}
            </View>
            <TouchableOpacity
              style={s.seeAllBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AllAttendees')}
            >
              <Text style={s.seeAllText}>See all attendees</Text>
            </TouchableOpacity>
          </Card>

          {/* Match-based squad CTA */}
          <TouchableOpacity
            style={s.squadBtn}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('MatchGroupChat', {
                eventTitle: event.title,
                matchedAttendees: getMatchedAttendees(),
              })
            }
          >
            <LinearGradient
              colors={['#7300ff', '#00ac9b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.squadBtnGradient}
            >
              <Feather name="users" size={18} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={s.squadTitle}>Find My Squad</Text>
                <Text style={s.squadSubtitle}>Chat with your top matches for this show</Text>
              </View>
              <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Group Chats */}
          <Card style={{ marginBottom: 0 }}>
            <View style={s.groupHeader}>
              <Feather name="message-circle" size={18} color="#9810FA" />
              <Text style={[s.cardTitle, { marginBottom: 0 }]}>Group Chats</Text>
            </View>
            <Text style={s.groupSubtext}>Connect with other fans attending the event</Text>
            {(eventChats.length > 0 ? eventChats : []).map((group) => (
              <GroupChatRow
                key={group.id}
                group={group}
                onPress={() => navigation.navigate('GroupChat', { groupId: group.id, groupName: group.name })}
              />
            ))}
            {eventChats.length === 0 && (
              <Text style={s.groupSubtext}>No group chats yet for this event.</Text>
            )}
          </Card>
        </View>
      </ScrollView>

      {/* Floating Mark Event button */}
      <View style={[s.floatingBtnWrap, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[s.floatingBtn, rsvpStatus && s.floatingBtnMarked]}
          activeOpacity={0.85}
          onPress={() => setMarkModalVisible(true)}
        >
          <Feather name={rsvpStatus ? 'check-circle' : 'plus-circle'} size={18} color="#fff" />
          <Text style={s.floatingBtnText}>
            {rsvpStatus === 'going' ? 'Going' : rsvpStatus === 'maybe' ? 'Maybe' : 'Mark Event'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* RSVP Modal */}
      <Modal visible={markModalVisible} transparent animationType="fade" onRequestClose={() => setMarkModalVisible(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setMarkModalVisible(false)}>
          <View style={s.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={s.modalTitle}>Mark Event</Text>
            <Text style={s.modalSub}>Let people know you're attending</Text>

            <View style={s.rsvpOptions}>
              <TouchableOpacity
                style={[s.rsvpOption, rsvpStatus === 'going' && s.rsvpOptionActive]}
                activeOpacity={0.7}
                onPress={() => setRSVP('going')}
              >
                <View style={[s.rsvpIconCircle, rsvpStatus === 'going' && s.rsvpIconCircleActive]}>
                  <Feather name="check" size={20} color={rsvpStatus === 'going' ? '#fff' : '#7300ff'} />
                </View>
                <Text style={[s.rsvpLabel, rsvpStatus === 'going' && s.rsvpLabelActive]}>Going</Text>
                <Text style={s.rsvpDesc}>I'll be there</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.rsvpOption, rsvpStatus === 'maybe' && s.rsvpOptionMaybeActive]}
                activeOpacity={0.7}
                onPress={() => setRSVP('maybe')}
              >
                <View style={[s.rsvpIconCircle, rsvpStatus === 'maybe' && s.rsvpIconCircleMaybe]}>
                  <Feather name="help-circle" size={20} color={rsvpStatus === 'maybe' ? '#fff' : '#f59e0b'} />
                </View>
                <Text style={[s.rsvpLabel, rsvpStatus === 'maybe' && s.rsvpLabelMaybe]}>Maybe</Text>
                <Text style={s.rsvpDesc}>Not sure yet</Text>
              </TouchableOpacity>
            </View>

            <View style={s.publicRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.publicLabel}>Show on public list</Text>
                <Text style={s.publicDesc}>Your name will be visible to other attendees</Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setPublic}
                trackColor={{ false: '#e5e7eb', true: '#7300ff' }}
                thumbColor="#fff"
              />
            </View>

            <View style={s.modalActions}>
              {rsvpStatus && (
                <TouchableOpacity
                  style={s.removeBtn}
                  activeOpacity={0.7}
                  onPress={() => { setRSVP(null); setMarkModalVisible(false); }}
                >
                  <Text style={s.removeBtnText}>Remove RSVP</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[s.confirmBtn, !rsvpStatus && s.confirmBtnDisabled]}
                activeOpacity={rsvpStatus ? 0.85 : 1}
                onPress={rsvpStatus ? handleConfirmRsvp : undefined}
              >
                <Text style={s.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const CARD_HORIZONTAL = 16;

const s = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 56,
  },
  starBtn: {
    padding: 8,
  },

  banner: {
    height: 320,
    overflow: 'hidden',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 52,
    fontFamily: fonts.bold,
    lineHeight: 56,
  },
  bannerVenue: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 22,
    fontFamily: fonts.semiBold,
    marginTop: 4,
  },

  body: {
    padding: CARD_HORIZONTAL,
  },

  dateRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 14,
    paddingTop: 12,
    paddingHorizontal: CARD_HORIZONTAL,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: '#fff',
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: CARD_HORIZONTAL,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagBadgeText: {
    fontSize: 13,
    fontFamily: fonts.medium,
  },

  // Ticketmaster
  ticketCard: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ticketTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginBottom: 4,
  },
  ticketSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  tierRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tierBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tierLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontFamily: fonts.regular,
    marginBottom: 2,
  },
  tierPrice: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  ticketBtn: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  ticketBtnText: {
    color: '#026cdf',
    fontSize: 15,
    fontFamily: fonts.semiBold,
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
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 12,
  },

  // Popular song
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  songIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  songLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.regular,
    marginBottom: 2,
  },
  songTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.semiBold,
  },
  songAlbum: {
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fonts.regular,
    textDecorationLine: 'underline',
  },
  voteBtn: {
    backgroundColor: colors.teal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  voteBtnText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fonts.medium,
  },

  // People you may know
  mutualPerson: {
    alignItems: 'center',
    width: 64,
  },
  mutualName: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    marginTop: 6,
    textAlign: 'center',
  },
  mutualCount: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.regular,
    marginTop: 1,
  },

  // Who's Going
  goingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goingTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
  },
  goingCount: {
    color: colors.textTertiary,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  attendeeGrid: {
    gap: 8,
  },
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
  },
  attendeeCardMatch: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.purpleLight,
  },
  attendeeCardCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  attendeeCardMaybe: {
    opacity: 0.6,
  },
  attendeeAvatarWrap: {
    position: 'relative',
  },
  sparkBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeName: {
    color: '#101828',
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },
  attendeeNameCompact: {
    color: '#101828',
    fontSize: 15,
    fontFamily: fonts.medium,
    flex: 1,
  },
  attendeeSub: {
    color: '#4a5565',
    fontSize: 11,
    fontFamily: fonts.regular,
    marginTop: 1,
  },
  attendeeMaybeLabel: {
    color: '#4a5565',
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  // Friends Going
  friendsGoingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  friendsGoingLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#101828',
  },
  friendsGoingAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  seeAllBtn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  seeAllText: {
    color: '#9810FA',
    fontSize: 14,
    fontFamily: fonts.medium,
  },

  // Match-based squad button
  squadBtn: {
    marginTop: 8,
    marginBottom: 12,
  },
  squadBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  squadTitle: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },
  squadSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontFamily: fonts.regular,
  },

  // Group chats
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  groupSubtext: {
    color: '#4a5565',
    fontSize: 13,
    fontFamily: fonts.regular,
    marginBottom: 14,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
    gap: 12,
  },
  groupRowHighlight: {
    borderColor: '#7300ff',
    backgroundColor: '#f8f3ff',
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIconText: {
    fontSize: 20,
  },
  groupInfo: {
    flex: 1,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 3,
  },
  groupName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#101828',
    flexShrink: 1,
  },
  groupDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },
  groupMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupMemberCount: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#4a5565',
  },

  // Floating button
  floatingBtnWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(115,0,255,0.9)',
  },
  floatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7300ff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  floatingBtnMarked: {
    backgroundColor: '#00ac9b',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  floatingBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginBottom: 24,
  },
  rsvpOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  rsvpOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    gap: 8,
  },
  rsvpOptionActive: {
    borderColor: '#7300ff',
    backgroundColor: '#f8f3ff',
  },
  rsvpOptionMaybeActive: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  rsvpIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rsvpIconCircleActive: {
    backgroundColor: '#7300ff',
  },
  rsvpIconCircleMaybe: {
    backgroundColor: '#f59e0b',
  },
  rsvpLabel: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#101828',
  },
  rsvpLabelActive: {
    color: '#7300ff',
  },
  rsvpLabelMaybe: {
    color: '#f59e0b',
  },
  rsvpDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },

  publicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 20,
    gap: 12,
  },
  publicLabel: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: '#101828',
    marginBottom: 2,
  },
  publicDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#4a5565',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  removeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ef4444',
  },
  removeBtnText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#ef4444',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#7300ff',
  },
  confirmBtnDisabled: {
    backgroundColor: '#d1d5db',
  },
  confirmBtnText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#fff',
  },
});
