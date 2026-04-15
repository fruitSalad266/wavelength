import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

function SectionTitle({ text }) {
  return <Text style={s.sectionTitle}>{text}</Text>;
}

function Label({ text }) {
  return <Text style={s.label}>{text}</Text>;
}

function Input({ value, onChangeText, placeholder, multiline, numberOfLines, keyboardType, maxLength }) {
  return (
    <TextInput
      style={[s.input, multiline && { height: numberOfLines ? numberOfLines * 22 : 88, textAlignVertical: 'top', paddingTop: 12 }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={keyboardType}
      maxLength={maxLength}
    />
  );
}

function ToggleRow({ title, subtitle, value, onValueChange }) {
  return (
    <View style={s.toggleRow}>
      <View style={s.toggleInfo}>
        <Text style={s.toggleTitle}>{title}</Text>
        {subtitle && <Text style={s.toggleSub}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e5e7eb', true: '#7300ff' }}
        thumbColor="#fff"
      />
    </View>
  );
}

function PickerRow({ label, value, options, onSelect }) {
  return (
    <View style={s.pickerGroup}>
      <Label text={label} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pickerOptions}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[s.pickerPill, value === opt.value && s.pickerPillActive]}
            onPress={() => onSelect(opt.value)}
          >
            <Text style={[s.pickerPillText, value === opt.value && s.pickerPillTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function PillMultiSelect({ options, selected, onToggle }) {
  return (
    <View style={s.categoryGrid}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            style={[s.categoryChip, active && s.categoryChipActive]}
            onPress={() => onToggle(opt)}
          >
            {active && <Feather name="check" size={13} color="#fff" style={{ marginRight: 4 }} />}
            <Text style={[s.categoryChipText, active && s.categoryChipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tab definitions & constants
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'prompts', label: 'Prompts', icon: 'message-circle' },
  { id: 'privacy', label: 'Privacy', icon: 'lock' },
  { id: 'notifications', label: 'Alerts', icon: 'bell' },
  { id: 'events', label: 'Events', icon: 'calendar' },
];

const VISIBILITY_OPTIONS = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'friends', label: 'Friends Only' },
  { value: 'private', label: 'Only Me' },
];

const MESSAGE_OPTIONS = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'friends', label: 'Friends Only' },
  { value: 'nobody', label: 'Nobody' },
];

const AGE_OPTIONS = [
  { value: '18-20', label: '18-20' },
  { value: '21-24', label: '21-24' },
  { value: '25-30', label: '25-30' },
  { value: '30+', label: '30+' },
];

const CLASS_YEARS = ['2025', '2026', '2027', '2028', '2029'];

const INTEREST_OPTIONS = [
  'Music Festivals', 'Concerts', 'Sports', 'Nightlife',
  'Art & Culture', 'Food & Dining', 'Technology', 'Networking',
  'Fitness & Outdoors', 'Film & Cinema', 'Gaming', 'Comedy',
  'Fashion', 'Travel', 'Photography', 'Volunteering',
];

const RADIUS_OPTIONS = [
  { value: '10', label: '10 mi' },
  { value: '25', label: '25 mi' },
  { value: '50', label: '50 mi' },
  { value: '100', label: '100 mi' },
  { value: 'unlimited', label: 'Any' },
];

const SOCIAL_PLATFORMS = [
  { key: 'instagram', icon: 'instagram', label: 'Instagram', placeholder: '@username', color: colors.instagram },
  { key: 'twitter', icon: 'twitter', label: 'X / Twitter', placeholder: '@handle', color: colors.twitter },
  { key: 'spotify', icon: 'music', label: 'Spotify', placeholder: 'username', color: colors.spotify },
  { key: 'linkedin', icon: 'linkedin', label: 'LinkedIn', placeholder: 'profile-slug', color: colors.linkedin },
];

// ---------------------------------------------------------------------------
// Prompt editor (Hinge-style)
// ---------------------------------------------------------------------------

function PromptAnswerEditor({ prompt, answer, onChange }) {
  if (prompt.type === 'text') {
    return (
      <Input
        value={answer || ''}
        onChangeText={onChange}
        placeholder={`${prompt.label}...`}
        multiline
        numberOfLines={3}
        maxLength={prompt.maxLength || 200}
      />
    );
  }

  if (prompt.type === 'anthem') {
    const val = answer || { title: '', artist: '', url: '' };
    return (
      <View style={{ gap: 8 }}>
        <Input value={val.title} onChangeText={(v) => onChange({ ...val, title: v })} placeholder="Song title" />
        <Input value={val.artist} onChangeText={(v) => onChange({ ...val, artist: v })} placeholder="Artist" />
        <Input value={val.url} onChangeText={(v) => onChange({ ...val, url: v })} placeholder="Spotify link (optional)" keyboardType="url" />
      </View>
    );
  }

  // list type
  const items = answer || [];
  const maxItems = prompt.maxItems || 3;
  const updateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };
  const addItem = () => {
    if (items.length < maxItems) onChange([...items, { emoji: '', title: '', desc: '' }]);
  };
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <View style={{ gap: 8 }}>
      {items.map((item, idx) => (
        <View key={idx} style={s.listItemRow}>
          <Input value={item.emoji} onChangeText={(v) => updateItem(idx, 'emoji', v)} placeholder="🎵" maxLength={2} />
          <View style={{ flex: 1, gap: 4 }}>
            <Input value={item.title} onChangeText={(v) => updateItem(idx, 'title', v)} placeholder="Event name" />
            <Input value={item.desc} onChangeText={(v) => updateItem(idx, 'desc', v)} placeholder="Short memory..." maxLength={80} />
          </View>
          <TouchableOpacity onPress={() => removeItem(idx)} style={{ padding: 6 }}>
            <Feather name="x" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      ))}
      {items.length < maxItems && (
        <TouchableOpacity style={s.addListBtn} onPress={addItem}>
          <Feather name="plus" size={14} color={colors.primary} />
          <Text style={s.addListBtnText}>Add item ({items.length}/{maxItems})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tab content components
// ---------------------------------------------------------------------------

function ProfileTab({ data, setData, avatarUri, onPickAvatar }) {
  const toggleInterest = (interest) => {
    const current = data.interests || [];
    if (current.includes(interest)) {
      setData({ ...data, interests: current.filter((i) => i !== interest) });
    } else {
      setData({ ...data, interests: [...current, interest] });
    }
  };

  const addClub = () => {
    if (data.clubInput?.trim()) {
      setData({
        ...data,
        clubs: [...(data.clubs || []), data.clubInput.trim()],
        clubInput: '',
      });
    }
  };

  const removeClub = (idx) => {
    setData({ ...data, clubs: data.clubs.filter((_, i) => i !== idx) });
  };

  const updateSocial = (key, value) => {
    setData({ ...data, socials: { ...data.socials, [key]: value } });
  };

  return (
    <View>
      <Text style={s.tabHeading}>Edit Profile</Text>

      <Card>
        <SectionTitle text="Profile Picture" />
        <View style={s.avatarRow}>
          <View style={s.avatarCircle}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={s.avatarImage} />
            ) : (
              <Feather name="user" size={32} color="#7300ff" />
            )}
          </View>
          <TouchableOpacity style={s.uploadBtn} activeOpacity={0.8} onPress={onPickAvatar}>
            <Feather name="upload" size={15} color="#fff" />
            <Text style={s.uploadBtnText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card>
        <SectionTitle text="Basic Information" />
        <Label text="Display Name" />
        <Input value={data.name} onChangeText={(v) => setData({ ...data, name: v })} placeholder="Your name" />

        <Label text="Location" />
        <Input value={data.location} onChangeText={(v) => setData({ ...data, location: v })} placeholder="City, State" />

        <Label text="Age Range" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pickerOptions}>
          {AGE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[s.pickerPill, data.ageRange === opt.value && s.pickerPillActive]}
              onPress={() => setData({ ...data, ageRange: opt.value })}
            >
              <Text style={[s.pickerPillText, data.ageRange === opt.value && s.pickerPillTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>

      <Card>
        <SectionTitle text="University of Washington" />
        <Label text="Class Year" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pickerOptions}>
          {CLASS_YEARS.map((yr) => (
            <TouchableOpacity
              key={yr}
              style={[s.pickerPill, data.classYear === yr && s.pickerPillActive]}
              onPress={() => setData({ ...data, classYear: yr })}
            >
              <Text style={[s.pickerPillText, data.classYear === yr && s.pickerPillTextActive]}>{yr}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Label text="Major" />
        <Input value={data.major} onChangeText={(v) => setData({ ...data, major: v })} placeholder="e.g. Computer Science" />

        <Label text="Clubs & Organizations" />
        <View style={s.clubInputRow}>
          <View style={{ flex: 1 }}>
            <Input
              value={data.clubInput}
              onChangeText={(v) => setData({ ...data, clubInput: v })}
              placeholder="Add a club..."
            />
          </View>
          <TouchableOpacity style={s.addClubBtn} onPress={addClub}>
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        {(data.clubs || []).length > 0 && (
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
      </Card>

      <Card>
        <SectionTitle text="Interests" />
        <Text style={s.cardSubtext}>Pick at least 3 to help find events you'll love</Text>
        <PillMultiSelect options={INTEREST_OPTIONS} selected={data.interests || []} onToggle={toggleInterest} />
      </Card>

      <Card>
        <SectionTitle text="Social Links" />
        {SOCIAL_PLATFORMS.map((p) => (
          <View key={p.key} style={s.socialEditRow}>
            <View style={[s.socialIcon, { backgroundColor: p.color }]}>
              <Feather name={p.icon} size={14} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                value={data.socials?.[p.key] || ''}
                onChangeText={(v) => updateSocial(p.key, v)}
                placeholder={p.placeholder}
              />
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

function PromptsTab({ prompts, setPrompts }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const addPrompt = (promptId) => {
    if (prompts.length >= MAX_PROMPTS) return;
    if (prompts.some((p) => p.id === promptId)) return;
    setPrompts([...prompts, { id: promptId, answer: null }]);
    setPickerOpen(false);
  };

  const removePrompt = (idx) => {
    setPrompts(prompts.filter((_, i) => i !== idx));
  };

  const updateAnswer = (idx, answer) => {
    const updated = [...prompts];
    updated[idx] = { ...updated[idx], answer };
    setPrompts(updated);
  };

  const availablePrompts = PROFILE_PROMPTS.filter(
    (p) => !prompts.some((s) => s.id === p.id)
  );

  return (
    <View>
      <Text style={s.tabHeading}>Profile Prompts</Text>
      <Text style={s.tabSubheading}>Pick up to {MAX_PROMPTS} prompts to show on your profile</Text>

      {prompts.map((sp, idx) => {
        const def = getPromptById(sp.id);
        if (!def) return null;
        return (
          <Card key={sp.id}>
            <View style={s.promptCardHeader}>
              <Feather name={def.icon} size={16} color={colors.primary} />
              <Text style={[s.sectionTitle, { flex: 1, marginBottom: 0 }]}>{def.label}</Text>
              <TouchableOpacity onPress={() => removePrompt(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="trash-2" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 12 }}>
              <PromptAnswerEditor prompt={def} answer={sp.answer} onChange={(val) => updateAnswer(idx, val)} />
            </View>
          </Card>
        );
      })}

      {prompts.length < MAX_PROMPTS && (
        <>
          <TouchableOpacity
            style={s.addPromptBtn}
            onPress={() => setPickerOpen(!pickerOpen)}
            activeOpacity={0.7}
          >
            <Feather name={pickerOpen ? 'chevron-up' : 'plus'} size={18} color="rgba(255,255,255,0.9)" />
            <Text style={s.addPromptBtnText}>
              {pickerOpen ? 'Close' : `Add a prompt (${prompts.length}/${MAX_PROMPTS})`}
            </Text>
          </TouchableOpacity>

          {pickerOpen && (
            <Card>
              {availablePrompts.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={s.promptPickerItem}
                  onPress={() => addPrompt(p.id)}
                  activeOpacity={0.7}
                >
                  <Feather name={p.icon} size={16} color={colors.primary} />
                  <Text style={s.promptPickerText}>{p.label}</Text>
                  <Feather name="plus" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </Card>
          )}
        </>
      )}
    </View>
  );
}

function PrivacyTab({ data, setData }) {
  return (
    <View>
      <Text style={s.tabHeading}>Privacy Settings</Text>

      <Card>
        <SectionTitle text="Profile Visibility" />
        <PickerRow
          label="Who can see my profile?"
          value={data.showProfile}
          options={VISIBILITY_OPTIONS}
          onSelect={(v) => setData({ ...data, showProfile: v })}
        />
        <PickerRow
          label="Who can see my events?"
          value={data.showEvents}
          options={VISIBILITY_OPTIONS}
          onSelect={(v) => setData({ ...data, showEvents: v })}
        />
        <PickerRow
          label="Who can message me?"
          value={data.allowMessages}
          options={MESSAGE_OPTIONS}
          onSelect={(v) => setData({ ...data, allowMessages: v })}
        />
      </Card>

      <Card>
        <SectionTitle text="Profile Information" />
        <ToggleRow title="Show my location" value={data.showLocation} onValueChange={(v) => setData({ ...data, showLocation: v })} />
        <ToggleRow title="Show my age range" value={data.showAge} onValueChange={(v) => setData({ ...data, showAge: v })} />
        <ToggleRow title="Show mutual friends" value={data.showMutualFriends} onValueChange={(v) => setData({ ...data, showMutualFriends: v })} />
      </Card>
    </View>
  );
}

function NotificationsTab({ data, setData }) {
  const toggle = (key) => setData({ ...data, [key]: !data[key] });
  return (
    <View>
      <Text style={s.tabHeading}>Notification Settings</Text>

      <Card>
        <SectionTitle text="Push Notifications" />
        <ToggleRow title="Event Reminders" subtitle="Get notified before events you're attending" value={data.eventReminders} onValueChange={() => toggle('eventReminders')} />
        <ToggleRow title="Friend Requests" subtitle="When someone sends you a friend request" value={data.friendRequests} onValueChange={() => toggle('friendRequests')} />
        <ToggleRow title="Messages" subtitle="When you receive a new message" value={data.messages} onValueChange={() => toggle('messages')} />
        <ToggleRow title="Group Chats" subtitle="New messages in group chats" value={data.groupChats} onValueChange={() => toggle('groupChats')} />
        <ToggleRow title="Event Updates" subtitle="Changes to events you're attending" value={data.eventUpdates} onValueChange={() => toggle('eventUpdates')} />
        <ToggleRow title="New Events" subtitle="Recommendations for new events near you" value={data.newEvents} onValueChange={() => toggle('newEvents')} />
      </Card>

      <Card>
        <SectionTitle text="Email Notifications" />
        <ToggleRow title="Send me email notifications" subtitle="Receive important updates via email" value={data.emailNotifications} onValueChange={() => toggle('emailNotifications')} />
      </Card>
    </View>
  );
}

function EventsTab({ data, setData }) {
  const toggleCategory = (cat) => {
    const cats = data.categories.includes(cat)
      ? data.categories.filter((c) => c !== cat)
      : [...data.categories, cat];
    setData({ ...data, categories: cats });
  };

  return (
    <View>
      <Text style={s.tabHeading}>Event Preferences</Text>

      <Card>
        <SectionTitle text="Favorite Categories" />
        <Text style={s.cardSubtext}>Select categories to see more relevant events</Text>
        <PillMultiSelect options={INTEREST_OPTIONS} selected={data.categories} onToggle={toggleCategory} />
      </Card>

      <Card>
        <SectionTitle text="Discovery Settings" />
        <PickerRow
          label="Search radius"
          value={data.radius}
          options={RADIUS_OPTIONS}
          onSelect={(v) => setData({ ...data, radius: v })}
        />
        <ToggleRow title="Show event recommendations" subtitle="See personalized event suggestions" value={data.showRecommendations} onValueChange={(v) => setData({ ...data, showRecommendations: v })} />
        <ToggleRow title="Auto-join group chats" subtitle="Automatically join event group chats" value={data.autoJoinGroups} onValueChange={(v) => setData({ ...data, autoJoinGroups: v })} />
      </Card>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [newAvatarUri, setNewAvatarUri] = useState(null);

  // Derive social map from stored social_links array
  const buildSocialsMap = useCallback(() => {
    const map = {};
    (profile?.extras?.social_links || []).forEach((link) => {
      const platform = SOCIAL_PLATFORMS.find((p) => p.icon === link.icon);
      if (platform) map[platform.key] = link.label;
    });
    return map;
  }, [profile]);

  // Profile editing state — initialized from real profile
  const [profileData, setProfileData] = useState({
    name: profile?.full_name || '',
    location: profile?.location || '',
    ageRange: profile?.age_range || '',
    classYear: profile?.class_year ? String(profile.class_year) : '',
    major: profile?.major || '',
    clubs: profile?.extras?.clubs || [],
    clubInput: '',
    interests: profile?.interests || [],
    socials: buildSocialsMap(),
  });

  const [prompts, setPrompts] = useState(profile?.extras?.prompts || []);

  const [privacyData, setPrivacyData] = useState({
    showProfile: profile?.settings?.privacy?.showProfile || 'everyone',
    showEvents: profile?.settings?.privacy?.showEvents || 'friends',
    allowMessages: profile?.settings?.privacy?.allowMessages || 'everyone',
    showLocation: profile?.settings?.privacy?.showLocation !== false,
    showAge: profile?.settings?.privacy?.showAge !== false,
    showMutualFriends: profile?.settings?.privacy?.showMutualFriends !== false,
  });

  const [notifData, setNotifData] = useState({
    eventReminders: profile?.settings?.notifications?.eventReminders !== false,
    friendRequests: profile?.settings?.notifications?.friendRequests !== false,
    messages: profile?.settings?.notifications?.messages !== false,
    groupChats: profile?.settings?.notifications?.groupChats !== false,
    eventUpdates: profile?.settings?.notifications?.eventUpdates !== false,
    newEvents: profile?.settings?.notifications?.newEvents || false,
    emailNotifications: profile?.settings?.notifications?.emailNotifications !== false,
  });

  const [eventsData, setEventsData] = useState({
    categories: profile?.settings?.events?.categories || profile?.interests || [],
    showRecommendations: profile?.settings?.events?.showRecommendations !== false,
    autoJoinGroups: profile?.settings?.events?.autoJoinGroups || false,
    radius: profile?.settings?.events?.radius || '25',
  });

  const avatarUrl = newAvatarUri || profile?.avatar_url;

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setNewAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build social links array from map
      const socialLinks = SOCIAL_PLATFORMS
        .filter((p) => profileData.socials[p.key]?.trim())
        .map((p) => ({
          icon: p.icon,
          color: p.color,
          label: profileData.socials[p.key].trim(),
          url: '',
        }));

      // Filter prompts with non-empty answers
      const cleanPrompts = prompts.filter((p) => {
        if (!p.answer) return false;
        if (typeof p.answer === 'string') return p.answer.trim().length > 0;
        if (Array.isArray(p.answer)) return p.answer.some((i) => i.title?.trim());
        if (typeof p.answer === 'object') return p.answer.title?.trim();
        return false;
      });

      const updates = {
        full_name: profileData.name.trim() || null,
        location: profileData.location.trim() || null,
        age_range: profileData.ageRange || null,
        class_year: profileData.classYear ? parseInt(profileData.classYear, 10) : null,
        major: profileData.major.trim() || null,
        interests: profileData.interests,
        extras: {
          prompts: cleanPrompts,
          clubs: profileData.clubs,
          social_links: socialLinks,
        },
        settings: {
          ...profile?.settings,
          onboarding_complete: true,
          privacy: privacyData,
          notifications: notifData,
          events: eventsData,
        },
        updated_at: new Date().toISOString(),
      };

      // Upload new avatar if changed
      if (newAvatarUri) {
        const ext = newAvatarUri.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${user.id}/avatar.${ext}`;
        const response = await fetch(newAvatarUri);
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

      await refreshProfile();
      setNewAvatarUri(null);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab data={profileData} setData={setProfileData} avatarUri={avatarUrl} onPickAvatar={pickAvatar} />;
      case 'prompts':
        return <PromptsTab prompts={prompts} setPrompts={setPrompts} />;
      case 'privacy':
        return <PrivacyTab data={privacyData} setData={setPrivacyData} />;
      case 'notifications':
        return <NotificationsTab data={notifData} setData={setNotifData} />;
      case 'events':
        return <EventsTab data={eventsData} setData={setEventsData} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#7300ff', '#00ac9b']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backRow}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={s.tabBarWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabBarContent}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[s.tabPill, active && s.tabPillActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Feather name={tab.icon} size={16} color={active ? '#7300ff' : 'rgba(255,255,255,0.8)'} />
                <Text style={[s.tabPillText, active && s.tabPillTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}

        {/* Save + Sign Out (shown on all tabs) */}
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.6 }]}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={s.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={s.signOutBtn} activeOpacity={0.7} onPress={handleSignOut}>
          <Feather name="log-out" size={16} color="#ef4444" />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 50,
  },

  // Tab bar
  tabBarWrap: {
    paddingVertical: 10,
  },
  tabBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabPillActive: {
    backgroundColor: '#fff',
  },
  tabPillText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  tabPillTextActive: {
    color: '#7300ff',
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: 16,
  },

  // Tab heading
  tabHeading: {
    fontSize: 26,
    fontFamily: fonts.semiBold,
    color: '#fff',
    marginBottom: 6,
  },
  tabSubheading: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 14,
  },
  cardSubtext: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginBottom: 14,
  },

  // Label + Input
  label: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: '#4a5565',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#101828',
    backgroundColor: '#f9fafb',
  },

  // Toggle row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#101828',
  },
  toggleSub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginTop: 2,
  },

  // Picker pills
  pickerGroup: {
    marginBottom: 8,
  },
  pickerOptions: {
    gap: 8,
    paddingVertical: 4,
  },
  pickerPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  pickerPillActive: {
    backgroundColor: '#7300ff',
  },
  pickerPillText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: '#1e2939',
  },
  pickerPillTextActive: {
    color: '#fff',
  },

  // Category / Interest grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  categoryChipActive: {
    backgroundColor: '#7300ff',
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#1e2939',
  },
  categoryChipTextActive: {
    color: '#fff',
  },

  // Save button
  saveBtn: {
    backgroundColor: '#7300ff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.semiBold,
  },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 15,
    fontFamily: fonts.medium,
  },

  // Profile picture
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7300ff',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.medium,
  },

  // Club input
  clubInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  addClubBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  clubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  clubChipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.primary,
  },

  // Social edit
  socialEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Prompt editor
  promptCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginBottom: 14,
  },
  addPromptBtnText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  promptPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  promptPickerText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#101828',
  },

  // List item editor (for list-type prompts)
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3e8ff',
  },
  addListBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
});
