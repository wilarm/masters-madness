-- ============================================================
-- Masters Madness 2026 — Settings Table
-- Migration: 002_settings.sql
-- ============================================================

create table if not exists settings (
  key        text primary key,
  value      jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create or replace trigger settings_updated_at
  before update on settings
  for each row execute function set_updated_at();

-- Service role only (RLS blocks all public access)
alter table settings enable row level security;

-- Insert default rules content
insert into settings (key, value) values (
  'rules',
  '{
    "communityMessage": "Beyond the competition, this pool is about community. A portion of the proceeds will go to support someone in our community who could use a little help. Details will be shared before the tournament.",
    "deadline": "~5am MT, Thursday, April 9th, 2026",
    "entryFee": "$100 per team (max 2 entries per person)",
    "maxEntries": "2 teams per participant",
    "paymentInfo": "Venmo or contact pool admin for arrangements",
    "payouts": [
      { "place": "1st", "amount": "$1,000", "highlight": true },
      { "place": "2nd", "amount": "$400", "highlight": false },
      { "place": "3rd", "amount": "$100", "highlight": false }
    ],
    "payoutNote": "Total prize pool: $1,500. Tiebreakers are in place to ensure fairness and competition.",
    "shareUrl": "mastersmadness.com"
  }'::jsonb
) on conflict (key) do nothing;
