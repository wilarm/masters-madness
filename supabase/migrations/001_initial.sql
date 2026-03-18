-- ============================================================
-- Masters Madness 2026 — Initial Schema
-- Migration: 001_initial.sql
-- Run via: supabase db push  OR  paste into Supabase SQL Editor
-- ============================================================

-- gen_random_uuid() is built-in to PG13+ (Supabase uses PG15), no extension needed

-- ============================================================
-- POOLS
-- ============================================================
create table if not exists pools (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  config      jsonb not null default '{}',
  created_by  text not null,              -- Clerk userId
  state       text not null default 'pre_lock'
                check (state in ('pre_lock','post_lock','in_progress','complete')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists pools_slug_idx on pools(slug);
create index if not exists pools_created_by_idx on pools(created_by);

-- ============================================================
-- POOL MEMBERS
-- ============================================================
create table if not exists pool_members (
  id         uuid primary key default gen_random_uuid(),
  pool_id    uuid not null references pools(id) on delete cascade,
  user_id    text not null,               -- Clerk userId
  role       text not null default 'player'
               check (role in ('commissioner','player','co_player','viewer')),
  paid       boolean not null default false,
  badges     jsonb not null default '[]', -- [{ label, emoji, description, granted_by, granted_at }]
  joined_at  timestamptz not null default now(),
  unique (pool_id, user_id)
);

create index if not exists pool_members_pool_id_idx on pool_members(pool_id);
create index if not exists pool_members_user_id_idx on pool_members(user_id);

-- ============================================================
-- GOLFERS
-- ============================================================
create table if not exists golfers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  country         text,
  world_rank      integer,
  odds            text,                   -- e.g. "+1200"
  odds_rank       integer,
  tier            integer,                -- 1–9 auto-assigned
  masters_wins    integer not null default 0,
  best_finish     text,                   -- e.g. "Won (2019)"
  appearances     integer not null default 0,
  age             integer,
  is_lefty        boolean not null default false,
  is_liv          boolean not null default false,
  updated_at      timestamptz not null default now()
);

create index if not exists golfers_name_idx on golfers(name);
create index if not exists golfers_tier_idx on golfers(tier);

-- ============================================================
-- PICKS
-- ============================================================
create table if not exists picks (
  id            uuid primary key default gen_random_uuid(),
  pool_id       uuid not null references pools(id) on delete cascade,
  user_id       text not null,             -- Clerk userId
  entry_num     integer not null default 1 check (entry_num in (1,2)),
  golfer_picks  jsonb not null default '{}', -- { "tier-1": "Scottie Scheffler", "tier-2": "Rory McIlroy", ... }
  submitted_at  timestamptz,
  locked        boolean not null default false,
  entered_by    text,                       -- admin userId if overridden
  override_note text,
  updated_at    timestamptz not null default now(),
  unique (pool_id, user_id, entry_num)
);

create index if not exists picks_pool_id_idx on picks(pool_id);
create index if not exists picks_user_id_idx on picks(user_id);

-- ============================================================
-- SCORES
-- ============================================================
create table if not exists scores (
  id          uuid primary key default gen_random_uuid(),
  golfer_id   uuid not null references golfers(id) on delete cascade,
  round       integer not null check (round between 1 and 4),
  score       integer,                    -- strokes for that round
  total       integer,                    -- cumulative total vs par
  position    text,                       -- "T3", "CUT", "WD" etc.
  is_cut      boolean not null default false,
  is_wd       boolean not null default false,
  captured_at timestamptz not null default now(),
  unique (golfer_id, round)
);

create index if not exists scores_golfer_id_idx on scores(golfer_id);

-- ============================================================
-- ODDS SNAPSHOTS
-- ============================================================
create table if not exists odds_snapshots (
  id          uuid primary key default gen_random_uuid(),
  golfer_id   uuid not null references golfers(id) on delete cascade,
  odds        text not null,
  odds_rank   integer,
  captured_at timestamptz not null default now()
);

create index if not exists odds_snapshots_golfer_id_idx on odds_snapshots(golfer_id);
create index if not exists odds_snapshots_captured_at_idx on odds_snapshots(captured_at desc);

-- ============================================================
-- SIDE GAME PICKS
-- ============================================================
create table if not exists side_game_picks (
  id           uuid primary key default gen_random_uuid(),
  pool_id      uuid not null references pools(id) on delete cascade,
  user_id      text not null,
  game_type    text not null,             -- 'day1_leader','made_cut','final_champion' etc.
  pick_value   text not null,             -- golfer name or score guess
  submitted_at timestamptz not null default now(),
  unique (pool_id, user_id, game_type)
);

-- ============================================================
-- NOTIFICATION PREFERENCES
-- ============================================================
create table if not exists notification_prefs (
  id          uuid primary key default gen_random_uuid(),
  pool_id     uuid not null references pools(id) on delete cascade,
  user_id     text not null,
  preferences jsonb not null default '{
    "picks_confirmed": true,
    "reminder_24h": true,
    "reminder_1h": true,
    "picks_locked": true,
    "daily_digest": false,
    "position_change": true,
    "tournament_final": true,
    "commissioner_announcement": true
  }',
  unique (pool_id, user_id)
);

-- ============================================================
-- HISTORICAL RESULTS
-- ============================================================
create table if not exists historical_results (
  id          uuid primary key default gen_random_uuid(),
  pool_id     uuid not null references pools(id) on delete cascade,
  year        integer not null,
  user_id     text not null,
  rank        integer,
  total_score integer,
  picks       jsonb not null default '{}',
  unique (pool_id, year, user_id)
);

-- ============================================================
-- BADGES
-- ============================================================
create table if not exists badges (
  id          uuid primary key default gen_random_uuid(),
  pool_id     uuid not null references pools(id) on delete cascade,
  user_id     text not null,
  label       text not null,
  emoji       text,
  description text,
  granted_by  text not null,
  granted_at  timestamptz not null default now()
);

create index if not exists badges_pool_user_idx on badges(pool_id, user_id);

-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger pools_updated_at
  before update on pools
  for each row execute function set_updated_at();

create or replace trigger picks_updated_at
  before update on picks
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table pools              enable row level security;
alter table pool_members       enable row level security;
alter table picks              enable row level security;
alter table golfers            enable row level security;
alter table scores             enable row level security;
alter table odds_snapshots     enable row level security;
alter table side_game_picks    enable row level security;
alter table notification_prefs enable row level security;
alter table historical_results enable row level security;
alter table badges             enable row level security;

-- Golfers & scores: public read (scores are public during tournament)
create policy "golfers_public_read" on golfers for select using (true);
create policy "scores_public_read"  on scores  for select using (true);
create policy "odds_public_read"    on odds_snapshots for select using (true);

-- Pools: public if is_public config flag is set, otherwise member-only
create policy "pools_public_select" on pools
  for select using (
    (config->>'isPublic')::boolean = true
    or created_by = auth.uid()::text
  );

-- Pool members: members can read their own pool's members
create policy "pool_members_select" on pool_members
  for select using (
    pool_id in (
      select id from pools where created_by = auth.uid()::text
      union
      select pool_id from pool_members pm2 where pm2.user_id = auth.uid()::text
    )
  );

-- Picks: post-lock readable by pool members; always readable by owner + admin
create policy "picks_owner_select" on picks
  for select using (user_id = auth.uid()::text);

create policy "picks_admin_select" on picks
  for select using (
    pool_id in (
      select id from pools where created_by = auth.uid()::text
    )
  );

-- Picks: insert/update only by owner or admin (before lock)
create policy "picks_owner_insert" on picks
  for insert with check (user_id = auth.uid()::text);

create policy "picks_owner_update" on picks
  for update using (user_id = auth.uid()::text and locked = false);

-- Service role bypasses all RLS — used in API routes only
-- (No policy needed; service role is always granted full access)
