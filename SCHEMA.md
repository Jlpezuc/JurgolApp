# JurgolApp — Supabase Schema

## Supabase Project
- **URL:** `https://edwpmnirzoeqntmzzyik.supabase.co`
- **Anon Key:** en `.env.local` como `EXPO_PUBLIC_SUPABASE_ANON_KEY`

This file documents the schema as actually queried by the app code. `supabase/migration.sql` is the canonical, idempotent, re-runnable script that produced it (including the full SQL for the trigger functions summarized below) — treat it as the source of truth for *why* something exists, and re-run it against a fresh project to bring it up to date.

---

## Tablas

### `public.players`
Perfil del jugador. Vinculado 1:1 con un usuario de Supabase Auth vía `user_id` — pero puede existir **sin** cuenta (un capitán puede añadir un jugador directamente al plantel sin invitar a nadie).

| Columna       | Tipo        | Notas                                                        |
|---------------|-------------|---------------------------------------------------------------|
| `id`          | `uuid` PK   | `gen_random_uuid()`                                           |
| `user_id`     | `uuid` UNIQUE, nullable | FK → `auth.users(id)`. `null` si el jugador fue añadido manualmente por un capitán y no tiene cuenta propia. |
| `full_name`   | `varchar`   | Requerido                                                      |
| `username`    | `varchar` UNIQUE, nullable | Usado para buscar/invitar jugadores. Constraint `players_username_unique`. |
| `phone`       | `varchar`   | Nullable, opcional en signup/edición                          |
| `birth_date`  | `date`      | Nullable                                                       |
| `photo_url`   | `varchar`   | Nullable                                                       |
| `overall`     | `int`       | Rating 0–99 del jugador. Se ajusta automáticamente (K=4) por el trigger `apply_match_elo` tras cada partido jugado en el que estuvo `confirmed`. |
| `has_account` | `boolean`   | Si tiene cuenta real (`user_id` seteado) vs. fue añadido directo al plantel. |
| `created_at`  | `timestamp` | `now()`                                                        |

**Flujo:** al hacer signup se crea automáticamente un registro en esta tabla con `user_id` + `full_name` (vía trigger de Auth); la pantalla de signup luego hace `UPDATE` para setear `username`/`phone`.

No hay concepto de posición de jugador (se eliminó del código y de la UI por completo; la columna `position`, si aún existe en la BD, ya no se lee ni se escribe).

---

### `public.teams`
Equipo creado por un jugador.

| Columna       | Tipo        | Notas                                                    |
|---------------|-------------|------------------------------------------------------------|
| `id`          | `uuid` PK   | `gen_random_uuid()`                                         |
| `name`        | `varchar`   | Requerido                                                    |
| `description` | `text`      | Nullable                                                     |
| `logo_url`    | `varchar`   | Nullable                                                     |
| `created_by`  | `uuid` NOT NULL | FK → `public.players(id)`. Es la fuente de verdad de "quién es el capitán" — la UI siempre compara `team.created_by === currentPlayer.id`, nunca el string `role`. |
| `elo`         | `int`       | Default `1500`. Elo real (K=32), actualizado automáticamente por el trigger `apply_match_elo` cuando un partido pasa a `status = 'played'`. |
| `created_at`  | `timestamp` | `now()`                                                      |

**Trigger `handle_new_team`** (`before/after insert on teams`): inserta automáticamente al creador en `team_members` con `role = 'owner'`, `status = 'accepted'`.

---

### `public.team_members`
Relación muchos-a-muchos entre jugadores y equipos.

| Columna         | Tipo        | Notas                                                     |
|-----------------|-------------|--------------------------------------------------------------|
| `id`            | `uuid` PK   | `gen_random_uuid()`                                          |
| `team_id`       | `uuid`      | FK → `public.teams(id)`                                      |
| `player_id`     | `uuid`      | FK → `public.players(id)`                                    |
| `role`          | `varchar`   | Default `'player'`. **CHECK**: solo `'owner' \| 'admin' \| 'coach' \| 'player'` — **no** incluye `'captain'`. |
| `status`        | `varchar`   | **CHECK**: `'pending' \| 'accepted' \| 'rejected'`. Fila queda `pending` hasta que el jugador responde una invitación (RPC `respond_to_invitation`). |
| `jersey_number` | `int`       | Nullable, dorsal opcional                                     |
| `joined_at`     | `timestamp` | `now()`                                                        |

Insertar/actualizar filas de invitación se hace vía las RPC `invite_player` / `respond_to_invitation` (ver más abajo), **no** con `insert`/`update` directos desde el cliente, salvo para añadir un jugador sin cuenta directamente al plantel (`app/(squad)/squad-details/add-player/index.tsx`, que sí inserta `team_members` directo porque no hay a quién invitar).

---

### `public.notifications`
Bandeja de notificaciones unificada para todos los tipos de aviso de la app.

| Columna              | Tipo        | Notas                                                    |
|----------------------|-------------|--------------------------------------------------------------|
| `id`                 | `uuid` PK   | `gen_random_uuid()`                                          |
| `recipient_player_id`| `uuid` NOT NULL | FK → `public.players(id)`. A quién le llega.               |
| `type`                | `varchar`   | **CHECK**: `'team_invitation' \| 'player_removed' \| 'match_created' \| 'team_challenge' \| 'announcement'` (constraint `notifications_type_check`, ampliado respecto al original que solo tenía los primeros dos). |
| `message`             | `text`      | Nullable — mensaje libre (invitación, aviso de capitán, etc). Si es `null`/vacío la UI genera un texto por defecto según `type`. |
| `is_read`              | `boolean`   | Default `false`                                              |
| `team_member_id`       | `uuid`      | Nullable. FK → `public.team_members(id)`. Usado por `team_invitation` — de aquí sale el `status` que determina si la notificación es "pendiente de respuesta". |
| `match_id`             | `uuid`      | Nullable. FK → `public.matches(id)`. Usado por `match_created` y `team_challenge`. |
| `team_id`              | `uuid`      | Nullable. FK → `public.teams(id)`. Usado por `announcement` (para mostrar el badge del equipo del capitán). |
| `created_at`            | `timestamp` | `now()`                                                        |

No hay columna de "remitente": para `team_invitation` el invitador sale de `team_member.team.inviter` (join hasta `teams.created_by` → `players`); para `announcement` no se guarda quién lo mandó, solo el equipo.

---

### `public.matches`
Un partido, organizado por un equipo (`home_team_id`), opcionalmente contra otro (`away_team_id`).

| Columna             | Tipo         | Notas                                                     |
|---------------------|--------------|---------------------------------------------------------------|
| `id`                | `uuid` PK    | `gen_random_uuid()`                                            |
| `home_team_id`      | `uuid` NOT NULL | FK → `public.teams(id)`. Equipo organizador.                |
| `away_team_id`      | `uuid`       | Nullable. FK → `public.teams(id)`. Se completa al aceptar un `team_challenge`, o de una vez si se creó como revancha. |
| `modality`          | `varchar`    | `'5v5' \| '7v7' \| '11v11'`                                    |
| `date`              | `timestamptz`| Requerido                                                       |
| `location`          | `varchar`    | Nullable                                                        |
| `seeking_opponent`  | `boolean`    | Default `false`. `true` si el partido busca un equipo rival (modo "abierto"; en modo "equipo específico" queda `false` porque ya se creó un `match_challenges` dirigido). |
| `slots_needed`      | `int`        | Default `0`. Cupos abiertos para jugadores sueltos (solo tiene sentido cuando `seeking_opponent = false`). |
| `status`            | `varchar`    | `'scheduled' \| 'played' \| 'cancelled'`                        |
| `score_home`        | `int`        | Nullable hasta que se carga el resultado.                       |
| `score_away`        | `int`        | Nullable hasta que se carga el resultado.                       |
| `elo_applied`       | `boolean`    | Default `false`. Evita que el trigger `apply_match_elo` aplique el ajuste dos veces. |
| `created_by`        | `uuid` NOT NULL | FK → `public.players(id)`                                    |
| `created_at`        | `timestamptz`| `now()`                                                          |

**Trigger `apply_match_elo`** (`before update on matches`, ver SQL completo en `supabase/migration.sql`): cuando una fila pasa a `status = 'played'` con `away_team_id`, `score_home` y `score_away` seteados y `elo_applied = false`, calcula Elo real (K=32, esperanza logística estándar) para ambos equipos, escribe el nuevo `teams.elo`, inserta dos filas en `team_elo_history`, ajusta `overall` (K=4, clamp 0–99) de cada jugador `confirmed` en `match_players` para ese partido, y marca `elo_applied = true`.

---

### `public.match_players`
Quién juega en un partido — sea del equipo organizador, un jugador suelto que se sumó, o (implícitamente, vía `team_side`) del equipo rival.

| Columna     | Tipo        | Notas                                                        |
|-------------|-------------|------------------------------------------------------------------|
| `id`        | `uuid` PK   | `gen_random_uuid()`                                                |
| `match_id`  | `uuid` NOT NULL | FK → `public.matches(id)` `on delete cascade`                  |
| `player_id` | `uuid` NOT NULL | FK → `public.players(id)`                                      |
| `team_side` | `varchar`   | Default `'home'`. `'home' \| 'away'`.                              |
| `status`    | `varchar`   | Default `'invited'`. `'invited' \| 'confirmed' \| 'declined'`.     |
| `source`    | `varchar`   | Default `'captain'`. `'captain' \| 'notification' \| 'open_slot'` — de dónde vino la fila (convocado a mano, se unió por notificación, o llenó un cupo abierto). |
| `mvp`       | `boolean`   | Default `false`. Se marca al cargar el resultado del partido.      |
| `created_at`| `timestamptz`| `now()`                                                            |
| —           | UNIQUE      | `(match_id, player_id)` — un jugador no puede estar dos veces en el mismo partido. |

---

### `public.match_challenges`
Postulaciones de otros equipos a un partido "abierto" (`matches.seeking_opponent = true`).

| Columna              | Tipo        | Notas                                                    |
|----------------------|-------------|--------------------------------------------------------------|
| `id`                  | `uuid` PK   | `gen_random_uuid()`                                            |
| `match_id`            | `uuid` NOT NULL | FK → `public.matches(id)` `on delete cascade`                |
| `challenger_team_id`  | `uuid` NOT NULL | FK → `public.teams(id)`                                       |
| `status`              | `varchar`   | Default `'pending'`. `'pending' \| 'accepted' \| 'rejected'`.  |
| `created_at`           | `timestamptz`| `now()`                                                          |
| —                      | UNIQUE      | `(match_id, challenger_team_id)` — un equipo no puede postularse dos veces al mismo partido. |

Al aceptar una postulación (`app/(squad)/notifications/match/[id].tsx`): se actualiza el `match` (`away_team_id`, `status = 'scheduled'`, `seeking_opponent = false`), esa fila pasa a `accepted` y el resto de postulaciones pendientes al mismo partido pasan a `rejected`.

---

### `public.team_messages`
Chat simple por equipo (solo texto, sin threads/reacciones).

| Columna     | Tipo         | Notas                                       |
|-------------|--------------|-----------------------------------------------|
| `id`        | `uuid` PK    | `gen_random_uuid()`                             |
| `team_id`   | `uuid` NOT NULL | FK → `public.teams(id)` `on delete cascade`   |
| `player_id` | `uuid` NOT NULL | FK → `public.players(id)`                     |
| `message`   | `text` NOT NULL |                                                |
| `created_at`| `timestamptz`| `now()`                                          |

Leído/escrito en tiempo real vía Supabase Realtime (`postgres_changes` en `INSERT`, filtrado por `team_id`) desde `app/(squad)/squad-details/chat/[id].tsx`.

---

### `public.team_elo_history`
Auditoría de cada ajuste de Elo aplicado a un equipo.

| Columna       | Tipo        | Notas                                  |
|---------------|-------------|--------------------------------------------|
| `id`          | `uuid` PK   | `gen_random_uuid()`                          |
| `team_id`     | `uuid` NOT NULL | FK → `public.teams(id)`                    |
| `match_id`    | `uuid`      | Nullable. FK → `public.matches(id)`         |
| `elo_before`  | `int` NOT NULL |                                            |
| `elo_after`   | `int` NOT NULL |                                            |
| `created_at`  | `timestamptz`| `now()`                                       |

Escrita únicamente por el trigger `apply_match_elo` — no hay código de la app que inserte aquí directamente. No tiene ningún hook/pantalla que la lea todavía (queda como auditoría cruda).

---

## RPC functions

Ambas son `SECURITY DEFINER`, preexistentes en el proyecto de Supabase (no definidas en `supabase/migration.sql` — solo adoptadas/llamadas desde el código). Úsalas en vez de escribir directo a `team_members`/`notifications` para invitaciones.

- **`invite_player(p_team_id uuid, p_player_id uuid, p_role text, p_message text default null)`** — crea la fila `team_members` (`status = 'pending'`) y la `notifications` de tipo `team_invitation` correspondiente, atómicamente. Llamado desde `components/squad-details/invite-modal/invite-modal.tsx`.
- **`respond_to_invitation(p_team_member_id uuid, p_accept boolean)`** — actualiza `team_members.status` a `accepted`/`rejected` y marca la notificación asociada como resuelta. Llamado desde `app/(squad)/notifications/[id].tsx`.

## Triggers

Definidos con SQL completo en `supabase/migration.sql` (sección "Adopt the pre-existing backend"):

- **`handle_new_team`** — `before/after insert on teams` → inserta al creador en `team_members` como `role = 'owner'`, `status = 'accepted'`.
- **`on_match_played` → `apply_match_elo()`** — `before update on matches` → aplica el ajuste de Elo (equipos + jugadores) descrito en la tabla `matches` arriba.

---

## Notas importantes

- **Auth:** Supabase Auth maneja email/password. Al registrarse, Supabase puede enviar un email de confirmación — si quieres desactivarlo ve a _Auth > Settings > Confirm email_ en el dashboard.
- **RLS:** `players`, `teams`, `team_members`, `notifications` tienen RLS activo (política `authenticated` / `auth.uid() IS NOT NULL`). `matches`, `match_players`, `match_challenges`, `team_messages`, `team_elo_history` tienen RLS **desactivado**, consistente entre sí.
- **Gotcha de embeds:** los `select` con relaciones anidadas (ej. `teams!matches_home_team_id_fkey(...)`) solo resuelven correctamente contra una sesión autenticada — con solo la anon key (sin usuario logueado) las relaciones embebidas vuelven `null` por RLS, aunque la consulta no tenga ningún error de sintaxis.
- **Session persistence:** el cliente usa `AsyncStorage` para persistir la sesión entre reinicios de la app (nativo); en web usa detección por URL.
