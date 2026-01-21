-- supabase/migrations/003_apprenticeships_positions.sql

-- Apprenticeships table
CREATE TABLE apprenticeships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  master_id UUID REFERENCES masters(id) ON DELETE CASCADE,
  sizing_mode TEXT NOT NULL DEFAULT 'fixed' CHECK (sizing_mode IN ('match', 'half', 'fixed')),
  fixed_amount DECIMAL(12,2) DEFAULT 100.00,
  auto_copy BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, master_id)
);

-- Positions table
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  master_id UUID REFERENCES masters(id) ON DELETE SET NULL,
  market_question TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('YES', 'NO')),
  entry_odds DECIMAL(5,4) NOT NULL,
  entry_amount DECIMAL(12,2) NOT NULL,
  entry_date TIMESTAMPTZ DEFAULT NOW(),
  current_odds DECIMAL(5,4),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'WON', 'LOST')),
  return_amount DECIMAL(12,2),
  source TEXT NOT NULL CHECK (source IN ('COPY', 'OWN')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_apprenticeships_user_id ON apprenticeships(user_id);
CREATE INDEX idx_apprenticeships_master_id ON apprenticeships(master_id);
CREATE INDEX idx_positions_user_id ON positions(user_id);
CREATE INDEX idx_positions_bet_id ON positions(bet_id);
CREATE INDEX idx_positions_status ON positions(status);

-- Enable RLS
ALTER TABLE apprenticeships ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Apprenticeships policies
CREATE POLICY "Users can view their own apprenticeships" ON apprenticeships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create apprenticeships" ON apprenticeships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own apprenticeships" ON apprenticeships
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own apprenticeships" ON apprenticeships
  FOR DELETE USING (auth.uid() = user_id);

-- Positions policies
CREATE POLICY "Users can view their own positions" ON positions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create positions" ON positions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own positions" ON positions
  FOR UPDATE USING (auth.uid() = user_id);
