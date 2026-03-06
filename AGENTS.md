# Wavelength – Tech stack & conventions

For AI agents and contributors: use this file as the source of truth for how the app is built.

## Tech stack

- **Runtime:** Expo SDK 54, React Native
- **Navigation:** `@react-navigation/native`, `native-stack`, `bottom-tabs`
- **UI:** `expo-linear-gradient`, `@expo/vector-icons` (Feather), custom components in `src/components/`
- **Theme:** `src/theme/fonts.js` (DMSans: regular, medium, semiBold, bold), `src/theme/colors.js` (brand and UI colors)

## Structure

| Area        | Path                 |
|------------|----------------------|
| Screens    | `src/screens/` (grouped: `events/`, `chat/`, `profile/`; `NotificationsScreen.js` at root) |
| Navigation | `src/navigation/`   |
| Components | `src/components/`   |
| Theme      | `src/theme/` (`fonts.js`, `colors.js`) |
| Mock data  | `src/data/` (e.g. `mockEvents.js`, `mockEventDetail.js`, `mockGroupChat.js`, `mockMatchSquad.js`, `mockEventFeed.js`, `mockChats.js`, `mockDirectMessage.js`, `mockNotifications.js`, `mockProfile.js`, `mockUsers.js`, `mockAllAttendees.js`) |

## Navigation

- **Bottom tabs:** Home (EventFeed), Events, Chats, Profile. Tab bar uses gradient `#7300ff` → `#00ac9b`.
- **Stack (on top of tabs):** EventDetail, Settings, GroupChat, DirectMessage, Notifications. All screens use custom headers (`headerShown: false`).

## Theming

- **Fonts:** Always use `fonts` from `../theme/fonts` (or `src/theme/fonts`). Keys: `regular`, `medium`, `semiBold`, `bold`.
- **Brand colors:** Purple `#7300ff`, teal `#00ac9b`. Prefer `colors` from `src/theme/colors.js` for consistency. Full-screen backgrounds use `LinearGradient` with these colors.
- **Cards:** White/light background, `borderRadius: 10`, `borderColor: '#e5e7eb'` (or `colors.cardBorder`).

## Screen conventions

- Use `useSafeAreaInsets()` for top/bottom padding.
- Use `StyleSheet.create` for styles.
- Add extra bottom padding for tab bar when content scrolls (e.g. `insets.bottom + 100`).

## Cursor rules

Project-specific rules live in `.cursor/rules/` (e.g. `wavelength-app.mdc`, `screens.mdc`). Prefer those for detailed patterns.
