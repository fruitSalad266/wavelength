# Wavelength – Tech stack & conventions

For AI agents and contributors: use this file as the source of truth for how the app is built.

## Tech stack

- **Runtime:** Expo SDK 54, React Native
- **Navigation:** `@react-navigation/native`, `native-stack`, `bottom-tabs`
- **UI:** `expo-linear-gradient`, `@expo/vector-icons` (Feather), custom components in `src/components/`
- **Theme:** `src/theme/fonts.js` (DMSans: regular, medium, semiBold, bold)

## Structure

| Area        | Path                 |
|------------|----------------------|
| Screens    | `src/screens/`       |
| Navigation | `src/navigation/`   |
| Components | `src/components/`   |
| Theme      | `src/theme/`        |
| Mock data  | `src/data/`         |

## Navigation

- **Bottom tabs:** Home (EventFeed), Events, Chats, Profile. Tab bar uses gradient `#7300ff` → `#00ac9b`.
- **Stack (on top of tabs):** EventDetail, Settings, GroupChat, DirectMessage, Notifications. All screens use custom headers (`headerShown: false`).

## Theming

- **Fonts:** Always use `fonts` from `../theme/fonts` (or `src/theme/fonts`). Keys: `regular`, `medium`, `semiBold`, `bold`.
- **Brand colors:** Purple `#7300ff`, teal `#00ac9b`. Full-screen backgrounds use `LinearGradient` with these colors.
- **Cards:** White/light background, `borderRadius: 10`, `borderColor: '#e5e7eb'`.

## Screen conventions

- Use `useSafeAreaInsets()` for top/bottom padding.
- Use `StyleSheet.create` for styles.
- Add extra bottom padding for tab bar when content scrolls (e.g. `insets.bottom + 100`).

## Cursor rules

Project-specific rules live in `.cursor/rules/` (e.g. `wavelength-app.mdc`, `screens.mdc`). Prefer those for detailed patterns.
