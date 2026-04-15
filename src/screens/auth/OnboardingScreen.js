import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';
import { PROFILE_PROMPTS, MAX_PROMPTS, getPromptById } from '../../data/profilePrompts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 5;

const INTEREST_OPTIONS = [
  'Music Festivals', 'Concerts', 'Sports', 'Nightlife',
  'Art & Culture', 'Food & Dining', 'Technology', 'Networking',
  'Fitness & Outdoors', 'Film & Cinema', 'Gaming', 'Comedy',
  'Fashion', 'Travel', 'Photography', 'Volunteering',
];

const CLASS_YEARS = ['2025', '2026', '2027', '2028', '2029'];
const AGE_RANGES = ['18-20', '21-24', '25-30', '30+'];

const SOCIAL_PLATFORMS = [
  { key: 'instagram', icon: 'instagram', label: 'Instagram', placeholder: '@username', color: colors.instagram },
  { key: 'twitter', icon: 'twitter', label: 'X / Twitter', placeholder: '@handle', color: colors.twitter },
  { key: 'spotify', icon: 'music', label: 'Spotify', placeholder: 'username', color: colors.spotify },
  { key: 'linkedin', icon: 'linkedin', label: 'LinkedIn', placeholder: 'profile-slug', color: colors.linkedin },
];

// ─── Reusable sub-components ────────────────────────────────────────

function ProgressDots({ current, total }) {
  return (
    <View style={s.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            s.dot,
            i === current && s.dotActive,
            i < current && s.dotDone,
          ]}
        />
      ))}
    </View>
  );
}

function PillSelect({ options, selected, onToggle, multi = true }) {
  return (
    <View style={s.pillGrid}>
      {options.map((opt) => {
        const isSelected = multi ? selected.includes(opt) : selected === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[s.pill, isSelected && s.pillSelected]}
            activeOpacity={0.7}
            onPress={() => onToggle(opt)}
          >
            {isSelected && <Feather name="check" size={14} color="#fff" style={{ marginRight: 4 }} />}
            <Text style={[s.pillText, isSelected && s.pillTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SocialInput({ platform, value, onChange }) {
  return (
    <View style={s.socialRow}>
      <View style={[s.socialIcon, { backgroundColor: platform.color }]}>
        <Feather name={platform.icon} size={16} color="#fff" />
      </View>
      <TextInput
        style={s.socialInput}
        placeholder={platform.placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

// ─── Step components ────────────────────────────────────────────────

function StepBasicInfo({ data, setData }) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setData({ ...data, avatarUri: result.assets[0].uri });
    }
  };

  return (
    <>
      <Text style={s.stepTitle}>Let's set up your profile</Text>
      <Text style={s.stepSub}>This is how others will see you on Wavelength</Text>

      <TouchableOpacity style={s.avatarPicker} onPress={pickImage} activeOpacity={0.8}>
        {data.avatarUri ? (
          <Image source={{ uri: data.avatarUri }} style={s.avatarImage} />
        ) : (
          <View style={s.avatarPlaceholder}>
            <Feather name="camera" size={28} color={colors.primary} />
            <Text style={s.avatarPlaceholderText}>Add photo</Text>
          </View>
        )}
        <View style={s.avatarEditBadge}>
          <Feather name="edit-2" size={12} color="#fff" />
        </View>
      </TouchableOpacity>

      <View style={s.inputWrapper}>
        <Feather name="user" size={18} color={colors.textMuted} style={s.inputIcon} />
        <TextInput
          style={s.input}
          placeholder="Display name"
          placeholderTextColor={colors.textTertiary}
          value={data.displayName}
          onChangeText={(v) => setData({ ...data, displayName: v })}
          autoCapitalize="words"
        />
      </View>

      <View style={s.inputWrapper}>
        <Feather name="map-pin" size={18} color={colors.textMuted} style={s.inputIcon} />
        <TextInput
          style={s.input}
          placeholder="Location (e.g. Seattle, WA)"
          placeholderTextColor={colors.textTertiary}
          value={data.location}
          onChangeText={(v) => setData({ ...data, location: v })}
        />
      </View>

      <Text style={s.fieldLabel}>Age range</Text>
      <PillSelect
        options={AGE_RANGES}
        selected={data.ageRange}
        onToggle={(v) => setData({ ...data, ageRange: v })}
        multi={false}
      />
    </>
  );
}

function StepUWInfo({ data, setData }) {
  const addClub = () => {
    if (data.clubInput.trim()) {
      setData({
        ...data,
        clubs: [...data.clubs, data.clubInput.trim()],
        clubInput: '',
      });
    }
  };

  const removeClub = (idx) => {
    setData({ ...data, clubs: data.clubs.filter((_, i) => i !== idx) });
  };

  return (
    <>
      <View style={s.stepIconRow}>
        <Text style={s.stepEmoji}>🎓</Text>
      </View>
      <Text style={s.stepTitle}>University of Washington</Text>
      <Text style={s.stepSub}>Help other Huskies find you</Text>

      <Text style={s.fieldLabel}>Class year</Text>
      <PillSelect
        options={CLASS_YEARS}
        selected={data.classYear}
        onToggle={(v) => setData({ ...data, classYear: v })}
        multi={false}
      />

      <View style={s.inputWrapper}>
        <Feather name="book-open" size={18} color={colors.textMuted} style={s.inputIcon} />
        <TextInput
          style={s.input}
          placeholder="Major (e.g. Computer Science)"
          placeholderTextColor={colors.textTertiary}
          value={data.major}
          onChangeText={(v) => setData({ ...data, major: v })}
        />
      </View>

      <Text style={s.fieldLabel}>Clubs & organizations</Text>
      <View style={s.clubInputRow}>
        <View style={[s.inputWrapper, { flex: 1 }]}>
          <Feather name="users" size={18} color={colors.textMuted} style={s.inputIcon} />
          <TextInput
            style={s.input}
            placeholder="Add a club..."
            placeholderTextColor={colors.textTertiary}
            value={data.clubInput}
            onChangeText={(v) => setData({ ...data, clubInput: v })}
            onSubmitEditing={addClub}
            returnKeyType="done"
          />
        </View>
        <TouchableOpacity style={s.addClubBtn} onPress={addClub}>
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {data.clubs.length > 0 && (
        <View style={s.clubChips}>
          {data.clubs.map((club, idx) => (
            <View key={idx} style={s.clubChip}>
              <Text style={s.clubChipText}>{club}</Text>
              <TouchableOpacity onPress={() => removeClub(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

function StepInterests({ data, setData }) {
  const toggle = (interest) => {
    const current = data.interests;
    if (current.includes(interest)) {
      setData({ ...data, interests: current.filter((i) => i !== interest) });
    } else {
      setData({ ...data, interests: [...current, interest] });
    }
  };

  return (
    <>
      <Text style={s.stepTitle}>What are you into?</Text>
      <Text style={s.stepSub}>Pick at least 3 — we'll find events you'll love</Text>

      <PillSelect options={INTEREST_OPTIONS} selected={data.interests} onToggle={toggle} />

      {data.interests.length > 0 && data.interests.length < 3 && (
        <Text style={s.hintText}>Pick {3 - data.interests.length} more</Text>
      )}
    </>
  );
}

function PromptAnswerInput({ prompt, answer, onChange }) {
  if (prompt.type === 'text') {
    return (
      <View style={s.bioWrapper}>
        <TextInput
          style={s.bioInput}
          placeholder={`${prompt.label}...`}
          placeholderTextColor={colors.textTertiary}
          value={answer || ''}
          onChangeText={onChange}
          multiline
          maxLength={prompt.maxLength || 200}
          textAlignVertical="top"
        />
        <Text style={s.bioCount}>{(answer || '').length}/{prompt.maxLength || 200}</Text>
      </View>
    );
  }
  if (prompt.type === 'anthem') {
    const val = answer || { title: '', artist: '', url: '' };
    return (
      <View style={{ gap: 10 }}>
        <View style={s.inputWrapper}>
          <Feather name="music" size={18} color={colors.textMuted} style={s.inputIcon} />
          <TextInput
            style={s.input}
            placeholder="Song title"
            placeholderTextColor={colors.textTertiary}
            value={val.title}
            onChangeText={(v) => onChange({ ...val, title: v })}
          />
        </View>
        <View style={s.inputWrapper}>
          <Feather name="user" size={18} color={colors.textMuted} style={s.inputIcon} />
          <TextInput
            style={s.input}
            placeholder="Artist"
            placeholderTextColor={colors.textTertiary}
            value={val.artist}
            onChangeText={(v) => onChange({ ...val, artist: v })}
          />
        </View>
        <View style={s.inputWrapper}>
          <Feather name="link" size={18} color={colors.textMuted} style={s.inputIcon} />
          <TextInput
            style={s.input}
            placeholder="Spotify link (optional)"
            placeholderTextColor={colors.textTertiary}
            value={val.url}
            onChangeText={(v) => onChange({ ...val, url: v })}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
      </View>
    );
  }
  // list type (e.g. top events)
  const items = answer || [];
  const maxItems = prompt.maxItems || 3;
  const updateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };
  const addItem = () => {
    if (items.length < maxItems) {
      onChange([...items, { emoji: '', title: '', desc: '' }]);
    }
  };
  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <View style={{ gap: 12 }}>
      {items.map((item, idx) => (
        <View key={idx} style={s.listItemCard}>
          <View style={s.listItemHeader}>
            <TextInput
              style={s.listEmojiInput}
              placeholder="🎵"
              placeholderTextColor={colors.textTertiary}
              value={item.emoji}
              onChangeText={(v) => updateItem(idx, 'emoji', v)}
              maxLength={2}
            />
            <View style={{ flex: 1 }}>
              <TextInput
                style={s.listTitleInput}
                placeholder="Event name"
                placeholderTextColor={colors.textTertiary}
                value={item.title}
                onChangeText={(v) => updateItem(idx, 'title', v)}
              />
              <TextInput
                style={s.listDescInput}
                placeholder="Short memory..."
                placeholderTextColor={colors.textTertiary}
                value={item.desc}
                onChangeText={(v) => updateItem(idx, 'desc', v)}
                maxLength={80}
              />
            </View>
            <TouchableOpacity onPress={() => removeItem(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      {items.length < maxItems && (
        <TouchableOpacity style={s.addListItemBtn} onPress={addItem}>
          <Feather name="plus" size={16} color={colors.primary} />
          <Text style={s.addListItemText}>Add item ({items.length}/{maxItems})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function StepBioSocial({ data, setData }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const selectedPrompts = data.prompts || [];

  const addPrompt = (promptId) => {
    if (selectedPrompts.length >= MAX_PROMPTS) return;
    if (selectedPrompts.some((p) => p.id === promptId)) return;
    setData({ ...data, prompts: [...selectedPrompts, { id: promptId, answer: null }] });
    setPickerOpen(false);
  };

  const removePrompt = (idx) => {
    setData({ ...data, prompts: selectedPrompts.filter((_, i) => i !== idx) });
  };

  const updateAnswer = (idx, answer) => {
    const updated = [...selectedPrompts];
    updated[idx] = { ...updated[idx], answer };
    setData({ ...data, prompts: updated });
  };

  const availablePrompts = PROFILE_PROMPTS.filter(
    (p) => !selectedPrompts.some((s) => s.id === p.id)
  );

  return (
    <>
      <Text style={s.stepTitle}>Make your profile yours</Text>
      <Text style={s.stepSub}>Pick up to {MAX_PROMPTS} prompts — like Hinge, but for events</Text>

      {selectedPrompts.map((sp, idx) => {
        const promptDef = getPromptById(sp.id);
        if (!promptDef) return null;
        return (
          <View key={sp.id} style={s.promptCard}>
            <View style={s.promptCardHeader}>
              <Feather name={promptDef.icon} size={16} color={colors.primary} />
              <Text style={s.promptCardLabel}>{promptDef.label}</Text>
              <TouchableOpacity onPress={() => removePrompt(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x-circle" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
            <PromptAnswerInput prompt={promptDef} answer={sp.answer} onChange={(val) => updateAnswer(idx, val)} />
          </View>
        );
      })}

      {selectedPrompts.length < MAX_PROMPTS && (
        <>
          <TouchableOpacity style={s.addPromptBtn} onPress={() => setPickerOpen(!pickerOpen)} activeOpacity={0.7}>
            <Feather name={pickerOpen ? 'chevron-up' : 'plus'} size={18} color="#fff" />
            <Text style={s.addPromptText}>
              {pickerOpen ? 'Close' : `Add a prompt (${selectedPrompts.length}/${MAX_PROMPTS})`}
            </Text>
          </TouchableOpacity>

          {pickerOpen && (
            <View style={s.promptPicker}>
              {availablePrompts.map((p) => (
                <TouchableOpacity key={p.id} style={s.promptPickerItem} onPress={() => addPrompt(p.id)} activeOpacity={0.7}>
                  <Feather name={p.icon} size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={s.promptPickerText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      <Text style={[s.fieldLabel, { marginTop: 24 }]}>Social links</Text>
      {SOCIAL_PLATFORMS.map((p) => (
        <SocialInput
          key={p.key}
          platform={p}
          value={data.socials[p.key] || ''}
          onChange={(v) => setData({ ...data, socials: { ...data.socials, [p.key]: v } })}
        />
      ))}
    </>
  );
}

function StepReview({ data }) {
  return (
    <>
      <View style={s.reviewAvatarWrap}>
        {data.avatarUri ? (
          <Image source={{ uri: data.avatarUri }} style={s.reviewAvatar} />
        ) : (
          <View style={[s.reviewAvatar, s.reviewAvatarPlaceholder]}>
            <Feather name="user" size={36} color={colors.primary} />
          </View>
        )}
        <View style={s.reviewVerified}>
          <Feather name="check" size={12} color="#fff" />
        </View>
      </View>

      <Text style={s.reviewName}>{data.displayName || 'Your Name'}</Text>
      {!!data.location && (
        <View style={s.reviewMeta}>
          <Feather name="map-pin" size={13} color="rgba(255,255,255,0.7)" />
          <Text style={s.reviewMetaText}>{data.location}</Text>
          {!!data.ageRange && <Text style={s.reviewMetaText}> · {data.ageRange}</Text>}
        </View>
      )}

      {(!!data.classYear || !!data.major) && (
        <View style={s.reviewCard}>
          <Text style={s.reviewCardEmoji}>🎓</Text>
          <View>
            {!!data.classYear && <Text style={s.reviewCardText}>Class of {data.classYear}</Text>}
            {!!data.major && <Text style={s.reviewCardSub}>{data.major}</Text>}
          </View>
        </View>
      )}

      {data.interests.length > 0 && (
        <View style={s.reviewChips}>
          {data.interests.slice(0, 6).map((i) => (
            <View key={i} style={s.reviewChip}>
              <Text style={s.reviewChipText}>{i}</Text>
            </View>
          ))}
          {data.interests.length > 6 && (
            <View style={s.reviewChip}>
              <Text style={s.reviewChipText}>+{data.interests.length - 6}</Text>
            </View>
          )}
        </View>
      )}

      {data.prompts.length > 0 && (
        <View style={s.reviewCard}>
          <Text style={s.reviewCardEmoji}>💬</Text>
          <View>
            <Text style={s.reviewCardText}>{data.prompts.length} prompt{data.prompts.length !== 1 ? 's' : ''} added</Text>
            <Text style={s.reviewCardSub}>
              {data.prompts.map((p) => getPromptById(p.id)?.label).filter(Boolean).join(', ')}
            </Text>
          </View>
        </View>
      )}

      <Text style={s.reviewReady}>You're all set! 🎉</Text>
      <Text style={s.reviewReadySub}>You can always edit your profile later</Text>
    </>
  );
}

// ─── Main onboarding screen ─────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { user, refreshProfile } = useAuth();
  const scrollRef = useRef(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    displayName: user?.user_metadata?.full_name || '',
    avatarUri: null,
    location: '',
    ageRange: '',
    classYear: '',
    major: '',
    clubs: [],
    clubInput: '',
    interests: [],
    prompts: [],
    socials: {},
  });

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      scrollToTop();
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
      scrollToTop();
    }
  };

  const canAdvance = () => {
    switch (step) {
      case 0: return !!data.displayName.trim();
      case 1: return true; // UW info is optional
      case 2: return data.interests.length >= 3;
      case 3: return true; // Bio/social is optional
      case 4: return true; // Review
      default: return true;
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Build social links array
      const socialLinks = SOCIAL_PLATFORMS
        .filter((p) => data.socials[p.key]?.trim())
        .map((p) => ({
          icon: p.icon,
          color: p.color,
          label: data.socials[p.key].trim(),
          url: '',
        }));

      // Filter prompts to only those with non-empty answers
      const prompts = (data.prompts || []).filter((p) => {
        if (!p.answer) return false;
        if (typeof p.answer === 'string') return p.answer.trim().length > 0;
        if (Array.isArray(p.answer)) return p.answer.some((i) => i.title?.trim());
        if (typeof p.answer === 'object') return p.answer.title?.trim();
        return false;
      });

      const updates = {
        full_name: data.displayName.trim(),
        location: data.location.trim() || null,
        age_range: data.ageRange || null,
        class_year: data.classYear ? parseInt(data.classYear, 10) : null,
        major: data.major.trim() || null,
        interests: data.interests,
        extras: {
          prompts,
          clubs: data.clubs,
          social_links: socialLinks,
        },
        updated_at: new Date().toISOString(),
      };

      // Upload avatar if selected
      if (data.avatarUri) {
        const ext = data.avatarUri.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${user.id}/avatar.${ext}`;
        const response = await fetch(data.avatarUri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
          updates.avatar_url = urlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Mark onboarding complete
      await supabase
        .from('profiles')
        .update({ settings: { onboarding_complete: true } })
        .eq('id', user.id);

      // Refresh profile so navigator switches to main app
      await refreshProfile();

    } catch (err) {
      Alert.alert('Error', err.message || 'Could not save profile. Please try again.');
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <StepBasicInfo data={data} setData={setData} />;
      case 1: return <StepUWInfo data={data} setData={setData} />;
      case 2: return <StepInterests data={data} setData={setData} />;
      case 3: return <StepBioSocial data={data} setData={setData} />;
      case 4: return <StepReview data={data} />;
      default: return null;
    }
  };

  const isLast = step === TOTAL_STEPS - 1;
  const isFirst = step === 0;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#6610f2', '#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.flex}
      >
        {/* Top bar */}
        <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
          {!isFirst ? (
            <TouchableOpacity onPress={goBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 22 }} />
          )}
          <ProgressDots current={step} total={TOTAL_STEPS} />
          {!isLast && step > 0 ? (
            <TouchableOpacity onPress={goNext}>
              <Text style={s.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        {/* Bottom button */}
        <View style={[s.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[s.nextBtn, !canAdvance() && s.nextBtnDisabled]}
            onPress={isLast ? handleFinish : goNext}
            disabled={!canAdvance() || saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={s.nextBtnText}>{isLast ? "Let's go" : 'Continue'}</Text>
                {!isLast && <Feather name="arrow-right" size={18} color="#fff" style={{ marginLeft: 6 }} />}
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  skipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  dotDone: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },

  // Content
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  // Step titles
  stepIconRow: { alignItems: 'center', marginBottom: 8 },
  stepEmoji: { fontSize: 40 },
  stepTitle: {
    color: '#fff',
    fontSize: 26,
    fontFamily: fonts.bold,
    marginBottom: 6,
  },
  stepSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontFamily: fonts.regular,
    marginBottom: 24,
    lineHeight: 22,
  },

  // Fields
  fieldLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontFamily: fonts.semiBold,
    marginTop: 18,
    marginBottom: 10,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },

  // Avatar picker
  avatarPicker: {
    alignSelf: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },
  avatarPlaceholderText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.medium,
    marginTop: 4,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Pills
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  pillTextSelected: {
    color: '#fff',
  },
  hintText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 12,
    textAlign: 'center',
  },

  // Clubs
  clubInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addClubBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  clubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  clubChipText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fonts.medium,
  },

  // Bio
  bioWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    minHeight: 120,
  },
  bioInput: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
    minHeight: 80,
  },
  bioCount: {
    color: colors.textTertiary,
    fontSize: 12,
    fontFamily: fonts.regular,
    textAlign: 'right',
    marginTop: 4,
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.text,
  },

  // Prompt cards
  promptCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  promptCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  promptCardLabel: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },
  addPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addPromptText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  promptPicker: {
    gap: 6,
    marginBottom: 8,
  },
  promptPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
  },
  promptPickerText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  listItemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  listEmojiInput: {
    width: 36,
    fontSize: 22,
    textAlign: 'center',
    paddingTop: 2,
  },
  listTitleInput: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.text,
    paddingVertical: 0,
    marginBottom: 4,
  },
  listDescInput: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    paddingVertical: 0,
  },
  addListItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(115,0,255,0.08)',
  },
  addListItemText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: fonts.medium,
  },

  // Review
  reviewAvatarWrap: {
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  reviewAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  reviewAvatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewVerified: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  reviewName: {
    color: '#fff',
    fontSize: 24,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 20,
  },
  reviewMetaText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewCardEmoji: { fontSize: 24 },
  reviewCardText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },
  reviewCardSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  reviewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  reviewChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  reviewChipText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  reviewReady: {
    color: '#fff',
    fontSize: 22,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginTop: 8,
  },
  reviewReadySub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: 6,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  nextBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: fonts.semiBold,
  },
});
