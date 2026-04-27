import React from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { fonts } from '../theme/fonts';

import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import EventFeedScreen from '../screens/events/EventFeedScreen';
import EventsScreen from '../screens/events/EventsScreen';
import ChatsScreen from '../screens/chat/ChatsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import GroupChatScreen from '../screens/chat/GroupChatScreen';
import MatchGroupChatScreen from '../screens/chat/MatchGroupChatScreen';
import DirectMessageScreen from '../screens/chat/DirectMessageScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import AllAttendeesScreen from '../screens/events/AllAttendeesScreen';
import SavedEventsScreen from '../screens/events/SavedEventsScreen';
import YourEventsScreen from '../screens/events/YourEventsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabBarBackground() {
  return (
    <LinearGradient
      colors={['#7300ff', '#00ac9b']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

function TabBarIcon({ name, color, size }) {
  return <Feather name={name} size={size} color={color} />;
}

function HomeTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingTop: 8,
        },
        tabBarBackground: () => <TabBarBackground />,
      }}
    >
      <Tab.Screen
        name="Home"
        component={EventFeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon name="calendar" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon name="message-circle" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon name="user" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading, needsOnboarding } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#7300ff' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={HomeTabs} />
            <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="GroupChat" component={GroupChatScreen} />
            <Stack.Screen name="MatchGroupChat" component={MatchGroupChatScreen} />
            <Stack.Screen name="DirectMessage" component={DirectMessageScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="AllAttendees" component={AllAttendeesScreen} />
            <Stack.Screen name="SavedEvents" component={SavedEventsScreen} />
            <Stack.Screen name="YourEvents" component={YourEventsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
