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
- `expo-image` for optimized image rendering, `expo-image-picker` for photo selection
- `expo-secure-store` for secure token storage
- **Backend:** Supabase (auth, database, storage) via `@supabase/supabase-js`
- **State:** `AuthContext` for session/profile; custom hooks in `src/hooks/` for data fetching

## Environment Variables

- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key

## Architecture

**Entry:** `App.js` loads DM Sans fonts, wraps with `SafeAreaProvider` + `AuthProvider`, renders `AppNavigator`.

**Auth** (`src/contexts/AuthContext.js`):
- Provides `session`, `user`, `profile`, `loading`, `needsOnboarding`, `signOut`, `refreshProfile`
- Supabase client in `src/lib/supabase.js` uses SecureStore for token persistence
- Deep linking (`wavelength://reset-password`) for password recovery flow

**Navigation** (`src/navigation/AppNavigator.js`):
- Auth gates: unauthenticated → Login/SignUp; needs onboarding → Onboarding; password recovery → ResetPassword
- Bottom tabs: Home (EventFeed), Events, Chats, Profile
- Stack screens: EventDetail, Settings, GroupChat, MatchGroupChat, DirectMessage, Notifications, UserProfile, AllAttendees, SavedEvents, YourEvents, People, Friends
- All screens use `headerShown: false` and draw custom headers
- Tab bar uses `LinearGradient` with `['#7300ff', '#00ac9b']`

**Screens** (`src/screens/`): Grouped by feature — `auth/`, `events/`, `chat/`, `profile/`, plus `NotificationsScreen.js` at root.

**Hooks** (`src/hooks/`): Data-fetching hooks that query Supabase — `useEvents`, `useRecommendedEvents`, `useRSVP`, `useFriends`, `useGroupChats`, `useMessages`, `useNotifications`.

**Shared components** (`src/components/`): Avatar, Badge, EventImage, GradientCard, MatchBadge, ScreenHeader, SectionHeader, StatusNoteModal. Prefer reusing these before creating new ones.

**Theme** (`src/theme/`): `fonts.js` exports `fonts.regular`, `.medium`, `.semiBold`, `.bold` (DM Sans). `colors.js` exports the full color palette — brand purple `#7300ff`, teal `#00ac9b`.

**Utilities** (`src/utils/`): `matchScore.js` for computing attendee match scores.

**Mock data** (`src/data/`): Static JS exports used as fallbacks or demo data. Live data comes from Supabase via hooks.

## Conventions

- Always import fonts from `src/theme/fonts` and colors from `src/theme/colors` — never hardcode font families or redefine brand colors.
- Use `useSafeAreaInsets()` for top/bottom padding. Add extra bottom padding (`insets.bottom + 100`) when content scrolls under the tab bar.
- Use `StyleSheet.create` for all styles.
- Full-screen gradients: `LinearGradient` with `colors={['#7300ff', '#00ac9b']}` and `style={StyleSheet.absoluteFill}`.
- Cards: white/light background, `borderRadius: 10`, `borderColor: '#e5e7eb'`.
- Custom headers with `Feather name="arrow-left"` for back navigation.
- Data fetching belongs in `src/hooks/` — screens should call hooks, not query Supabase directly.
- Keep mock/demo data in `src/data/` rather than inline in screen files.
- Use Expo APIs over bare React Native equivalents when available.
- Use `expo-image` (`Image` from `expo-image`) instead of React Native's built-in `Image` for better performance and caching.
