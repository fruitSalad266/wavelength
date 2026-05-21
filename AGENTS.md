# Wavelength – Tech stack & conventions

For AI agents and contributors: use this file as the source of truth for how the app is built.

## Tech stack

- **Runtime:** Expo SDK 54, React Native 0.81.5, React 19, JavaScript only (no TypeScript)
- **Navigation:** `@react-navigation/native`, `native-stack`, `bottom-tabs`
- **UI:** `expo-linear-gradient`, `@expo/vector-icons` (Feather, Ionicons), `expo-image`, custom components in `src/components/`
- **Theme:** `src/theme/fonts.js` (DMSans: regular, medium, semiBold, bold), `src/theme/colors.js` (brand and UI colors)
- **Backend:** Supabase (auth, Postgres, storage, edge functions) via `@supabase/supabase-js`
- **State:** `AuthContext` for session/profile; custom hooks in `src/hooks/` for data fetching

## Structure

| Area        | Path |
|------------|------|
| Screens    | `src/screens/` — grouped: `auth/`, `events/`, `chat/`, `profile/`; `NotificationsScreen.js` at root |
| Navigation | `src/navigation/AppNavigator.js` |
| Components | `src/components/` |
| Hooks      | `src/hooks/` — Supabase data fetching (see list below) |
| Contexts   | `src/contexts/AuthContext.js` |
| Lib        | `src/lib/supabase.js` — Supabase client with SecureStore auth adapter |
| Theme      | `src/theme/` (`fonts.js`, `colors.js`) |
| Utilities  | `src/utils/` (e.g. `matchScore.js`) |
| Static data | `src/data/` — UI-only constants (`profilePrompts.js`) |
| Backend    | `supabase/migrations/`, `supabase/functions/` |

## Data fetching

Live data comes from **Supabase via hooks**, not mock files. Screens should call hooks; do not query Supabase directly from screen components.

| Hook | Purpose |
|------|---------|
| `useEvents` | Event listings |
| `useRecommendedEvents` | Personalized event feed |
| `useRSVP` | RSVP state, attendees, event notes |
| `useFriends` | Friend relationships |
| `useGroupChats` | Group chat threads |
| `useMessages` | Real-time group/DM messages |
| `useNotifications` | User notifications |

Add new Supabase queries in `src/hooks/`, not inline in screens.

## Navigation

- **Auth gates:** unauthenticated → Login/SignUp; needs onboarding → Onboarding; password recovery → ResetPassword
- **Bottom tabs:** Home (EventFeed), Events, Chats, Profile. Tab bar gradient `#7300ff` → `#00ac9b`.
- **Stack (on top of tabs):** EventDetail, Settings, GroupChat, MatchGroupChat, DirectMessage, Notifications, UserProfile, AllAttendees, SavedEvents, YourEvents, People, Friends
- All screens use custom headers (`headerShown: false`).

## Environment

- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL (local `.env`; EAS production uses `eas.json`)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key

## Theming

- **Fonts:** Always use `fonts` from `src/theme/fonts`. Keys: `regular`, `medium`, `semiBold`, `bold`.
- **Brand colors:** Purple `#7300ff`, teal `#00ac9b`. Prefer `colors` from `src/theme/colors.js`. Full-screen backgrounds use `LinearGradient` with these colors.
- **Cards:** White/light background, `borderRadius: 10`, `borderColor: '#e5e7eb'` (or `colors.cardBorder`).

## Screen conventions

- Use `useSafeAreaInsets()` for top/bottom padding.
- Use `StyleSheet.create` for styles.
- Add extra bottom padding for tab bar when content scrolls (e.g. `insets.bottom + 100`).
- Use `expo-image` (`Image` from `expo-image`), not React Native's built-in `Image`.

## Agent tooling (Cursor MCP)

These MCP servers should be enabled for agents working on this repo. See `.cursor/rules/agent-tooling.mdc` for usage patterns.

### Supabase (`user-supabase`)

Use for backend and schema work against the linked Supabase project:

| Tool | When to use |
|------|-------------|
| `list_tables`, `list_migrations` | Understand current schema |
| `execute_sql` | Read/query data (SELECT); ad-hoc inspection |
| `apply_migration` | DDL changes (CREATE/ALTER TABLE, RLS policies) |
| `list_edge_functions`, `get_edge_function`, `deploy_edge_function` | Edge functions in `supabase/functions/` |
| `get_logs` | Debug auth/API/function failures |
| `search_docs` | Supabase-specific API and config questions |
| `get_advisors` | Security/performance recommendations |

Prefer `apply_migration` over `execute_sql` for schema changes. Migrations live in `supabase/migrations/`.

### Context7 (`plugin-context7-context7`)

Use for **up-to-date library documentation** when working with:

- Expo SDK 54 / Expo modules (`expo-image`, `expo-image-picker`, etc.)
- React Navigation 7
- `@supabase/supabase-js`
- React Native APIs

Workflow: call `resolve-library-id` first, then `query-docs`. Do **not** use Context7 for app business logic, refactoring, or code review.

## Commands

Tell the user to run npm commands; do not run `npm` in the agent terminal unless explicitly asked.

- **Start dev server:** `npm start` (Expo Go or simulator)
- **Run on iOS:** `expo run:ios`
- **Run on Android:** `expo run:android`
- **Validate deps:** `npx expo-doctor`

No test, lint, or formatting tools are configured.

## Cursor rules

Project-specific rules live in `.cursor/rules/`:

| Rule | Scope |
|------|-------|
| `wavelength-app.mdc` | Always apply — stack, navigation, theme |
| `agent-tooling.mdc` | Always apply — MCP plugins for agents |
| `screens.mdc` | `src/screens/**/*.js` — layout and screen patterns |
