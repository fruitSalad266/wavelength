import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { fonts } from '../theme/fonts';
import { colors } from '../theme/colors';

function ReasonRow({ icon, label }) {
  return (
    <View style={s.reasonRow}>
      <View style={s.reasonIcon}>
        <Feather name={icon} size={15} color={colors.primary} />
      </View>
      <Text style={s.reasonText}>{label}</Text>
    </View>
  );
}

/**
 * Renders a small match % bubble on a user avatar.
 * Tapping it opens a modal explaining why they matched.
 *
 * Props:
 *   score      – number (0–100), only renders if >= 80
 *   breakdown  – object from calculateMatchScore
 *   name       – the other user's first name (for the modal title)
 */
export function MatchBadge({ score, breakdown, name }) {
  const [visible, setVisible] = useState(false);

  if (!score || score < 80 || !breakdown) return null;

  const firstName = name ? name.split(' ')[0] : 'them';

  const reasons = [];
  if (breakdown.sharedInterests?.length > 0) {
    reasons.push({
      icon: 'heart',
      label: `Shared interests: ${breakdown.sharedInterests.join(', ')}`,
    });
  }
  if (breakdown.sameMajor && breakdown.major) {
    reasons.push({ icon: 'book-open', label: `Same major: ${breakdown.major}` });
  }
  if (breakdown.sameYear && breakdown.classYear) {
    reasons.push({ icon: 'calendar', label: `Same class year: ${breakdown.classYear}` });
  }
  if (breakdown.sharedClubs?.length > 0) {
    reasons.push({
      icon: 'users',
      label: `Shared clubs: ${breakdown.sharedClubs.join(', ')}`,
    });
  }
  if (breakdown.mutualFriendCount > 0) {
    reasons.push({
      icon: 'user-check',
      label: `${breakdown.mutualFriendCount} mutual friend${breakdown.mutualFriendCount > 1 ? 's' : ''}`,
    });
  }

  return (
    <>
      <TouchableOpacity
        style={s.badge}
        activeOpacity={0.85}
        onPress={() => setVisible(true)}
      >
        <LinearGradient
          colors={['#7300ff', '#00ac9b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.badgeGradient}
        >
          <Text style={s.badgeText}>{score}%</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={s.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={s.modal} onStartShouldSetResponder={() => true}>
            <LinearGradient
              colors={['#7300ff', '#00ac9b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.modalHeader}
            >
              <Text style={s.modalScore}>{score}% Match</Text>
              <Text style={s.modalSub}>Why you and {firstName} vibe</Text>
            </LinearGradient>

            <View style={s.reasonsList}>
              {reasons.length > 0 ? (
                reasons.map((r, i) => (
                  <ReasonRow key={i} icon={r.icon} label={r.label} />
                ))
              ) : (
                <Text style={s.noReasons}>You two share similar vibes!</Text>
              )}
            </View>

            <TouchableOpacity style={s.closeBtn} onPress={() => setVisible(false)}>
              <Text style={s.closeBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    zIndex: 10,
  },
  badgeGradient: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#fff',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modal: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  modalScore: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: '#fff',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.85)',
  },
  reasonsList: {
    padding: 20,
    gap: 14,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  reasonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
    paddingTop: 6,
  },
  noReasons: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 8,
  },
  closeBtn: {
    margin: 16,
    marginTop: 0,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#fff',
  },
});
