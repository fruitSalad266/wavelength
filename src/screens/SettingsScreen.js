import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../theme/fonts';

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

function Input({ value, onChangeText, placeholder, multiline, numberOfLines, keyboardType }) {
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

function SaveButton({ label, onPress }) {
  return (
    <TouchableOpacity style={s.saveBtn} activeOpacity={0.8} onPress={onPress}>
      <Text style={s.saveBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'privacy', label: 'Privacy', icon: 'lock' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'verification', label: 'Verify', icon: 'award' },
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
  { value: '18-24', label: '18-24' },
  { value: '25-30', label: '25-30' },
  { value: '31-40', label: '31-40' },
  { value: '41-50', label: '41-50' },
  { value: '51+', label: '51+' },
];

const RADIUS_OPTIONS = [
  { value: '10', label: '10 mi' },
  { value: '25', label: '25 mi' },
  { value: '50', label: '50 mi' },
  { value: '100', label: '100 mi' },
  { value: 'unlimited', label: 'Any' },
];

const ALL_CATEGORIES = [
  'Music Festivals', 'Art & Culture', 'Food & Dining', 'Technology',
  'Photography', 'Travel', 'Sports', 'Comedy',
];

// ---------------------------------------------------------------------------
// Tab content components
// ---------------------------------------------------------------------------

function ProfileTab({ data, setData }) {
  return (
    <View>
      <Text style={s.tabHeading}>Edit Profile</Text>

      <Card>
        <SectionTitle text="Profile Picture" />
        <View style={s.avatarRow}>
          <View style={s.avatarCircle}>
            <Feather name="user" size={32} color="#7300ff" />
          </View>
          <TouchableOpacity style={s.uploadBtn} activeOpacity={0.8}>
            <Feather name="upload" size={15} color="#fff" />
            <Text style={s.uploadBtnText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card>
        <SectionTitle text="Basic Information" />
        <Label text="Name" />
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

        <Label text="Bio" />
        <Input
          value={data.bio}
          onChangeText={(v) => setData({ ...data, bio: v })}
          placeholder="Tell us about yourself..."
          multiline
          numberOfLines={4}
        />
      </Card>

      <Card>
        <SectionTitle text="Current Anthem" />
        <Label text="Song Title" />
        <Input value={data.anthem} onChangeText={(v) => setData({ ...data, anthem: v })} placeholder="Song name" />
        <Label text="Artist" />
        <Input value={data.anthemArtist} onChangeText={(v) => setData({ ...data, anthemArtist: v })} placeholder="Artist name" />
      </Card>

      <SaveButton label="Save Changes" onPress={() => Alert.alert('Saved', 'Profile updated.')} />
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

      <SaveButton label="Save Privacy Settings" onPress={() => Alert.alert('Saved', 'Privacy settings updated.')} />
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

      <SaveButton label="Save Notification Settings" onPress={() => Alert.alert('Saved', 'Notification settings updated.')} />
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
        <View style={s.categoryGrid}>
          {ALL_CATEGORIES.map((cat) => {
            const active = data.categories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[s.categoryChip, active && s.categoryChipActive]}
                onPress={() => toggleCategory(cat)}
              >
                <Text style={[s.categoryChipText, active && s.categoryChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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

      <SaveButton label="Save Event Preferences" onPress={() => Alert.alert('Saved', 'Event preferences updated.')} />
    </View>
  );
}

function VerificationTab({ isVerified, setIsVerified }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = () => {
    if (email.endsWith('@uw.edu') || email.endsWith('@u.washington.edu')) {
      setCodeSent(true);
    } else {
      Alert.alert('Invalid Email', 'Please use a valid UW email address (@uw.edu or @u.washington.edu)');
    }
  };

  const handleVerify = () => {
    if (code === '123456') {
      setIsVerified(true);
    } else {
      Alert.alert('Invalid Code', 'The verification code is incorrect.');
    }
  };

  if (isVerified) {
    return (
      <View>
        <Text style={s.tabHeading}>Student Verification</Text>
        <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
          <View style={s.verifiedCircle}>
            <Feather name="check-circle" size={36} color="#fff" />
          </View>
          <Text style={s.verifiedTitle}>Verified Student!</Text>
          <Text style={s.verifiedSub}>You are verified as a University of Washington student</Text>
          <View style={s.verifiedBadge}>
            <Text style={s.verifiedBadgeText}>UW Student - Verified</Text>
          </View>

          <View style={s.benefitsBox}>
            <Text style={s.benefitsLabel}>Benefits:</Text>
            {[
              'Access to verified student group chats',
              'Priority matching with other UW students',
              'Exclusive student events and discounts',
              'Verification badge on your profile',
            ].map((b, i) => (
              <Text key={i} style={s.benefitItem}>✓  {b}</Text>
            ))}
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View>
      <Text style={s.tabHeading}>Student Verification</Text>

      <Card>
        <View style={s.whyRow}>
          <View style={s.whyIcon}>
            <Feather name="award" size={22} color="#7300ff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.whyTitle}>Why verify?</Text>
            {[
              'Join exclusive verified student group chats',
              'Connect with fellow students at events',
              'Get a verification badge on your profile',
              'Access student-only events and discounts',
            ].map((item, i) => (
              <Text key={i} style={s.whyItem}>•  {item}</Text>
            ))}
          </View>
        </View>
      </Card>

      <Card>
        <SectionTitle text="Verify with University Email" />
        <Text style={s.cardSubtext}>
          Enter your @uw.edu or @u.washington.edu email address to get verified
        </Text>

        {!codeSent ? (
          <View>
            <Label text="University Email" />
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="yourname@uw.edu"
              keyboardType="email-address"
            />
            <TouchableOpacity style={s.saveBtn} activeOpacity={0.8} onPress={handleSendCode}>
              <Feather name="mail" size={15} color="#fff" />
              <Text style={s.saveBtnText}>Send Verification Code</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={s.codeSentBanner}>
              <Text style={s.codeSentText}>✓ Verification code sent to {email}</Text>
            </View>
            <Label text="Verification Code" />
            <Input value={code} onChangeText={setCode} placeholder="Enter 6-digit code" keyboardType="number-pad" />
            <Text style={s.demoHint}>Demo code: 123456</Text>
            <SaveButton label="Verify Student Status" onPress={handleVerify} />
            <TouchableOpacity style={s.secondaryBtn} activeOpacity={0.7} onPress={() => setCodeSent(false)}>
              <Text style={s.secondaryBtnText}>Use Different Email</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('profile');
  const [isVerified, setIsVerified] = useState(false);

  const [profileData, setProfileData] = useState({
    name: 'Alex',
    location: 'Seattle, WA',
    ageRange: '25-30',
    bio: "Front row seats, amazing friends, and singing along to every song at the top of my lungs. Bonus points if there's confetti and incredible light shows! 🎵✨",
    anthem: 'Blinding Lights',
    anthemArtist: 'The Weeknd',
  });

  const [privacyData, setPrivacyData] = useState({
    showProfile: 'everyone',
    showEvents: 'friends',
    allowMessages: 'everyone',
    showLocation: true,
    showAge: true,
    showMutualFriends: true,
  });

  const [notifData, setNotifData] = useState({
    eventReminders: true,
    friendRequests: true,
    messages: true,
    groupChats: true,
    eventUpdates: true,
    newEvents: false,
    emailNotifications: true,
  });

  const [eventsData, setEventsData] = useState({
    categories: ['Music Festivals', 'Art & Culture', 'Food & Dining'],
    showRecommendations: true,
    autoJoinGroups: false,
    radius: '25',
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab data={profileData} setData={setProfileData} />;
      case 'privacy':
        return <PrivacyTab data={privacyData} setData={setPrivacyData} />;
      case 'notifications':
        return <NotificationsTab data={notifData} setData={setNotifData} />;
      case 'events':
        return <EventsTab data={eventsData} setData={setEventsData} />;
      case 'verification':
        return <VerificationTab isVerified={isVerified} setIsVerified={setIsVerified} />;
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
  backLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: fonts.regular,
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

  // Picker pills (for select-like options)
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

  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
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

  // Verification — verified state
  verifiedCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7300ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifiedTitle: {
    fontSize: 22,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 6,
  },
  verifiedSub: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#4a5565',
    textAlign: 'center',
    marginBottom: 14,
  },
  verifiedBadge: {
    backgroundColor: '#7300ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 20,
  },
  verifiedBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  benefitsBox: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    width: '100%',
  },
  benefitsLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: '#4a5565',
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginBottom: 4,
  },

  // Verification — unverified state
  whyRow: {
    flexDirection: 'row',
    gap: 14,
  },
  whyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#101828',
    marginBottom: 8,
  },
  whyItem: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginBottom: 4,
  },
  codeSentBanner: {
    backgroundColor: '#f3e8ff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  codeSentText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#7300ff',
  },
  demoHint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#4a5565',
    marginTop: 6,
    marginBottom: 4,
  },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  secondaryBtnText: {
    color: '#7300ff',
    fontSize: 15,
    fontFamily: fonts.medium,
  },
});
