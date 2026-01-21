# Phase 2: Masters & Leaderboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the masters leaderboard page and individual master profile pages with seeded data.

**Architecture:** Server components fetch data from Supabase. TypeScript types generated from schema. Reusable UI components styled with CSS variables. No client-side state management needed yet.

**Tech Stack:** Next.js 16 App Router, Supabase PostgreSQL, TypeScript, Tailwind v4

---

## Prerequisites

Before starting, you need a Supabase project:
1. Go to https://supabase.com and create a new project
2. Copy the project URL and anon key
3. Create `.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## Task 1: Create TypeScript Types

**Files:**
- Create: `src/lib/types.ts`

**Step 1: Create the types file**

```typescript
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
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add TypeScript types for masters and bets"
```

---

## Task 2: Create Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Create migrations directory and schema file**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Masters table
CREATE TABLE masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  polymarket_wallet TEXT,
  primary_markets TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master stats table
CREATE TABLE master_stats (
  master_id UUID PRIMARY KEY REFERENCES masters(id) ON DELETE CASCADE,
  total_bets INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  pending INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  total_return DECIMAL(10,2) DEFAULT 0,
  avg_return DECIMAL(10,2) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  contrarian_score INTEGER DEFAULT 50,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bets table
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID REFERENCES masters(id) ON DELETE CASCADE,
  market_question TEXT NOT NULL,
  market_url TEXT,
  market_category TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('YES', 'NO')),
  entry_odds DECIMAL(5,4) NOT NULL,
  entry_amount DECIMAL(12,2) NOT NULL,
  entry_date TIMESTAMPTZ NOT NULL,
  exit_odds DECIMAL(5,4),
  exit_date TIMESTAMPTZ,
  current_odds DECIMAL(5,4),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'WON', 'LOST')),
  return_pct DECIMAL(10,2),
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_master_stats_rank ON master_stats(rank);
CREATE INDEX idx_master_stats_win_rate ON master_stats(win_rate DESC);
CREATE INDEX idx_bets_master_id ON bets(master_id);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_masters_username ON masters(username);

-- Enable Row Level Security
ALTER TABLE masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Public read access policies (anyone can view masters and bets)
CREATE POLICY "Masters are viewable by everyone" ON masters FOR SELECT USING (true);
CREATE POLICY "Master stats are viewable by everyone" ON master_stats FOR SELECT USING (true);
CREATE POLICY "Bets are viewable by everyone" ON bets FOR SELECT USING (true);
```

**Step 2: Run migration in Supabase**

Option A - Via Supabase Dashboard:
1. Go to Supabase Dashboard > SQL Editor
2. Paste the SQL and run it

Option B - Via Supabase CLI:
```bash
npx supabase db push
```

**Step 3: Verify tables exist**

In Supabase Dashboard > Table Editor, confirm these tables exist:
- masters
- master_stats
- bets

**Step 4: Commit**

```bash
mkdir -p supabase/migrations
git add supabase/migrations/001_initial_schema.sql
git commit -m "feat: add database schema for masters, stats, and bets"
```

---

## Task 3: Create Seed Data

**Files:**
- Create: `supabase/seed.sql`

**Step 1: Create seed file with 10 masters**

```sql
-- supabase/seed.sql

-- Insert masters
INSERT INTO masters (id, username, display_name, bio, primary_markets) VALUES
  ('11111111-1111-1111-1111-111111111111', 'maria_macro', 'Maria Macro', 'Former Fed analyst. I read between the lines of FOMC statements.', ARRAY['politics', 'crypto']),
  ('22222222-2222-2222-2222-222222222222', 'data_dan', 'Data Dan', 'Quant trader turned prediction market enthusiast. Data > vibes.', ARRAY['politics', 'science']),
  ('33333333-3333-3333-3333-333333333333', 'contrarian_kate', 'Contrarian Kate', 'When everyone zigs, I zag. 78% of my wins come from betting against consensus.', ARRAY['politics', 'culture']),
  ('44444444-4444-4444-4444-444444444444', 'crypto_chris', 'Crypto Chris', 'On-chain analyst. I see where the money flows before the news breaks.', ARRAY['crypto']),
  ('55555555-5555-5555-5555-555555555555', 'political_pete', 'Political Pete', 'DC insider. 15 years in political consulting. I know how the sausage gets made.', ARRAY['politics']),
  ('66666666-6666-6666-6666-666666666666', 'sports_sam', 'Sports Sam', 'Former oddsmaker. Now I beat the books instead of setting them.', ARRAY['sports']),
  ('77777777-7777-7777-7777-777777777777', 'tech_tina', 'Tech Tina', 'Ex-FAANG PM. I predict product launches and regulatory moves.', ARRAY['science', 'crypto']),
  ('88888888-8888-8888-8888-888888888888', 'global_greg', 'Global Greg', 'Geopolitics is my game. Wars, elections, trade deals.', ARRAY['politics']),
  ('99999999-9999-9999-9999-999999999999', 'sigma_sarah', 'Sigma Sarah', 'Math PhD. I build models while others follow gut feelings.', ARRAY['science', 'crypto']),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'degen_dave', 'Degen Dave', 'High risk, high reward. Not for the faint of heart.', ARRAY['crypto', 'sports']);

-- Insert master stats
INSERT INTO master_stats (master_id, total_bets, wins, losses, pending, win_rate, total_return, avg_return, current_streak, best_streak, contrarian_score, rank) VALUES
  ('11111111-1111-1111-1111-111111111111', 847, 542, 298, 7, 64.52, 127.34, 14.2, 7, 12, 78, 1),
  ('22222222-2222-2222-2222-222222222222', 623, 386, 232, 5, 62.44, 98.76, 11.8, 3, 9, 45, 2),
  ('33333333-3333-3333-3333-333333333333', 412, 257, 151, 4, 62.98, 89.23, 12.4, 5, 11, 92, 3),
  ('44444444-4444-4444-4444-444444444444', 534, 310, 218, 6, 58.73, 156.89, 18.7, 2, 8, 55, 4),
  ('55555555-5555-5555-5555-555555555555', 389, 237, 148, 4, 61.54, 78.45, 10.2, 4, 10, 38, 5),
  ('66666666-6666-6666-6666-666666666666', 892, 498, 387, 7, 56.28, 67.32, 8.9, 1, 7, 42, 6),
  ('77777777-7777-7777-7777-777777777777', 287, 172, 112, 3, 60.56, 72.18, 13.1, 6, 8, 61, 7),
  ('88888888-8888-8888-8888-888888888888', 456, 261, 189, 6, 58.01, 54.67, 9.4, 0, 6, 71, 8),
  ('99999999-9999-9999-9999-999999999999', 198, 129, 67, 2, 65.82, 94.56, 16.8, 8, 8, 52, 9),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1243, 572, 658, 13, 46.50, 234.78, 22.3, -4, 5, 85, 10);

-- Insert sample bets for maria_macro
INSERT INTO bets (master_id, market_question, market_url, market_category, side, entry_odds, entry_amount, entry_date, current_odds, status, reasoning) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Fed cuts rates by March 2025', 'https://polymarket.com/event/fed-rate-cut', 'politics', 'YES', 0.73, 2400.00, '2024-11-15', 0.81, 'OPEN', 'Unemployment ticking up. Powell''s language softening. Bond market already pricing it in.'),
  ('11111111-1111-1111-1111-111111111111', 'Bitcoin above $100K by June 2025', 'https://polymarket.com/event/btc-100k', 'crypto', 'YES', 0.42, 1800.00, '2024-12-01', 0.38, 'OPEN', 'ETF inflows strong. Halving cycle patterns suggest we''re early.'),
  ('11111111-1111-1111-1111-111111111111', 'Trump wins Iowa caucus', 'https://polymarket.com/event/iowa-caucus', 'politics', 'YES', 0.35, 3200.00, '2024-01-10', NULL, 'WON', 'Polling showed consistent lead. Ground game reports confirmed enthusiasm gap.'),
  ('11111111-1111-1111-1111-111111111111', 'Biden approval above 42% by Feb', 'https://polymarket.com/event/biden-approval', 'politics', 'NO', 0.55, 1500.00, '2024-01-20', NULL, 'WON', 'Economic sentiment lagging. No major catalyst in sight.');

-- Insert sample bets for data_dan
INSERT INTO bets (master_id, market_question, market_url, market_category, side, entry_odds, entry_amount, entry_date, current_odds, status, reasoning) VALUES
  ('22222222-2222-2222-2222-222222222222', 'SpaceX Starship orbital success Q1 2025', 'https://polymarket.com/event/starship', 'science', 'YES', 0.45, 2000.00, '2024-12-10', 0.52, 'OPEN', 'Recent test success rate improving. FAA approval likely.'),
  ('22222222-2222-2222-2222-222222222222', 'US GDP growth above 2% Q4 2024', 'https://polymarket.com/event/gdp-q4', 'politics', 'YES', 0.68, 1200.00, '2024-10-01', NULL, 'WON', 'Consumer spending resilient. Jobs data solid.');

-- Insert sample bets for contrarian_kate
INSERT INTO bets (master_id, market_question, market_url, market_category, side, entry_odds, entry_amount, entry_date, current_odds, status, reasoning) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Ukraine ceasefire by end of 2025', 'https://polymarket.com/event/ukraine-ceasefire', 'politics', 'NO', 0.31, 2800.00, '2024-12-05', 0.28, 'OPEN', 'Everyone wants it, no one can deliver it. Incentives don''t align.'),
  ('33333333-3333-3333-3333-333333333333', 'Taylor Swift endorses candidate 2024', 'https://polymarket.com/event/swift-endorsement', 'culture', 'YES', 0.25, 1000.00, '2024-08-01', NULL, 'WON', 'Pattern recognition from 2020. She''s more political now.');

-- Insert sample bets for crypto_chris
INSERT INTO bets (master_id, market_question, market_url, market_category, side, entry_odds, entry_amount, entry_date, current_odds, status, reasoning) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Ethereum ETF approved Q1 2025', 'https://polymarket.com/event/eth-etf', 'crypto', 'YES', 0.55, 5000.00, '2024-11-20', 0.71, 'OPEN', 'SEC signals shifting. Gensler out, new regime more favorable.'),
  ('44444444-4444-4444-4444-444444444444', 'Solana flips Ethereum market cap', 'https://polymarket.com/event/sol-flip', 'crypto', 'NO', 0.12, 800.00, '2024-12-15', 0.08, 'OPEN', 'Network effects too strong. SOL good but not that good.');
```

**Step 2: Run seed in Supabase**

In Supabase Dashboard > SQL Editor:
1. Paste the seed SQL
2. Run it

**Step 3: Verify data exists**

In Supabase Dashboard > Table Editor:
- masters table should have 10 rows
- master_stats table should have 10 rows
- bets table should have 10 rows

**Step 4: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat: add seed data with 10 masters and sample bets"
```

---

## Task 4: Create Supabase Client with Types

**Files:**
- Modify: `src/lib/supabase.ts`

**Step 1: Update Supabase client with better typing**

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client for use in Server Components
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add server-side Supabase client helper"
```

---

## Task 5: Create Data Fetching Functions

**Files:**
- Create: `src/lib/queries.ts`

**Step 1: Create queries file**

```typescript
// src/lib/queries.ts
import { supabase } from "./supabase";
import type { MasterWithStats, Bet, SortOption } from "./types";

export async function getMasters(options?: {
  sort?: SortOption;
  category?: string;
  limit?: number;
}): Promise<MasterWithStats[]> {
  const { sort = "rank", category, limit = 50 } = options || {};

  let query = supabase
    .from("masters")
    .select(`
      *,
      master_stats (*)
    `)
    .limit(limit);

  // Filter by category if provided
  if (category && category !== "all") {
    query = query.contains("primary_markets", [category]);
  }

  // Apply sorting based on master_stats
  const sortColumn = `master_stats.${sort}`;
  const ascending = sort === "rank";
  query = query.order(sort, {
    ascending,
    referencedTable: "master_stats"
  });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching masters:", error);
    return [];
  }

  return data as MasterWithStats[];
}

export async function getMasterByUsername(username: string): Promise<MasterWithStats | null> {
  const { data, error } = await supabase
    .from("masters")
    .select(`
      *,
      master_stats (*)
    `)
    .eq("username", username)
    .single();

  if (error) {
    console.error("Error fetching master:", error);
    return null;
  }

  return data as MasterWithStats;
}

export async function getMasterBets(masterId: string, options?: {
  status?: "OPEN" | "WON" | "LOST";
  limit?: number;
}): Promise<Bet[]> {
  const { status, limit = 20 } = options || {};

  let query = supabase
    .from("bets")
    .select("*")
    .eq("master_id", masterId)
    .order("entry_date", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching bets:", error);
    return [];
  }

  return data as Bet[];
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat: add data fetching functions for masters and bets"
```

---

## Task 6: Create Base UI Components

**Files:**
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Stat.tsx`

**Step 1: Create Card component**

```tsx
// src/components/ui/Card.tsx

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <div
      className={`rounded-lg p-4 transition-all duration-200 ${hover ? "card-glow" : ""} ${className}`}
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-secondary)",
      }}
    >
      {children}
    </div>
  );
}
```

**Step 2: Create Badge component**

```tsx
// src/components/ui/Badge.tsx

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "accent";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const colors = {
    default: "var(--color-muted)",
    success: "var(--color-success)",
    danger: "var(--color-danger)",
    accent: "var(--color-accent)",
  };

  return (
    <span
      className="px-2 py-1 rounded text-xs font-medium"
      style={{
        backgroundColor: `${colors[variant]}20`,
        color: colors[variant],
        border: `1px solid ${colors[variant]}40`,
      }}
    >
      {children}
    </span>
  );
}
```

**Step 3: Create Stat component**

```tsx
// src/components/ui/Stat.tsx

interface StatProps {
  label: string;
  value: string | number;
  suffix?: string;
  variant?: "default" | "success" | "danger";
}

export function Stat({ label, value, suffix, variant = "default" }: StatProps) {
  const colors = {
    default: "var(--color-text)",
    success: "var(--color-success)",
    danger: "var(--color-danger)",
  };

  return (
    <div className="flex flex-col">
      <span className="text-xs" style={{ color: "var(--color-muted)" }}>
        {label}
      </span>
      <span className="text-lg font-semibold" style={{ color: colors[variant] }}>
        {value}
        {suffix && <span className="text-sm ml-1">{suffix}</span>}
      </span>
    </div>
  );
}
```

**Step 4: Create index export**

```tsx
// src/components/ui/index.ts
export { Card } from "./Card";
export { Badge } from "./Badge";
export { Stat } from "./Stat";
```

**Step 5: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add base UI components (Card, Badge, Stat)"
```

---

## Task 7: Create MasterCard Component

**Files:**
- Create: `src/components/masters/MasterCard.tsx`

**Step 1: Create MasterCard component**

```tsx
// src/components/masters/MasterCard.tsx
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Stat";
import type { MasterWithStats } from "@/lib/types";

interface MasterCardProps {
  master: MasterWithStats;
}

export function MasterCard({ master }: MasterCardProps) {
  const stats = master.master_stats;

  const streakDisplay = stats?.current_streak
    ? stats.current_streak > 0
      ? `${stats.current_streak}W`
      : `${Math.abs(stats.current_streak)}L`
    : "—";

  const streakVariant = stats?.current_streak && stats.current_streak > 0
    ? "success"
    : stats?.current_streak && stats.current_streak < 0
      ? "danger"
      : "default";

  return (
    <Link href={`/masters/${master.username}`}>
      <Card className="cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{
                backgroundColor: "var(--color-secondary)",
                fontFamily: "var(--font-pixel)",
                color: "var(--color-accent)"
              }}
            >
              {stats?.rank || "—"}
            </div>
            <div>
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {master.display_name}
              </h3>
              <p
                className="text-xs"
                style={{ color: "var(--color-muted)" }}
              >
                @{master.username}
              </p>
            </div>
          </div>

          {stats?.current_streak && Math.abs(stats.current_streak) >= 3 && (
            <span className="text-lg" title={`${Math.abs(stats.current_streak)} streak`}>
              {"🔥".repeat(Math.min(Math.abs(stats.current_streak), 5))}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {master.primary_markets.map((market) => (
            <Badge key={market}>{market}</Badge>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Stat
            label="Win Rate"
            value={stats?.win_rate ? `${stats.win_rate.toFixed(1)}%` : "—"}
          />
          <Stat
            label="Return"
            value={stats?.total_return ? `+${stats.total_return.toFixed(0)}%` : "—"}
            variant={stats?.total_return && stats.total_return > 0 ? "success" : "default"}
          />
          <Stat
            label="Bets"
            value={stats?.total_bets || 0}
          />
          <Stat
            label="Streak"
            value={streakDisplay}
            variant={streakVariant}
          />
        </div>
      </Card>
    </Link>
  );
}
```

**Step 2: Create index export**

```tsx
// src/components/masters/index.ts
export { MasterCard } from "./MasterCard";
```

**Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/masters/
git commit -m "feat: add MasterCard component for leaderboard"
```

---

## Task 8: Create Leaderboard Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Replace landing page with leaderboard**

```tsx
// src/app/page.tsx
import { getMasters } from "@/lib/queries";
import { MasterCard } from "@/components/masters";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function LeaderboardPage() {
  const masters = await getMasters({ sort: "rank", limit: 20 });

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-xl md:text-3xl mb-2"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
          >
            THE MASTERS
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            Top predictors ranked by performance. Learn from the best.
          </p>
        </div>

        {/* Masters List */}
        <div className="space-y-4">
          {masters.length === 0 ? (
            <p style={{ color: "var(--color-muted)" }} className="text-center py-8">
              No masters found. Check your Supabase connection.
            </p>
          ) : (
            masters.map((master) => (
              <MasterCard key={master.id} master={master} />
            ))
          )}
        </div>

        {/* Footer tagline */}
        <p
          className="text-center text-xs mt-12"
          style={{ color: "var(--color-muted)" }}
        >
          &quot;Track records don&apos;t lie. Gurus do.&quot;
        </p>
      </div>
    </main>
  );
}
```

**Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Test locally**

Run: `npm run dev`
Visit: http://localhost:3000
Expected: See list of 10 masters with stats (assuming Supabase is configured)

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add leaderboard page showing top masters"
```

---

## Task 9: Create BetCard Component

**Files:**
- Create: `src/components/bets/BetCard.tsx`

**Step 1: Create BetCard component**

```tsx
// src/components/bets/BetCard.tsx
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Bet } from "@/lib/types";

interface BetCardProps {
  bet: Bet;
}

export function BetCard({ bet }: BetCardProps) {
  const statusVariant = bet.status === "WON"
    ? "success"
    : bet.status === "LOST"
      ? "danger"
      : "accent";

  const pnlDisplay = bet.return_pct
    ? bet.return_pct > 0
      ? `+${bet.return_pct.toFixed(0)}%`
      : `${bet.return_pct.toFixed(0)}%`
    : null;

  const currentOddsChange = bet.current_odds && bet.entry_odds
    ? ((bet.current_odds - bet.entry_odds) * 100).toFixed(0)
    : null;

  return (
    <Card hover={false}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--color-text)" }}
          >
            {bet.market_question}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={bet.side === "YES" ? "success" : "danger"}>
              {bet.side}
            </Badge>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              @ {(bet.entry_odds * 100).toFixed(0)}¢
            </span>
            {bet.current_odds && bet.status === "OPEN" && (
              <span
                className="text-xs"
                style={{
                  color: currentOddsChange && parseInt(currentOddsChange) > 0
                    ? "var(--color-success)"
                    : currentOddsChange && parseInt(currentOddsChange) < 0
                      ? "var(--color-danger)"
                      : "var(--color-muted)"
                }}
              >
                → {(bet.current_odds * 100).toFixed(0)}¢
              </span>
            )}
          </div>
        </div>
        <Badge variant={statusVariant}>
          {bet.status}
          {pnlDisplay && ` ${pnlDisplay}`}
        </Badge>
      </div>

      {bet.reasoning && (
        <div
          className="mt-3 p-3 rounded text-xs"
          style={{
            backgroundColor: "var(--color-bg)",
            color: "var(--color-muted)",
            borderLeft: "2px solid var(--color-accent)"
          }}
        >
          &quot;{bet.reasoning}&quot;
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
        <span>
          ${bet.entry_amount.toLocaleString()}
        </span>
        <span>
          {new Date(bet.entry_date).toLocaleDateString()}
        </span>
        <Badge>{bet.market_category}</Badge>
      </div>
    </Card>
  );
}
```

**Step 2: Create index export**

```tsx
// src/components/bets/index.ts
export { BetCard } from "./BetCard";
```

**Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/bets/
git commit -m "feat: add BetCard component for displaying bets"
```

---

## Task 10: Create Master Profile Page

**Files:**
- Create: `src/app/masters/[username]/page.tsx`

**Step 1: Create the dynamic route**

```tsx
// src/app/masters/[username]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMasterByUsername, getMasterBets } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Stat";
import { BetCard } from "@/components/bets";

interface PageProps {
  params: Promise<{ username: string }>;
}

export const revalidate = 60;

export default async function MasterProfilePage({ params }: PageProps) {
  const { username } = await params;
  const master = await getMasterByUsername(username);

  if (!master) {
    notFound();
  }

  const bets = await getMasterBets(master.id, { limit: 10 });
  const stats = master.master_stats;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-muted)" }}
        >
          ← Back to Masters
        </Link>

        {/* Profile Header */}
        <Card className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: "var(--color-secondary)",
                  fontFamily: "var(--font-pixel)",
                  color: "var(--color-accent)",
                }}
              >
                #{stats?.rank || "—"}
              </div>
              <div>
                <h1
                  className="text-lg md:text-xl"
                  style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
                >
                  {master.display_name}
                </h1>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  @{master.username}
                </p>
              </div>
            </div>

            {stats?.current_streak && Math.abs(stats.current_streak) >= 3 && (
              <span className="text-2xl">
                {"🔥".repeat(Math.min(Math.abs(stats.current_streak), 5))}
              </span>
            )}
          </div>

          {master.bio && (
            <p className="text-sm mb-4" style={{ color: "var(--color-text)" }}>
              {master.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {master.primary_markets.map((market) => (
              <Badge key={market}>{market}</Badge>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4" style={{ borderTop: "1px solid var(--color-secondary)" }}>
            <Stat label="Total Bets" value={stats?.total_bets || 0} />
            <Stat
              label="Win Rate"
              value={stats?.win_rate ? `${stats.win_rate.toFixed(1)}%` : "—"}
            />
            <Stat
              label="Total Return"
              value={stats?.total_return ? `+${stats.total_return.toFixed(0)}%` : "—"}
              variant={stats?.total_return && stats.total_return > 0 ? "success" : "default"}
            />
            <Stat
              label="Avg Return"
              value={stats?.avg_return ? `+${stats.avg_return.toFixed(1)}%` : "—"}
              variant={stats?.avg_return && stats.avg_return > 0 ? "success" : "default"}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Stat label="Wins" value={stats?.wins || 0} variant="success" />
            <Stat label="Losses" value={stats?.losses || 0} variant="danger" />
            <Stat
              label="Current Streak"
              value={stats?.current_streak ? (stats.current_streak > 0 ? `${stats.current_streak}W` : `${Math.abs(stats.current_streak)}L`) : "—"}
              variant={stats?.current_streak && stats.current_streak > 0 ? "success" : stats?.current_streak && stats.current_streak < 0 ? "danger" : "default"}
            />
            <Stat label="Best Streak" value={stats?.best_streak ? `${stats.best_streak}W` : "—"} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Stat label="Contrarian Score" value={`${stats?.contrarian_score || 50}/100`} />
            <Stat label="Open Positions" value={stats?.pending || 0} />
          </div>
        </Card>

        {/* Recent Bets */}
        <div className="mb-4">
          <h2
            className="text-sm mb-4"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
          >
            RECENT BETS
          </h2>

          {bets.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              No bets yet.
            </p>
          ) : (
            <div className="space-y-3">
              {bets.map((bet) => (
                <BetCard key={bet.id} bet={bet} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
```

**Step 2: Create not-found page**

```tsx
// src/app/masters/[username]/not-found.tsx
import Link from "next/link";

export default function MasterNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1
        className="text-xl mb-4"
        style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
      >
        MASTER NOT FOUND
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
        This predictor doesn&apos;t exist or has left the guild.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-text)",
        }}
      >
        Back to Masters
      </Link>
    </main>
  );
}
```

**Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Test locally**

Run: `npm run dev`
Visit: http://localhost:3000/masters/maria_macro
Expected: See Maria Macro's profile with stats and bets

**Step 5: Commit**

```bash
git add src/app/masters/
git commit -m "feat: add master profile page with stats and bets"
```

---

## Task 11: Add Navigation Header

**Files:**
- Create: `src/components/layout/Header.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create Header component**

```tsx
// src/components/layout/Header.tsx
import Link from "next/link";

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 px-4 py-3"
      style={{
        backgroundColor: "var(--color-bg)",
        borderBottom: "1px solid var(--color-secondary)",
      }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span
            className="text-lg"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
          >
            ♠
          </span>
          <span
            className="text-sm hidden sm:inline"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-text)" }}
          >
            THE GUILD
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-muted)" }}
          >
            Masters
          </Link>
          <span
            className="text-sm cursor-not-allowed"
            style={{ color: "var(--color-secondary)" }}
            title="Coming soon"
          >
            Feed
          </span>
          <span
            className="text-sm cursor-not-allowed"
            style={{ color: "var(--color-secondary)" }}
            title="Coming soon"
          >
            Portfolio
          </span>
        </nav>
      </div>
    </header>
  );
}
```

**Step 2: Create index export**

```tsx
// src/components/layout/index.ts
export { Header } from "./Header";
```

**Step 3: Update root layout**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Header } from "@/components/layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Guild",
  description: "Apprentice under winning bettors. Learn how they think. Build your edge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
```

**Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Test locally**

Run: `npm run dev`
Expected: See navigation header on all pages

**Step 6: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx
git commit -m "feat: add navigation header"
```

---

## Task 12: Add Leaderboard Filters

**Files:**
- Create: `src/components/masters/LeaderboardFilters.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create filters component (client component)**

```tsx
// src/components/masters/LeaderboardFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SortOption, MarketCategory } from "@/lib/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rank", label: "Rank" },
  { value: "win_rate", label: "Win Rate" },
  { value: "total_return", label: "Total Return" },
  { value: "current_streak", label: "Hot Streak" },
];

const CATEGORY_OPTIONS: { value: MarketCategory | "all"; label: string }[] = [
  { value: "all", label: "All Markets" },
  { value: "politics", label: "Politics" },
  { value: "crypto", label: "Crypto" },
  { value: "sports", label: "Sports" },
  { value: "science", label: "Science" },
  { value: "culture", label: "Culture" },
];

export function LeaderboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sort") as SortOption) || "rank";
  const currentCategory = searchParams.get("category") || "all";

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "rank" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/?${params.toString()}`);
  };

  const selectStyle = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-secondary)",
    color: "var(--color-text)",
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        value={currentSort}
        onChange={(e) => updateParams("sort", e.target.value)}
        className="px-3 py-2 rounded text-sm cursor-pointer"
        style={selectStyle}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </select>

      <select
        value={currentCategory}
        onChange={(e) => updateParams("category", e.target.value)}
        className="px-3 py-2 rounded text-sm cursor-pointer"
        style={selectStyle}
      >
        {CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

**Step 2: Update MasterCard export**

```tsx
// src/components/masters/index.ts
export { MasterCard } from "./MasterCard";
export { LeaderboardFilters } from "./LeaderboardFilters";
```

**Step 3: Update leaderboard page with filters**

```tsx
// src/app/page.tsx
import { Suspense } from "react";
import { getMasters } from "@/lib/queries";
import { MasterCard, LeaderboardFilters } from "@/components/masters";
import type { SortOption } from "@/lib/types";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ sort?: string; category?: string }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = (params.sort as SortOption) || "rank";
  const category = params.category || "all";

  const masters = await getMasters({
    sort,
    category: category === "all" ? undefined : category,
    limit: 20
  });

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-xl md:text-3xl mb-2"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
          >
            THE MASTERS
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            Top predictors ranked by performance. Learn from the best.
          </p>
        </div>

        {/* Filters */}
        <Suspense fallback={null}>
          <LeaderboardFilters />
        </Suspense>

        {/* Masters List */}
        <div className="space-y-4">
          {masters.length === 0 ? (
            <p style={{ color: "var(--color-muted)" }} className="text-center py-8">
              No masters found. Try different filters.
            </p>
          ) : (
            masters.map((master) => (
              <MasterCard key={master.id} master={master} />
            ))
          )}
        </div>

        {/* Footer tagline */}
        <p
          className="text-center text-xs mt-12"
          style={{ color: "var(--color-muted)" }}
        >
          &quot;Track records don&apos;t lie. Gurus do.&quot;
        </p>
      </div>
    </main>
  );
}
```

**Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Test locally**

Run: `npm run dev`
Expected: Filters work, URL updates, list re-renders

**Step 6: Commit**

```bash
git add src/components/masters/ src/app/page.tsx
git commit -m "feat: add leaderboard sorting and category filters"
```

---

## Task 13: Final Build and Push

**Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Run locally and test all pages**

Run: `npm run dev`

Test:
- http://localhost:3000 - Leaderboard with filters
- http://localhost:3000?sort=win_rate - Sorted by win rate
- http://localhost:3000?category=politics - Filtered by politics
- http://localhost:3000/masters/maria_macro - Profile page
- http://localhost:3000/masters/nonexistent - 404 page

**Step 3: Push to GitHub**

```bash
git push origin main
```

---

## Summary

Phase 2 complete. You now have:

1. **Database schema** in Supabase with masters, stats, and bets tables
2. **Seed data** with 10 masters and sample bets
3. **Leaderboard page** at `/` with sorting and category filters
4. **Master profile page** at `/masters/[username]` with stats and bets
5. **Navigation header** across all pages
6. **Reusable components**: Card, Badge, Stat, MasterCard, BetCard

Next: Phase 3 (User Portfolio) - Auth, follows, virtual bankroll
