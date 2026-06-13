# JurgolApp — Supabase Schema

## Supabase Project
- **URL:** `https://edwpmnirzoeqntmzzyik.supabase.co`
- **Anon Key:** en `.env.local` como `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## Tablas

### `public.players`
Perfil del jugador, vinculado 1:1 con un usuario de Supabase Auth.

| Columna      | Tipo        | Notas                              |
|--------------|-------------|------------------------------------|
| `id`         | `uuid` PK   | `gen_random_uuid()`                |
| `user_id`    | `uuid` UNIQUE | FK → `auth.users(id)`            |
| `full_name`  | `varchar`   | Requerido                          |
| `position`   | `varchar`   | Nullable                           |
| `birth_date` | `date`      | Nullable                           |
| `photo_url`  | `varchar`   | Nullable                           |
| `created_at` | `timestamp` | `now()`                            |

**Flujo:** Al hacer signup se crea automáticamente un registro en esta tabla con `user_id` + `full_name`.

---

### `public.teams`
Equipo creado por un jugador.

| Columna       | Tipo        | Notas                           |
|---------------|-------------|---------------------------------|
| `id`          | `uuid` PK   | `gen_random_uuid()`             |
| `name`        | `varchar`   | Requerido                       |
| `description` | `text`      | Nullable                        |
| `logo_url`    | `varchar`   | Nullable                        |
| `created_by`  | `uuid`      | FK → `public.players(id)`       |
| `created_at`  | `timestamp` | `now()`                         |

---

### `public.team_members`
Relación muchos-a-muchos entre jugadores y equipos.

| Columna     | Tipo        | Notas                          |
|-------------|-------------|--------------------------------|
| `id`        | `uuid` PK   | `gen_random_uuid()`            |
| `team_id`   | `uuid`      | FK → `public.teams(id)`        |
| `player_id` | `uuid`      | FK → `public.players(id)`      |
| `role`      | `varchar`   | Default `'player'`             |
| `joined_at` | `timestamp` | `now()`                        |

---

## SQL Completo

```sql
CREATE TABLE public.players (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  full_name character varying NOT NULL,
  position character varying,
  birth_date date,
  photo_url character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT players_pkey PRIMARY KEY (id),
  CONSTRAINT players_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  logo_url character varying,
  created_by uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.players(id)
);

CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  player_id uuid NOT NULL,
  role character varying NOT NULL DEFAULT 'player'::character varying,
  joined_at timestamp without time zone DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_members_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);
```

---

## Notas importantes

- **Auth:** Supabase Auth maneja email/password. Al registrarse, Supabase puede enviar un email de confirmación — si quieres desactivarlo ve a _Auth > Settings > Confirm email_ en el dashboard.
- **RLS:** Por defecto las tablas no tienen Row Level Security activo. Activarlo en producción es recomendado.
- **Session persistence:** El cliente usa `AsyncStorage` para persistir la sesión entre reinicios de la app.
