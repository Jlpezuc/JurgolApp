-- JurgolApp — batch feature migration
-- Run this in the Supabase SQL Editor (dashboard) for the project at
-- https://edwpmnirzoeqntmzzyik.supabase.co before using the new app code.
--
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS / guarded DO blocks throughout.

-- ── Elo ──────────────────────────────────────────────────────────────────────
-- teams.elo already existed (default 1500, real Elo scale) as part of a
-- pre-existing backend system — see the "adopt existing backend" section below.

-- ── Signup fields ────────────────────────────────────────────────────────────
alter table public.players add column if not exists phone varchar;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'players_username_unique') then
    alter table public.players add constraint players_username_unique unique (username);
  end if;
end $$;

-- ── Replace the legacy/scaffold match tables ────────────────────────────────
-- These hold only disposable seed/demo data (confirmed with the project owner)
-- from an earlier, never-wired-up design: matches/match_participations use a
-- different shape (team_id + opponent_name/opponent_team_id + result text),
-- plus a team_elo_history table and player_stats/team_stats views computed
-- from them. None of it is referenced by any app code. Drop in dependency order.
drop view if exists public.player_stats;
drop view if exists public.team_stats;
drop table if exists public.team_elo_history;
drop table if exists public.match_participations;
drop table if exists public.matches;

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid not null references public.teams(id),
  away_team_id uuid references public.teams(id),
  modality varchar not null,                    -- '5v5' | '7v7' | '11v11'
  date timestamptz not null,
  location varchar,
  seeking_opponent boolean not null default false,
  slots_needed int not null default 0,
  status varchar not null default 'scheduled',  -- scheduled | played | cancelled
  score_home int,
  score_away int,
  created_by uuid not null references public.players(id),
  created_at timestamptz not null default now()
);

create table public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id),
  team_side varchar not null default 'home',    -- home | away
  status varchar not null default 'invited',    -- invited | confirmed | declined
  source varchar not null default 'captain',    -- captain | notification | open_slot
  mvp boolean not null default false,
  created_at timestamptz not null default now(),
  unique (match_id, player_id)
);

create table public.match_challenges (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  challenger_team_id uuid not null references public.teams(id),
  status varchar not null default 'pending',    -- pending | accepted | rejected
  created_at timestamptz not null default now(),
  unique (match_id, challenger_team_id)
);

-- ── Team chat ────────────────────────────────────────────────────────────────
create table public.team_messages (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id),
  message text not null,
  created_at timestamptz not null default now()
);

-- ── Notifications: link to matches + captain announcements ─────────────────────
alter table public.notifications
  add column if not exists match_id uuid references public.matches(id),
  add column if not exists team_id uuid references public.teams(id);

-- notifications.type had a CHECK constraint limiting it to the original two
-- values ('team_invitation', 'player_removed') — widen it for the three new types.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type::text = ANY (ARRAY[
    'team_invitation','player_removed','match_created','team_challenge','announcement'
  ]::text[]));

-- ── RLS: keep disabled, consistent with the rest of the schema ─────────────────
alter table public.matches disable row level security;
alter table public.match_players disable row level security;
alter table public.match_challenges disable row level security;
alter table public.team_messages disable row level security;

-- ═══════════════════════════════════════════════════════════════════════════
-- Adopt the pre-existing backend
-- ═══════════════════════════════════════════════════════════════════════════
-- This project already had a server-side system built separately (not by
-- Claude, and not reflected anywhere in the app code or SCHEMA.md):
--   - handle_new_team (trigger on teams insert)
--   - invite_player(team_id, player_id, role, message) RPC
--   - respond_to_invitation(team_member_id, accept) RPC
--   - apply_match_elo (trigger function, real Elo math — teams start at 1500,
--     not a static 1-100 number)
-- invite_player/respond_to_invitation are unchanged and adopted as-is (the
-- app now calls them via supabase.rpc(...) instead of raw inserts/updates).
-- handle_new_team and apply_match_elo needed fixes/adaptation below.

-- Fix handle_new_team: the original inserted the creator as role='coach',
-- status='pending' (team_members' own CHECK constraint doesn't even allow
-- 'captain' — valid roles are owner/admin/coach/player). Creator should be
-- an accepted owner.
create or replace function public.handle_new_team()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into team_members (team_id, player_id, role, status)
  values (new.id, new.created_by, 'owner', 'accepted');
  return new;
end;
$$;

-- Restore team_elo_history (dropped earlier along with the old matches shape)
create table if not exists public.team_elo_history (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id),
  match_id uuid references public.matches(id),
  elo_before integer not null,
  elo_after integer not null,
  created_at timestamptz not null default now()
);
alter table public.team_elo_history disable row level security;

-- matches needs elo_applied to track whether a played match already updated elo
alter table public.matches add column if not exists elo_applied boolean not null default false;

-- Rewrite apply_match_elo for the new matches shape (home_team_id/away_team_id/
-- score_home/score_away instead of the old team_id/opponent_team_id/result)
create or replace function public.apply_match_elo()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  k_team   constant numeric := 32;
  k_player constant numeric := 4;
  r_home   integer;
  r_away   integer;
  new_home integer;
  new_away integer;
  e_home   numeric;
  s_home   numeric;
begin
  if NEW.status = 'played'
     and NEW.away_team_id is not null
     and NEW.score_home is not null
     and NEW.score_away is not null
     and NEW.elo_applied = false
  then
    select elo into r_home from public.teams where id = NEW.home_team_id;
    select elo into r_away from public.teams where id = NEW.away_team_id;

    e_home := 1.0 / (1.0 + power(10, (r_away - r_home) / 400.0));
    s_home := case
                when NEW.score_home > NEW.score_away then 1
                when NEW.score_home = NEW.score_away then 0.5
                else 0
              end;

    new_home := round(r_home + k_team * (s_home - e_home));
    new_away := round(r_away + k_team * ((1 - s_home) - (1 - e_home)));

    update public.teams set elo = new_home where id = NEW.home_team_id;
    update public.teams set elo = new_away where id = NEW.away_team_id;

    insert into public.team_elo_history (team_id, match_id, elo_before, elo_after)
    values
      (NEW.home_team_id, NEW.id, r_home, new_home),
      (NEW.away_team_id, NEW.id, r_away, new_away);

    update public.players p
      set overall = greatest(0, least(99, round(p.overall + k_player * (s_home - e_home))))
      where p.id in (
        select mp.player_id from public.match_players mp
        where mp.match_id = NEW.id and mp.status = 'confirmed'
      );

    NEW.elo_applied := true;
  end if;

  return NEW;
end;
$$;

drop trigger if exists on_match_played on public.matches;
create trigger on_match_played
  before update on public.matches
  for each row
  execute function apply_match_elo();
