-- Migration 004: Add event_id to scores for multi-tournament support
-- This allows scores from multiple PGA Tour events to coexist in the DB.
-- event_id maps to the external API's event identifier (e.g. ESPN event ID or DataGolf event slug).
-- Phase 28 will introduce a formal `tournaments` table and FK — for now this is a plain text column.

-- Add event_id column (default 'default' so existing rows stay valid)
ALTER TABLE scores ADD COLUMN IF NOT EXISTS event_id TEXT NOT NULL DEFAULT 'default';

-- Drop old unique constraint that only covered (golfer_id, round)
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_golfer_id_round_key;

-- New constraint: each golfer has at most one score row per (event, round)
ALTER TABLE scores ADD CONSTRAINT scores_golfer_event_round_unique
  UNIQUE (golfer_id, event_id, round);
