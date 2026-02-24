import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventFeedScreen from '../screens/EventFeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import DirectMessageScreen from '../screens/DirectMessageScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="EventFeed" component={EventFeedScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="GroupChat" component={GroupChatScreen} />
        <Stack.Screen name="DirectMessage" component={DirectMessageScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
