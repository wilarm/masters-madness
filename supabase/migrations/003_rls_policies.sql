-- ============================================================
-- Masters Madness 2026 — Phase 16: RLS + Schema Fixes
-- Migration: 003_rls_policies.sql
-- ============================================================
--
-- ARCHITECTURE NOTE — Clerk + Supabase (service role pattern):
--   • This app uses Clerk for authentication, NOT Supabase Auth.
--   • auth.uid() is always NULL for direct client (anon key) calls.
--   • All data access goes through Next.js API routes which use
--     the service_role key — the service role bypasses all RLS.
--   • Result: RLS acts as a strict deny-all for any direct
--     anon/client-side DB access, which is intentional.
--   • The policies below define the intended access model clearly
--     for documentation purposes and defense-in-depth.
-- ============================================================


-- ============================================================
-- SCHEMA FIXES: add columns that were applied manually
-- ============================================================

alter table pool_members
  add column if not exists display_name text,
  add column if not exists custom_tag   text;


-- ============================================================
-- POOL MEMBERS — missing write policies
-- ============================================================

-- Anyone can insert themselves as a member (joining a pool)
-- In practice this always goes through /api/pools/[slug]/join
-- which uses the service role, but the policy is here for clarity.
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'pool_members' and policyname = 'pool_members_insert_self'
  ) then
    create policy "pool_members_insert_self" on pool_members
      for insert with check (user_id = auth.uid()::text);
  end if;
end $$;

-- Pool commissioner (creator) can update any member in their pool
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'pool_members' and policyname = 'pool_members_commissioner_update'
  ) then
    create policy "pool_members_commissioner_update" on pool_members
      for update using (
        pool_id in (
          select id from pools where created_by = auth.uid()::text
        )
      );
  end if;
end $$;

-- Pool commissioner can remove members from their pool
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'pool_members' and policyname = 'pool_members_commissioner_delete'
  ) then
    create policy "pool_members_commissioner_delete" on pool_members
      for delete using (
        pool_id in (
          select id from pools where created_by = auth.uid()::text
        )
      );
  end if;
end $$;


-- ============================================================
-- POOLS — write policies (create + commissioner update)
-- ============================================================

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'pools' and policyname = 'pools_owner_insert'
  ) then
    create policy "pools_owner_insert" on pools
      for insert with check (created_by = auth.uid()::text);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'pools' and policyname = 'pools_owner_update'
  ) then
    create policy "pools_owner_update" on pools
      for update using (created_by = auth.uid()::text);
  end if;
end $$;


-- ============================================================
-- PICKS — post-lock pool-member read
-- (pre-lock: only owner can read own picks — already in 001)
-- (post-lock: all pool members can read all picks in their pool)
-- ============================================================

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'picks' and policyname = 'picks_pool_member_post_lock_select'
  ) then
    create policy "picks_pool_member_post_lock_select" on picks
      for select using (
        -- Pool state is post_lock / in_progress / complete
        (
          select state from pools where id = picks.pool_id
        ) in ('post_lock', 'in_progress', 'complete')
        -- And the requesting user is a member of this pool
        and pool_id in (
          select pool_id from pool_members where user_id = auth.uid()::text
        )
      );
  end if;
end $$;


-- ============================================================
-- SETTINGS — no public access (service role only)
-- Already enabled in 002; policy block ensures nothing slips
-- ============================================================

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'settings' and policyname = 'settings_deny_all_public'
  ) then
    -- No rows returned for any direct public access
    create policy "settings_deny_all_public" on settings
      for select using (false);
  end if;
end $$;
