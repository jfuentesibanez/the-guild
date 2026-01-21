// src/lib/types.ts

export interface Master {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  polymarket_wallet: string | null;
  primary_markets: string[];
  created_at: string;
}

export interface MasterStats {
  master_id: string;
  total_bets: number;
  wins: number;
  losses: number;
  pending: number;
  win_rate: number;
  total_return: number;
  avg_return: number;
  current_streak: number;
  best_streak: number;
  contrarian_score: number;
  rank: number;
  updated_at: string;
}

export interface MasterWithStats extends Master {
  master_stats: MasterStats | null;
}

export interface Bet {
  id: string;
  master_id: string;
  market_question: string;
  market_url: string | null;
  market_category: string;
  side: 'YES' | 'NO';
  entry_odds: number;
  entry_amount: number;
  entry_date: string;
  exit_odds: number | null;
  exit_date: string | null;
  current_odds: number | null;
  status: 'OPEN' | 'WON' | 'LOST';
  return_pct: number | null;
  reasoning: string | null;
  created_at: string;
}

export type MarketCategory = 'politics' | 'crypto' | 'sports' | 'science' | 'culture' | 'other';

export type SortOption = 'rank' | 'win_rate' | 'total_return' | 'current_streak';

// User types
export interface User {
  id: string;
  username: string;
  virtual_bankroll: number;
  level: number;
  xp: number;
  created_at: string;
}

export interface Follow {
  user_id: string;
  master_id: string;
  created_at: string;
}

export interface UserWithFollows extends User {
  follows: Follow[];
}

// Apprenticeship types
export type SizingMode = 'match' | 'half' | 'fixed';

export interface Apprenticeship {
  id: string;
  user_id: string;
  master_id: string;
  sizing_mode: SizingMode;
  fixed_amount: number | null;
  auto_copy: boolean;
  active: boolean;
  created_at: string;
}

export interface ApprenticeshipWithMaster extends Apprenticeship {
  master: Master;
}

// Position types
export type PositionSource = 'COPY' | 'OWN';
export type PositionStatus = 'OPEN' | 'WON' | 'LOST';

export interface Position {
  id: string;
  user_id: string;
  bet_id: string | null;
  master_id: string | null;
  market_question: string;
  side: 'YES' | 'NO';
  entry_odds: number;
  entry_amount: number;
  entry_date: string;
  current_odds: number | null;
  status: PositionStatus;
  return_amount: number | null;
  source: PositionSource;
  created_at: string;
}

export interface PositionWithMaster extends Position {
  master: Master | null;
}
