# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

JurgolApp is a mobile app (Spanish UI) for organizing amateur football (soccer) among friends. Players sign up with a username (used to find and invite them), create or join squads/teams, and organize matches. Feature areas:

- **Squads** (`Equipos` tab) — create a team, invite players (via a "jugadores en común" list from shared teams, username search, or QR-code scan), manage a roster, chat with teammates in real time, and see per-team stats (record, win rate, recent form) computed live from played matches. "Mis equipos" also surfaces the 2 most recent pending team invitations, with a link to see all.
- **Matches** — a team member creates a match (any member can, not just the captain) specifying modality (5v5/7v7/11v11), date/time, and optional location, then picks one of two modes: **seeking an opponent team**, either "abierto" (posted to the Social marketplace for any team to challenge) or "equipo específico" (targets one previously-played opponent, picked from a modal showing head-to-head record); or **not seeking a team**, in which case it optionally declares open slots for individual loose players to self-join and either lets the rest of the roster join freely (notified) or hand-picks who's called up. A "Revancha" button on a played match pre-fills a rematch against the same opponent (same modality/location, just needs a new date/time). Played matches update a real Elo rating per team and an `overall` rating per player automatically via a Postgres trigger (see Data layer below).
- **Social tab** (between Home and Partido) — the match marketplace (browse open matches from other teams, challenge with your team or join as a loose player), plus a "+ Crear" entry point for new matches, a placeholder news feed, and a placeholder "ligas y torneos abiertos" section.
- **Partido tab** — scoped to just "my" matches: upcoming (with a "Cargar resultado" action) and history (with the "Revancha" action).
- **Notifications inbox** — unified feed for team invitations (accept/reject), match-created invites (join), team-challenge postulations (accept one, auto-rejects the rest), captain-only broadcast announcements to selected members, and player-removed notices.
- **Profile** — full player profile (username, email, phone, career stats: partidos jugados / veces MVP / % victorias) with an edit screen, and a personal QR code (`jurgolapp:player:{id}`) another captain can scan to add the player straight to a roster.

There is no concept of a fixed/preferred player position anywhere in the app (profile, roster, invites) — it was deliberately removed; don't reintroduce it.

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

The app requires a `.env.local` (gitignored) with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Without these, `lib/supabase.ts` throws at startup. The Supabase project URL and full schema are documented in `SCHEMA.md`.

## Architecture

This is a managed Expo (SDK 54) app using Expo Router for file-based routing, backed directly by Supabase (no custom backend). React Compiler and typed routes are both enabled (`app.json` → `experiments`).

### Routing (`app/`)

`app/_layout.tsx` is the root layout: it loads all fonts, resolves auth state via `useSession()`, and gates navigation itself — redirecting to `(auth)` when logged out and to `(tabs)` when logged in but still inside `(auth)`. Route groups:

- `(auth)` — `index` (login) and `signup` (full signup form: username + email + password + confirm, optional full name/phone), no header.
- `(tabs)` — the main app behind a bottom tab bar: `home`, `social`, `match`, `squads`, `profile` (in that order), defined in `app/(tabs)/_layout.tsx` and styled from `constants/design.ts`. `app/(tabs)/index.tsx` is just a redirect to `home`.
- `(squad)` — flows reached by pushing off the tab stack: `create-team`, `create-match` (also used for the Revancha pre-filled flow, via route params), `edit-profile`, `notifications` (list, `[id]` for team-invitation detail, `match/[id]` for match-created/team-challenge detail), and `squad-details/[id]` (+ its `add-player` and `chat/[id]` sub-flows).

`app/modal.tsx` and `constants/theme.ts`/`hooks/use-color-scheme*.ts` are leftovers from the default Expo template and are **not** part of the app's real flows or design system — don't build on them.

### Data layer (Supabase)

There's a single Supabase client (`lib/supabase.ts`); sessions persist via `AsyncStorage` on native and via URL detection on web. There is no query/ORM layer on top of it — screens and hooks call `supabase.from(...)` directly. **`SCHEMA.md` documents the full current schema** — read it before writing new queries; `supabase/migration.sql` is the canonical, idempotent, re-runnable script that produced it and explains *why* each table/column exists (run it in the Supabase SQL Editor if a fresh project needs to be brought up to date).

Two write paths are RPC functions rather than raw inserts, both `SECURITY DEFINER` and pre-existing in the project (not authored in this codebase — see `supabase/migration.sql`'s "Adopt the pre-existing backend" section): `invite_player(p_team_id, p_player_id, p_role, p_message?)` and `respond_to_invitation(p_team_member_id, p_accept)`. Use these instead of inserting into `team_members`/updating `notifications` directly when adding/responding-to invitations.

Two Postgres triggers matter architecturally: `handle_new_team` (on `teams` insert, adds the creator as an accepted `owner` row in `team_members`) and `apply_match_elo` (on `matches` update, when a match transitions to `status = 'played'` with both scores set — computes a real Elo update, K=32, ~1500 baseline for teams, and nudges each confirmed player's `overall` by a smaller K=4 factor, clamped 0–99). Registering a match result (`components/matches/register-result-sheet.tsx`) is what fires this — there's no client-side Elo math.

PostgREST embedded-resource syntax like `teams!matches_home_team_id_fkey(...)` is used throughout to disambiguate `matches`' two FKs to `teams` (home/away) and similar multi-FK joins (e.g. `notifications`' `team_member`/`match`/`announce_team` embeds). **These embeds only resolve for an authenticated session** — querying with just the anon/publishable key (no signed-in user) silently returns `null` for the embedded object due to RLS, which looks like a query bug but isn't; always test embed queries against a real signed-in session.

Shared data hooks live in `hooks/`: `useSession` (auth state), `usePlayer` (current player row + `refresh()` for after profile edits), `useNotifications` (all notification types joined with team/inviter/match/announce-team, refetches via `useFocusEffect`), `usePlayerMatchStats` (career played/win-rate/MVP count from `match_players` + `matches`). Screen-specific queries are typically written inline in the screen itself with `useCallback`/`useEffect`/`useFocusEffect` rather than extracted into a hook (see `app/(tabs)/squads/index.tsx`, `app/(tabs)/match/index.tsx`, `app/(tabs)/social/index.tsx` — each redeclares its own `TEAM_SELECT` match-select string rather than sharing one).

Team chat (`app/(squad)/squad-details/chat/[id].tsx`) uses Supabase Realtime directly: `supabase.channel(...).on('postgres_changes', { event: 'INSERT', table: 'team_messages', filter: ... })`, unsubscribed on unmount. It's the only realtime subscription in the app.

QR add-player uses `expo-camera`'s `CameraView` (`components/qr/qr-scanner-sheet.tsx`) to scan a `jurgolapp:player:{id}` payload rendered by `components/qr/player-qr-code.tsx` via `react-native-qrcode-svg`; a successful scan feeds the same player-lookup path as username search.

### Styling

`constants/design.ts` is the actual design system in use — `Font`, `Color`, `Space`, `Radius`, `TextSize` tokens (the "Jurgol" palette: grass/pitch/chalk greens, no dark variant). The convention is one `*.styles.ts` file per screen/component exporting a `StyleSheet.create(...)` built from those tokens, colocated next to the component (e.g. `components/squad-card.tsx` + `components/squad-card.styles.ts`).

Note: `constants/theme.ts` and `hooks/use-color-scheme*.ts` are leftover from the default Expo template's light/dark `Colors`/`Fonts` system and are **not** the app's actual design system — don't reach for those when styling new screens, use `constants/design.ts`.
