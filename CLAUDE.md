# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

JurgolApp is a mobile app (Spanish UI) for organizing amateur football (soccer): players sign up, create or join squads/teams, manage a roster and invite other players (with a notifications inbox for invites), and view their player profile. The `match` tab (fixtures/results) exists in the tab bar but is currently just placeholder UI with no backend logic behind it yet.

## Commands

```bash
npm install              # install dependencies
npx expo start            # start the Metro dev server (press a/i/w to open a platform)
npm run android            # start + open on Android
npm run ios                # start + open on iOS
npm run web                 # start + open on web
npm run lint                 # expo lint (ESLint, eslint-config-expo flat config)
```

On Windows, if PowerShell blocks script execution, invoke the `.cmd` shims directly (`npm.cmd`, `npx.cmd`).

There is no test suite configured in this repo (no test script, no Jest config).

### Environment

The app requires a `.env.local` (gitignored) with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Without these, `lib/supabase.ts` throws at startup. The Supabase project URL and where to find the anon key are documented in `SCHEMA.md`.

## Architecture

This is a managed Expo (SDK 54) app using Expo Router for file-based routing, backed directly by Supabase (no custom backend). React Compiler and typed routes are both enabled (`app.json` → `experiments`).

### Routing (`app/`)

`app/_layout.tsx` is the root layout: it loads all fonts, resolves auth state via `useSession()`, and gates navigation itself — redirecting to `(auth)` when logged out and to `(tabs)` when logged in but still inside `(auth)`. Route groups:

- `(auth)` — login/signup, no header.
- `(tabs)` — the main app behind a bottom tab bar (`home`, `match`, `squads`, `profile`), defined in `app/(tabs)/_layout.tsx` and styled from `constants/design.ts`.
- `(squad)` — squad/team management flows reached by pushing off the tab stack: `create-team`, `squad-details/[id]` (+ its `add-player` sub-flow), and `notifications` (list + `[id]` detail for invitations).

### Data layer (Supabase)

There's a single Supabase client (`lib/supabase.ts`); sessions persist via `AsyncStorage` on native and via URL detection on web. There is no query/ORM layer on top of it — screens and hooks call `supabase.from(...)` directly.

Core tables: `players` (1:1 with a Supabase Auth user, created on signup), `teams`, `team_members` (many-to-many, has a `status`: `pending`/`accepted`), and `notifications` (`team_invitation` / `player_removed`, joined through `team_members` → `teams` → inviter `players`). **`SCHEMA.md` only documents `players`/`teams`/`team_members` and is out of date** — `notifications`, `players.username`, and `team_members.status` already exist in code (see `hooks/useNotifications.ts`) but aren't reflected there. Check actual query shapes in the hooks/screens rather than trusting `SCHEMA.md` alone.

Shared data hooks live in `hooks/`: `useSession` (auth state), `usePlayer` (current player row), `useNotifications` (notifications joined with team/inviter, refetches via `useFocusEffect`). Screen-specific queries are typically written inline in the screen itself with `useCallback`/`useEffect`/`useFocusEffect` rather than extracted into a hook (see `app/(tabs)/squads/index.tsx`).

### Styling

`constants/design.ts` is the actual design system in use — `Font`, `Color`, `Space`, `Radius`, `TextSize` tokens (the "Jurgol" palette: grass/pitch/chalk greens, no dark variant). The convention is one `*.styles.ts` file per screen/component exporting a `StyleSheet.create(...)` built from those tokens, colocated next to the component (e.g. `components/squad-card.tsx` + `components/squad-card.styles.ts`).

Note: `constants/theme.ts` and `hooks/use-color-scheme*.ts` are leftover from the default Expo template's light/dark `Colors`/`Fonts` system and are **not** the app's actual design system — don't reach for those when styling new screens, use `constants/design.ts`.
