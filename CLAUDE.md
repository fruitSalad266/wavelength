# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wavelength is a React Native / Expo mobile app for discovering and attending events with friends. Built for INFO 490 at University of Washington.

## Commands

- **Start dev server:** `npm start` (then open in Expo Go or simulator)
- **Run on iOS:** `expo run:ios`
- **Run on Android:** `expo run:android`

No test, lint, or formatting tools are configured.

## Tech Stack

- Expo SDK 54, React Native 0.81.5, React 19
- JavaScript only (no TypeScript)
- `@react-navigation/native` with `native-stack` and `bottom-tabs`
- `expo-linear-gradient`, `@expo/vector-icons` (Feather), `@expo-google-fonts/dm-sans`
- No state management library — all data is currently mock data from `src/data/`

## Architecture

**Entry:** `App.js` loads DM Sans fonts, wraps with `SafeAreaProvider`, renders `AppNavigator`.

**Navigation** (`src/navigation/AppNavigator.js`):
- Bottom tabs: Home (EventFeed), Events, Chats, Profile
- Stack screens on top: EventDetail, Settings, GroupChat, MatchGroupChat, DirectMessage, Notifications, UserProfile, AllAttendees
- All screens use `headerShown: false` and draw custom headers
- Tab bar uses `LinearGradient` with `['#7300ff', '#00ac9b']`

**Screens** (`src/screens/`): Grouped by feature — `events/`, `chat/`, `profile/`, plus `NotificationsScreen.js` at root.

**Shared components** (`src/components/`): Avatar, Badge, GradientCard, ScreenHeader, SectionHeader. Prefer reusing these before creating new ones.

**Theme** (`src/theme/`): `fonts.js` exports `fonts.regular`, `.medium`, `.semiBold`, `.bold` (DM Sans). `colors.js` exports the full color palette — brand purple `#7300ff`, teal `#00ac9b`.

**Mock data** (`src/data/`): All screen data lives here as static JS exports. No API calls exist yet.

## Conventions

- Always import fonts from `src/theme/fonts` and colors from `src/theme/colors` — never hardcode font families or redefine brand colors.
- Use `useSafeAreaInsets()` for top/bottom padding. Add extra bottom padding (`insets.bottom + 100`) when content scrolls under the tab bar.
- Use `StyleSheet.create` for all styles.
- Full-screen gradients: `LinearGradient` with `colors={['#7300ff', '#00ac9b']}` and `style={StyleSheet.absoluteFill}`.
- Cards: white/light background, `borderRadius: 10`, `borderColor: '#e5e7eb'`.
- Custom headers with `Feather name="arrow-left"` for back navigation.
- Keep mock data in `src/data/` rather than inline in screen files.
- Use Expo APIs over bare React Native equivalents when available.
