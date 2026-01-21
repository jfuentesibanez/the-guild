# Phase 4: Copy Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add apprenticeship system where users can copy master bets, track positions with P&L, and see bet resolutions update their portfolio.

**Architecture:** Apprenticeships stored in `apprenticeships` table with sizing preferences. User positions stored in `positions` table linked to master bets. When users copy a bet, position is created and bankroll deducted. When bet resolves, positions update and bankroll adjusts.

**Tech Stack:** Next.js 16 App Router, Supabase, Server Actions, TypeScript

---

## Prerequisites

Supabase Dashboard:
- Phase 3 tables (`users`, `follows`) must exist
- User must be able to sign up and log in

---

## Task 1: Add Position and Apprenticeship Types

**Files:**
- Modify: `src/lib/types.ts`

**Step 1: Add new types at the end of the file**

```typescript
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
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add apprenticeship and position types"
```

---

## Task 2: Create Apprenticeships and Positions Database Tables

**Files:**
- Create: `supabase/migrations/003_apprenticeships_positions.sql`

**Step 1: Create the migration file**

```sql
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
```

**Step 2: Run migration in Supabase**

In Supabase Dashboard > SQL Editor:
1. Paste the SQL
2. Run it

**Step 3: Verify tables exist**

In Table Editor, confirm:
- `apprenticeships` table exists
- `positions` table exists

**Step 4: Commit**

```bash
git add supabase/migrations/003_apprenticeships_positions.sql
git commit -m "feat: add apprenticeships and positions database tables"
```

---

## Task 3: Create Apprenticeship and Position Queries

**Files:**
- Modify: `src/lib/queries.ts`

**Step 1: Add imports and new query functions**

Add these imports at the top:
```typescript
import type { Apprenticeship, ApprenticeshipWithMaster, Position, PositionWithMaster } from "./types";
```

Add these functions at the end of the file:

```typescript
// Apprenticeship queries
export async function getUserApprenticeships(userId: string): Promise<ApprenticeshipWithMaster[]> {
  const { data, error } = await supabase
    .from("apprenticeships")
    .select(`
      *,
      master:masters (*)
    `)
    .eq("user_id", userId)
    .eq("active", true);

  if (error) {
    console.error("Error fetching apprenticeships:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((a: any) => ({ ...a, master: a.master })) as ApprenticeshipWithMaster[];
}

export async function getApprenticeship(userId: string, masterId: string): Promise<Apprenticeship | null> {
  const { data, error } = await supabase
    .from("apprenticeships")
    .select("*")
    .eq("user_id", userId)
    .eq("master_id", masterId)
    .single();

  if (error) {
    return null;
  }

  return data as Apprenticeship;
}

// Position queries
export async function getUserPositions(userId: string, options?: {
  status?: 'OPEN' | 'WON' | 'LOST';
  limit?: number;
}): Promise<PositionWithMaster[]> {
  const { status, limit = 50 } = options || {};

  let query = supabase
    .from("positions")
    .select(`
      *,
      master:masters (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching positions:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((p: any) => ({ ...p, master: p.master })) as PositionWithMaster[];
}

export async function getUserStats(userId: string): Promise<{
  totalPositions: number;
  openPositions: number;
  wins: number;
  losses: number;
  totalReturn: number;
}> {
  const { data, error } = await supabase
    .from("positions")
    .select("status, return_amount")
    .eq("user_id", userId);

  if (error || !data) {
    return { totalPositions: 0, openPositions: 0, wins: 0, losses: 0, totalReturn: 0 };
  }

  const stats = data.reduce((acc, pos) => {
    acc.totalPositions++;
    if (pos.status === 'OPEN') acc.openPositions++;
    if (pos.status === 'WON') acc.wins++;
    if (pos.status === 'LOST') acc.losses++;
    if (pos.return_amount) acc.totalReturn += Number(pos.return_amount);
    return acc;
  }, { totalPositions: 0, openPositions: 0, wins: 0, losses: 0, totalReturn: 0 });

  return stats;
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat: add apprenticeship and position query functions"
```

---

## Task 4: Create Apprenticeship Actions

**Files:**
- Create: `src/app/actions/apprenticeship.ts`

**Step 1: Create apprenticeship actions**

```typescript
// src/app/actions/apprenticeship.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import type { SizingMode } from "@/lib/types";

export async function createApprenticeship(
  masterId: string,
  options: {
    sizingMode: SizingMode;
    fixedAmount?: number;
    autoCopy: boolean;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("apprenticeships").insert({
    user_id: user.id,
    master_id: masterId,
    sizing_mode: options.sizingMode,
    fixed_amount: options.fixedAmount || 100,
    auto_copy: options.autoCopy,
    active: true,
  });

  if (error) {
    if (error.code === '23505') {
      return { error: "You already have an apprenticeship with this master" };
    }
    return { error: error.message };
  }

  revalidatePath("/portfolio");
  return { success: true };
}

export async function updateApprenticeship(
  masterId: string,
  options: {
    sizingMode?: SizingMode;
    fixedAmount?: number;
    autoCopy?: boolean;
    active?: boolean;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updateData: Record<string, unknown> = {};
  if (options.sizingMode !== undefined) updateData.sizing_mode = options.sizingMode;
  if (options.fixedAmount !== undefined) updateData.fixed_amount = options.fixedAmount;
  if (options.autoCopy !== undefined) updateData.auto_copy = options.autoCopy;
  if (options.active !== undefined) updateData.active = options.active;

  const { error } = await supabase
    .from("apprenticeships")
    .update(updateData)
    .eq("user_id", user.id)
    .eq("master_id", masterId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/portfolio");
  return { success: true };
}

export async function endApprenticeship(masterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("apprenticeships")
    .delete()
    .eq("user_id", user.id)
    .eq("master_id", masterId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/portfolio");
  return { success: true };
}
```

**Step 2: Commit**

```bash
git add src/app/actions/apprenticeship.ts
git commit -m "feat: add apprenticeship server actions"
```

---

## Task 5: Create Copy Bet Action

**Files:**
- Create: `src/app/actions/position.ts`

**Step 1: Create position actions**

```typescript
// src/app/actions/position.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import type { Bet } from "@/lib/types";

export async function copyBet(bet: Bet, amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's current bankroll
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("virtual_bankroll")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "Could not fetch user profile" };
  }

  if (profile.virtual_bankroll < amount) {
    return { error: "Insufficient bankroll" };
  }

  // Create position
  const { error: positionError } = await supabase.from("positions").insert({
    user_id: user.id,
    bet_id: bet.id,
    master_id: bet.master_id,
    market_question: bet.market_question,
    side: bet.side,
    entry_odds: bet.entry_odds,
    entry_amount: amount,
    current_odds: bet.current_odds || bet.entry_odds,
    status: 'OPEN',
    source: 'COPY',
  });

  if (positionError) {
    return { error: positionError.message };
  }

  // Deduct from bankroll
  const { error: bankrollError } = await supabase
    .from("users")
    .update({ virtual_bankroll: profile.virtual_bankroll - amount })
    .eq("id", user.id);

  if (bankrollError) {
    return { error: "Failed to update bankroll" };
  }

  // Award XP for copying bet
  const { data: currentProfile } = await supabase
    .from("users")
    .select("xp")
    .eq("id", user.id)
    .single();

  if (currentProfile) {
    await supabase
      .from("users")
      .update({ xp: currentProfile.xp + 10 })
      .eq("id", user.id);
  }

  revalidatePath("/portfolio");
  return { success: true };
}

export async function closePosition(positionId: string, won: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get the position
  const { data: position, error: posError } = await supabase
    .from("positions")
    .select("*")
    .eq("id", positionId)
    .eq("user_id", user.id)
    .single();

  if (posError || !position) {
    return { error: "Position not found" };
  }

  if (position.status !== 'OPEN') {
    return { error: "Position already closed" };
  }

  // Calculate return
  let returnAmount = 0;
  if (won) {
    // Win: return entry_amount + profit based on odds
    // If you bet YES at 0.30 and win, you get 1/0.30 = 3.33x return
    const multiplier = 1 / position.entry_odds;
    returnAmount = position.entry_amount * multiplier;
  }
  // If lost, returnAmount stays 0

  // Update position
  const { error: updateError } = await supabase
    .from("positions")
    .update({
      status: won ? 'WON' : 'LOST',
      return_amount: returnAmount,
    })
    .eq("id", positionId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Update bankroll
  const { data: profile } = await supabase
    .from("users")
    .select("virtual_bankroll, xp")
    .eq("id", user.id)
    .single();

  if (profile) {
    const newBankroll = profile.virtual_bankroll + returnAmount;
    const xpGain = won ? 25 : 5;
    await supabase
      .from("users")
      .update({
        virtual_bankroll: newBankroll,
        xp: profile.xp + xpGain
      })
      .eq("id", user.id);
  }

  revalidatePath("/portfolio");
  return { success: true, returnAmount };
}
```

**Step 2: Commit**

```bash
git add src/app/actions/position.ts
git commit -m "feat: add copy bet and close position actions"
```

---

## Task 6: Create Copy Bet Modal Component

**Files:**
- Create: `src/components/bets/CopyBetModal.tsx`

**Step 1: Create the modal component**

```tsx
// src/components/bets/CopyBetModal.tsx
"use client";

import { useState, useTransition } from "react";
import { copyBet } from "@/app/actions/position";
import { Card } from "@/components/ui/Card";
import type { Bet } from "@/lib/types";

interface CopyBetModalProps {
  bet: Bet;
  userBankroll: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function CopyBetModal({ bet, userBankroll, onClose, onSuccess }: CopyBetModalProps) {
  const [amount, setAmount] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCopy = () => {
    if (amount > userBankroll) {
      setError("Insufficient bankroll");
      return;
    }
    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    startTransition(async () => {
      const result = await copyBet(bet, amount);
      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    });
  };

  const inputStyle = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-secondary)",
    color: "var(--color-text)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
    >
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
          >
            COPY BET
          </h2>
          <button
            onClick={onClose}
            className="text-lg hover:opacity-80"
            style={{ color: "var(--color-muted)" }}
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 rounded" style={{ backgroundColor: "var(--color-bg)" }}>
          <p className="text-sm mb-2" style={{ color: "var(--color-text)" }}>
            {bet.market_question}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span
              className="px-2 py-1 rounded"
              style={{
                backgroundColor: bet.side === 'YES' ? 'var(--color-success)' : 'var(--color-danger)',
                color: 'var(--color-bg)',
              }}
            >
              {bet.side}
            </span>
            <span style={{ color: "var(--color-muted)" }}>
              @ {(bet.current_odds || bet.entry_odds).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label
            className="block text-xs mb-2"
            style={{ color: "var(--color-muted)" }}
          >
            Amount to bet
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 px-3 py-2 rounded text-sm"
              style={inputStyle}
              min={1}
              max={userBankroll}
            />
            <button
              onClick={() => setAmount(Math.floor(userBankroll * 0.1))}
              className="px-3 py-2 rounded text-xs"
              style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-text)" }}
            >
              10%
            </button>
            <button
              onClick={() => setAmount(Math.floor(userBankroll * 0.25))}
              className="px-3 py-2 rounded text-xs"
              style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-text)" }}
            >
              25%
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--color-muted)" }}>
            Available: ${userBankroll.toLocaleString()}
          </p>
        </div>

        <div className="mb-4 p-3 rounded" style={{ backgroundColor: "var(--color-bg)" }}>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: "var(--color-muted)" }}>Potential return if {bet.side}:</span>
            <span style={{ color: "var(--color-success)" }}>
              ${(amount / (bet.current_odds || bet.entry_odds)).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--color-muted)" }}>Potential profit:</span>
            <span style={{ color: "var(--color-success)" }}>
              +${((amount / (bet.current_odds || bet.entry_odds)) - amount).toFixed(2)}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-xs mb-4" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded text-sm"
            style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-text)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={isPending}
            className="flex-1 py-2 rounded text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-text)" }}
          >
            {isPending ? "Copying..." : "Copy Bet"}
          </button>
        </div>
      </Card>
    </div>
  );
}
```

**Step 2: Update bets index export**

```typescript
// src/components/bets/index.ts
export { BetCard } from "./BetCard";
export { CopyBetModal } from "./CopyBetModal";
```

**Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/bets/CopyBetModal.tsx src/components/bets/index.ts
git commit -m "feat: add copy bet modal component"
```

---

## Task 7: Create Copy Button in BetCard

**Files:**
- Modify: `src/components/bets/BetCard.tsx`

**Step 1: Read current BetCard**

First read the current file to understand its structure.

**Step 2: Add copy button**

Add a "Copy" button to BetCard that opens the modal. The BetCard needs to accept `onCopy` callback and `canCopy` boolean props.

Update the component to include a copy button when the bet is OPEN and user is authenticated.

**Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/bets/BetCard.tsx
git commit -m "feat: add copy button to bet card"
```

---

## Task 8: Create Position Card Component

**Files:**
- Create: `src/components/portfolio/PositionCard.tsx`
- Create: `src/components/portfolio/index.ts`

**Step 1: Create position card**

```tsx
// src/components/portfolio/PositionCard.tsx
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { PositionWithMaster } from "@/lib/types";

interface PositionCardProps {
  position: PositionWithMaster;
}

export function PositionCard({ position }: PositionCardProps) {
  const isWon = position.status === 'WON';
  const isLost = position.status === 'LOST';
  const isOpen = position.status === 'OPEN';

  // Calculate unrealized P&L for open positions
  const currentValue = isOpen && position.current_odds
    ? position.entry_amount / position.current_odds
    : null;
  const unrealizedPnL = currentValue
    ? currentValue - position.entry_amount
    : null;

  // Calculate realized P&L for closed positions
  const realizedPnL = !isOpen && position.return_amount !== null
    ? position.return_amount - position.entry_amount
    : null;

  const pnl = isOpen ? unrealizedPnL : realizedPnL;
  const pnlColor = pnl && pnl > 0
    ? "var(--color-success)"
    : pnl && pnl < 0
      ? "var(--color-danger)"
      : "var(--color-muted)";

  return (
    <Card hover={false}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm mb-2 truncate" style={{ color: "var(--color-text)" }}>
            {position.market_question}
          </p>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span
              className="px-2 py-1 rounded"
              style={{
                backgroundColor: position.side === 'YES' ? 'var(--color-success)' : 'var(--color-danger)',
                color: 'var(--color-bg)',
              }}
            >
              {position.side}
            </span>
            <span style={{ color: "var(--color-muted)" }}>
              @ {position.entry_odds.toFixed(2)}
            </span>
            {isOpen && position.current_odds && (
              <>
                <span style={{ color: "var(--color-muted)" }}>→</span>
                <span style={{ color: "var(--color-accent)" }}>
                  {position.current_odds.toFixed(2)}
                </span>
              </>
            )}
            <span style={{ color: "var(--color-muted)" }}>
              ${position.entry_amount.toFixed(0)}
            </span>
          </div>

          {position.master && (
            <Link
              href={`/masters/${position.master.username}`}
              className="text-xs mt-2 inline-block hover:opacity-80"
              style={{ color: "var(--color-muted)" }}
            >
              via @{position.master.username}
            </Link>
          )}
        </div>

        <div className="text-right">
          <span
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: isWon
                ? "var(--color-success)"
                : isLost
                  ? "var(--color-danger)"
                  : "var(--color-secondary)",
              color: isOpen ? "var(--color-text)" : "var(--color-bg)",
            }}
          >
            {position.status}
          </span>

          {pnl !== null && (
            <p
              className="text-sm font-bold mt-2"
              style={{ color: pnlColor }}
            >
              {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
```

**Step 2: Create index file**

```typescript
// src/components/portfolio/index.ts
export { PositionCard } from "./PositionCard";
```

**Step 3: Commit**

```bash
mkdir -p src/components/portfolio
git add src/components/portfolio/
git commit -m "feat: add position card component"
```

---

## Task 9: Update Portfolio Page with Positions

**Files:**
- Modify: `src/app/portfolio/page.tsx`

**Step 1: Update portfolio page**

Update the portfolio page to show:
1. Open positions section
2. Closed positions section (recent)
3. User stats (wins, losses, total return)

Import the new components and queries:
```tsx
import { getUserPositions, getUserStats } from "@/lib/queries";
import { PositionCard } from "@/components/portfolio";
```

Fetch positions and stats alongside existing data:
```tsx
const [profile, followedMasters, openPositions, closedPositions, stats] = await Promise.all([
  getUserProfile(),
  getFollowedMasters(user.id),
  getUserPositions(user.id, { status: 'OPEN' }),
  getUserPositions(user.id, { limit: 10 }),
  getUserStats(user.id),
]);
```

Add sections to display open positions and performance stats.

**Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/portfolio/page.tsx
git commit -m "feat: update portfolio page with positions and stats"
```

---

## Task 10: Add Copy Button to Master Profile Bets

**Files:**
- Modify: `src/app/masters/[username]/page.tsx`

**Step 1: Update master profile page**

Add state management for the copy modal and integrate CopyBetModal.

This requires making the bets section a client component or creating a wrapper component for the bet list with copy functionality.

Create a new component `src/components/bets/BetListWithCopy.tsx` that handles:
- Displaying bet cards
- Opening/closing the copy modal
- Passing user bankroll

**Step 2: Create BetListWithCopy component**

```tsx
// src/components/bets/BetListWithCopy.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BetCard } from "./BetCard";
import { CopyBetModal } from "./CopyBetModal";
import type { Bet } from "@/lib/types";

interface BetListWithCopyProps {
  bets: Bet[];
  userBankroll: number | null;
  isAuthenticated: boolean;
}

export function BetListWithCopy({ bets, userBankroll, isAuthenticated }: BetListWithCopyProps) {
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const router = useRouter();

  const handleCopyClick = (bet: Bet) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setSelectedBet(bet);
  };

  const handleCopySuccess = () => {
    setSelectedBet(null);
    router.refresh();
  };

  return (
    <>
      <div className="space-y-3">
        {bets.map((bet) => (
          <BetCard
            key={bet.id}
            bet={bet}
            onCopy={bet.status === 'OPEN' ? () => handleCopyClick(bet) : undefined}
          />
        ))}
      </div>

      {selectedBet && userBankroll !== null && (
        <CopyBetModal
          bet={selectedBet}
          userBankroll={userBankroll}
          onClose={() => setSelectedBet(null)}
          onSuccess={handleCopySuccess}
        />
      )}
    </>
  );
}
```

**Step 3: Update bets index**

```typescript
// src/components/bets/index.ts
export { BetCard } from "./BetCard";
export { CopyBetModal } from "./CopyBetModal";
export { BetListWithCopy } from "./BetListWithCopy";
```

**Step 4: Update master profile to use BetListWithCopy**

Replace the direct BetCard mapping with BetListWithCopy component.

**Step 5: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/components/bets/ src/app/masters/[username]/page.tsx
git commit -m "feat: add copy bet functionality to master profile"
```

---

## Task 11: Create Basic Feed Page

**Files:**
- Create: `src/app/feed/page.tsx`
- Create: `src/components/feed/FeedItem.tsx`
- Create: `src/components/feed/index.ts`

**Step 1: Create FeedItem component**

```tsx
// src/components/feed/FeedItem.tsx
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Bet, Master } from "@/lib/types";

interface FeedItemProps {
  bet: Bet & { master: Master };
  timeAgo: string;
}

export function FeedItem({ bet, timeAgo }: FeedItemProps) {
  return (
    <Card hover={false}>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0"
          style={{
            backgroundColor: "var(--color-secondary)",
            fontFamily: "var(--font-pixel)",
            color: "var(--color-accent)",
          }}
        >
          {bet.master.display_name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/masters/${bet.master.username}`}
              className="text-sm font-medium hover:opacity-80"
              style={{ color: "var(--color-primary)" }}
            >
              @{bet.master.username}
            </Link>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {timeAgo}
            </span>
          </div>

          <p className="text-sm mb-2" style={{ color: "var(--color-text)" }}>
            bet{' '}
            <span
              className="px-1 rounded"
              style={{
                backgroundColor: bet.side === 'YES' ? 'var(--color-success)' : 'var(--color-danger)',
                color: 'var(--color-bg)',
              }}
            >
              {bet.side}
            </span>
            {' '}on
          </p>

          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            &quot;{bet.market_question}&quot;
          </p>

          <p className="text-xs mt-2" style={{ color: "var(--color-accent)" }}>
            @ {bet.entry_odds.toFixed(2)} • ${bet.entry_amount.toFixed(0)}
          </p>

          {bet.reasoning && (
            <p className="text-xs mt-2 italic" style={{ color: "var(--color-muted)" }}>
              &quot;{bet.reasoning}&quot;
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
```

**Step 2: Create feed index**

```typescript
// src/components/feed/index.ts
export { FeedItem } from "./FeedItem";
```

**Step 3: Create feed page**

```tsx
// src/app/feed/page.tsx
import { supabase } from "@/lib/supabase";
import { FeedItem } from "@/components/feed";
import type { Bet, Master } from "@/lib/types";

export const revalidate = 30;

async function getRecentBets(): Promise<(Bet & { master: Master })[]> {
  const { data, error } = await supabase
    .from("bets")
    .select(`
      *,
      master:masters (*)
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching feed:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((b: any) => ({ ...b, master: b.master })) as (Bet & { master: Master })[];
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function FeedPage() {
  const bets = await getRecentBets();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1
              className="text-xl md:text-3xl"
              style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
            >
              THE WIRE
            </h1>
            <span
              className="text-xs px-2 py-1 rounded animate-pulse"
              style={{ backgroundColor: "var(--color-danger)", color: "var(--color-text)" }}
            >
              LIVE
            </span>
          </div>
          <p
            className="text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            Real-time activity from the masters
          </p>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {bets.length === 0 ? (
            <p style={{ color: "var(--color-muted)" }} className="text-center py-8">
              No activity yet. Check back soon.
            </p>
          ) : (
            bets.map((bet) => (
              <FeedItem key={bet.id} bet={bet} timeAgo={getTimeAgo(bet.created_at)} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
```

**Step 4: Update Header to include Feed link**

Add Feed link to the header navigation.

**Step 5: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
mkdir -p src/components/feed
git add src/components/feed/ src/app/feed/page.tsx src/components/layout/Header.tsx
git commit -m "feat: add activity feed page"
```

---

## Task 12: Final Build and Push

**Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Test locally**

Run: `npm run dev`

Test these flows:
1. Visit a master profile - see "Copy" button on open bets
2. Click Copy - modal opens with amount input
3. Enter amount and copy - position created, bankroll deducted
4. Visit /portfolio - see open position
5. Visit /feed - see recent master activity

**Step 3: Push to GitHub**

```bash
git push origin main
```

---

## Summary

Phase 4 complete. You now have:

1. **Apprenticeship system** - Users can set up auto-copy relationships with sizing preferences
2. **Copy bet modal** - Users can manually copy individual bets with custom amounts
3. **Positions tracking** - User positions stored with P&L calculations
4. **Updated portfolio** - Shows open positions, closed positions, and performance stats
5. **Activity feed** - Real-time stream of master betting activity

**Database tables added:**
- `apprenticeships` - Copy relationships with settings
- `positions` - User's copied and own bets

**XP system:**
- Copy bet: +10 XP
- Win bet: +25 XP
- Lose bet: +5 XP

**Next: Phase 5 (Progression & Polish)** - Level system, journey page, UI animations
