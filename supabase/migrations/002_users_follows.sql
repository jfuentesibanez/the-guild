-- supabase/migrations/002_users_follows.sql

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  virtual_bankroll DECIMAL(12,2) DEFAULT 10000.00,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows table
CREATE TABLE follows (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  master_id UUID REFERENCES masters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, master_id)
);

-- Indexes
CREATE INDEX idx_follows_user_id ON follows(user_id);
CREATE INDEX idx_follows_master_id ON follows(master_id);
CREATE INDEX idx_users_username ON users(username);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Follows policies
CREATE POLICY "Users can view their own follows" ON follows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can follow masters" ON follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow masters" ON follows
  FOR DELETE USING (auth.uid() = user_id);

-- Public read: Allow anyone to see follow counts (for master profiles)
CREATE POLICY "Anyone can count follows" ON follows
  FOR SELECT USING (true);
