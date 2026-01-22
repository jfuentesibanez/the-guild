-- supabase/migrations/004_masters_twitter.sql
-- Add twitter handle and platform fields to masters

-- Add twitter_handle for linking to their public reasoning
ALTER TABLE masters ADD COLUMN IF NOT EXISTS twitter_handle TEXT;

-- Add platform to track where they primarily trade
ALTER TABLE masters ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'polymarket';

-- Add verified flag for real masters vs fictional
ALTER TABLE masters ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Index for filtering verified masters
CREATE INDEX IF NOT EXISTS idx_masters_verified ON masters(verified);
