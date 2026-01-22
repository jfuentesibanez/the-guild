# Phase 5: Progression & Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add level progression system with XP thresholds, journey page, and UI polish for a polished MVP experience.

**Architecture:** Level system uses XP thresholds defined in config, with level-up checks on XP gain. Journey page shows progress timeline and unlocks. UI polish includes animations, better mobile responsive, and progress bars.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, Supabase

---

## Task 1: Add Level Configuration Constants

**Files:**
- Create: `src/lib/levels.ts`

**Step 1: Create level configuration file**

```typescript
// src/lib/levels.ts

export interface LevelConfig {
  level: number;
  title: string;
  xpRequired: number;
  unlocks: string[];
}

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: "Initiate",
    xpRequired: 0,
    unlocks: ["View leaderboard", "Follow up to 3 masters"],
  },
  {
    level: 2,
    title: "Apprentice",
    xpRequired: 100,
    unlocks: ["Unlimited follows", "View full reasoning on bets"],
  },
  {
    level: 3,
    title: "Student",
    xpRequired: 500,
    unlocks: ["Auto-copy apprenticeships"],
  },
  {
    level: 4,
    title: "Journeyman",
    xpRequired: 1500,
    unlocks: ["Place own bets", "Appear on mini-leaderboard"],
  },
];

export const XP_AWARDS = {
  COPY_BET: 10,
  BET_WON: 25,
  BET_LOST: 5,
  FIRST_FOLLOW: 50,
  DAILY_LOGIN: 5,
} as const;

export function getLevelForXP(xp: number): LevelConfig {
  // Return highest level where xpRequired <= xp
  const level = [...LEVELS].reverse().find((l) => xp >= l.xpRequired);
  return level || LEVELS[0];
}

export function getNextLevel(currentLevel: number): LevelConfig | null {
  const idx = LEVELS.findIndex((l) => l.level === currentLevel);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getXPProgress(xp: number): {
  currentLevel: LevelConfig;
  nextLevel: LevelConfig | null;
  progressPercent: number;
  xpToNext: number;
} {
  const currentLevel = getLevelForXP(xp);
  const nextLevel = getNextLevel(currentLevel.level);

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      progressPercent: 100,
      xpToNext: 0,
    };
  }

  const xpInLevel = xp - currentLevel.xpRequired;
  const xpForLevel = nextLevel.xpRequired - currentLevel.xpRequired;
  const progressPercent = Math.floor((xpInLevel / xpForLevel) * 100);
  const xpToNext = nextLevel.xpRequired - xp;

  return {
    currentLevel,
    nextLevel,
    progressPercent,
    xpToNext,
  };
}
```

**Step 2: Verify no syntax errors**

Run: `cd /Users/javier/Documents/Desarrollo/theguild && npx tsc --noEmit src/lib/levels.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/levels.ts
git commit -m "feat: add level configuration and XP utilities"
```

---

## Task 2: Create ProgressBar UI Component

**Files:**
- Create: `src/components/ui/ProgressBar.tsx`
- Modify: `src/components/ui/index.ts`

**Step 1: Create ProgressBar component**

```typescript
// src/components/ui/ProgressBar.tsx
interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({ value, showLabel = false, size = "md" }: ProgressBarProps) {
  const height = size === "sm" ? "h-2" : "h-3";

  return (
    <div className="w-full">
      <div
        className={`w-full ${height} rounded-full overflow-hidden`}
        style={{ backgroundColor: "var(--color-secondary)" }}
      >
        <div
          className={`${height} rounded-full transition-all duration-500 ease-out`}
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            backgroundColor: "var(--color-accent)",
          }}
        />
      </div>
      {showLabel && (
        <p
          className="text-xs mt-1 text-right"
          style={{ color: "var(--color-muted)" }}
        >
          {value}%
        </p>
      )}
    </div>
  );
}
```

**Step 2: Create index.ts for ui components**

```typescript
// src/components/ui/index.ts
export { Card } from "./Card";
export { Badge } from "./Badge";
export { Stat } from "./Stat";
export { ProgressBar } from "./ProgressBar";
```

**Step 3: Verify no syntax errors**

Run: `cd /Users/javier/Documents/Desarrollo/theguild && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/ui/ProgressBar.tsx src/components/ui/index.ts
git commit -m "feat: add ProgressBar UI component"
```

---

## Task 3: Create LevelBadge Component

**Files:**
- Create: `src/components/journey/LevelBadge.tsx`
- Create: `src/components/journey/index.ts`

**Step 1: Create LevelBadge component**

```typescript
// src/components/journey/LevelBadge.tsx
import { getLevelForXP, getXPProgress } from "@/lib/levels";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface LevelBadgeProps {
  xp: number;
  showProgress?: boolean;
  size?: "sm" | "lg";
}

export function LevelBadge({ xp, showProgress = false, size = "sm" }: LevelBadgeProps) {
  const { currentLevel, nextLevel, progressPercent, xpToNext } = getXPProgress(xp);

  if (size === "lg") {
    return (
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-2"
          style={{
            backgroundColor: "var(--color-secondary)",
            border: "3px solid var(--color-accent)",
          }}
        >
          <span
            className="text-2xl"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
          >
            {currentLevel.level}
          </span>
        </div>
        <p
          className="text-sm mb-1"
          style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
        >
          {currentLevel.title}
        </p>
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          {xp} XP
        </p>
        {showProgress && nextLevel && (
          <div className="mt-3 max-w-32 mx-auto">
            <ProgressBar value={progressPercent} size="sm" />
            <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
              {xpToNext} XP to {nextLevel.title}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="px-2 py-1 rounded text-xs"
        style={{
          backgroundColor: "var(--color-secondary)",
          color: "var(--color-accent)",
          fontFamily: "var(--font-pixel)",
        }}
      >
        Lv.{currentLevel.level}
      </span>
      <span className="text-xs" style={{ color: "var(--color-muted)" }}>
        {currentLevel.title}
      </span>
    </div>
  );
}
```

**Step 2: Create index.ts**

```typescript
// src/components/journey/index.ts
export { LevelBadge } from "./LevelBadge";
```

**Step 3: Verify no syntax errors**

Run: `cd /Users/javier/Documents/Desarrollo/theguild && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/journey/
git commit -m "feat: add LevelBadge component"
```

---

## Task 4: Create Journey Page

**Files:**
- Create: `src/app/journey/page.tsx`

**Step 1: Create journey page**

```typescript
// src/app/journey/page.tsx
import { redirect } from "next/navigation";
import { getUser, getUserProfile } from "@/lib/supabase-server";
import { getUserStats } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LevelBadge } from "@/components/journey";
import { LEVELS, getXPProgress, XP_AWARDS } from "@/lib/levels";

export const revalidate = 60;

export default async function JourneyPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, stats] = await Promise.all([
    getUserProfile(),
    getUserStats(user.id),
  ]);

  const xp = profile?.xp || 0;
  const { currentLevel, nextLevel, progressPercent, xpToNext } = getXPProgress(xp);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-xl md:text-3xl mb-2"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
          >
            THE CLIMB
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            Your progression through The Guild
          </p>
        </div>

        {/* Current Level Card */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <LevelBadge xp={xp} size="lg" />

            <div className="flex-1 w-full">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: "var(--color-text)" }}>
                    Progress to {nextLevel?.title || "Max Level"}
                  </span>
                  <span className="text-sm" style={{ color: "var(--color-accent)" }}>
                    {xp} / {nextLevel?.xpRequired || xp} XP
                  </span>
                </div>
                <ProgressBar value={progressPercent} />
              </div>

              {nextLevel && (
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  {xpToNext} XP remaining to reach {nextLevel.title}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Summary */}
        <Card className="mb-8">
          <h2
            className="text-sm mb-4"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
          >
            YOUR STATS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                {stats.totalPositions}
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>Total Bets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--color-success)" }}>
                {stats.wins}
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>Wins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--color-danger)" }}>
                {stats.losses}
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>Losses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>
                {xp}
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>Total XP</p>
            </div>
          </div>
        </Card>

        {/* XP Guide */}
        <Card className="mb-8">
          <h2
            className="text-sm mb-4"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
          >
            EARN XP
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--color-text)" }}>Copy a bet</span>
              <span className="text-sm" style={{ color: "var(--color-accent)" }}>+{XP_AWARDS.COPY_BET} XP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--color-text)" }}>Win a bet</span>
              <span className="text-sm" style={{ color: "var(--color-success)" }}>+{XP_AWARDS.BET_WON} XP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--color-text)" }}>Lose a bet (participation)</span>
              <span className="text-sm" style={{ color: "var(--color-muted)" }}>+{XP_AWARDS.BET_LOST} XP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--color-text)" }}>First follow</span>
              <span className="text-sm" style={{ color: "var(--color-accent)" }}>+{XP_AWARDS.FIRST_FOLLOW} XP</span>
            </div>
          </div>
        </Card>

        {/* Level Roadmap */}
        <div>
          <h2
            className="text-sm mb-4"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
          >
            GUILD RANKS
          </h2>
          <div className="space-y-4">
            {LEVELS.map((level) => {
              const isCurrentLevel = currentLevel.level === level.level;
              const isUnlocked = xp >= level.xpRequired;

              return (
                <Card
                  key={level.level}
                  hover={false}
                  className={isCurrentLevel ? "ring-2 ring-[var(--color-accent)]" : ""}
                  style={{
                    opacity: isUnlocked ? 1 : 0.5,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isUnlocked ? "var(--color-accent)" : "var(--color-secondary)",
                        color: isUnlocked ? "var(--color-bg)" : "var(--color-muted)",
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-pixel)" }}>{level.level}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="text-sm"
                          style={{
                            fontFamily: "var(--font-pixel)",
                            color: isUnlocked ? "var(--color-primary)" : "var(--color-muted)",
                          }}
                        >
                          {level.title}
                        </h3>
                        {isCurrentLevel && (
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: "var(--color-accent)",
                              color: "var(--color-bg)",
                            }}
                          >
                            Current
                          </span>
                        )}
                      </div>

                      <p className="text-xs mb-2" style={{ color: "var(--color-muted)" }}>
                        {level.xpRequired} XP required
                      </p>

                      <ul className="space-y-1">
                        {level.unlocks.map((unlock) => (
                          <li
                            key={unlock}
                            className="text-xs flex items-center gap-2"
                            style={{ color: isUnlocked ? "var(--color-text)" : "var(--color-muted)" }}
                          >
                            <span style={{ color: isUnlocked ? "var(--color-success)" : "var(--color-muted)" }}>
                              {isUnlocked ? "✓" : "○"}
                            </span>
                            {unlock}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
```

**Step 2: Verify no syntax errors**

Run: `cd /Users/javier/Documents/Desarrollo/theguild && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/journey/page.tsx
git commit -m "feat: add journey page with level progression"
```

---

## Task 5: Add Journey Link to Header

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Step 1: Add Journey link to navigation**

In `src/components/layout/Header.tsx`, add Journey link after Portfolio link (line ~59):

```typescript
// After the Portfolio link, add:
              <Link
                href="/journey"
                className="text-sm hover:opacity-80 transition-opacity"
                style={{ color: "var(--color-muted)" }}
              >
                Journey
              </Link>
```

**Step 2: Verify no syntax errors**

Run: `cd /Users/javier/Documents/Desarrollo/theguild && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: add Journey link to header navigation"
```

---

## Task 6: Update Portfolio to Show Level Progress

**Files:**
- Modify: `src/app/portfolio/page.tsx`

**Step 1: Import and use LevelBadge and progress utilities**

Update `src/app/portfolio/page.tsx`:

1. Add imports at top:
```typescript
import { LevelBadge } from "@/components/journey";
import { getXPProgress } from "@/lib/levels";
import { ProgressBar } from "@/components/ui/ProgressBar";
```

2. Replace the Level Stat in the bankroll card with LevelBadge and progress bar.

**Step 2: Update the Bankroll Card section to include progress**

Replace the span showing "Level {profile?.level || 1}" badge with the LevelBadge component and add XP progress.

**Step 3: Verify no syntax errors**

Run: `cd /Users/javier/Documents/Desarrollo/theguild && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/app/portfolio/page.tsx
git commit -m "feat: add level badge and XP progress to portfolio"
```

---

## Task 7: Add First Follow XP Bonus

**Files:**
- Modify: `src/app/actions/follow.ts`
- Modify: `src/lib/queries.ts`

**Step 1: Add follow count query to queries.ts**

```typescript
export async function getUserFollowCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    return 0;
  }

  return count || 0;
}
```

**Step 2: Update follow action to award first follow XP**

In `src/app/actions/follow.ts`, after successfully creating follow, check if it's the first follow and award 50 XP.

**Step 3: Verify no syntax errors**

Run: `cd /Users/javier/Documents/Desarrollo/theguild && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/queries.ts src/app/actions/follow.ts
git commit -m "feat: add first follow XP bonus"
```

---

## Task 8: Add Level-Up Logic to XP Awards

**Files:**
- Modify: `src/lib/queries.ts` (add awardXP helper)
- Modify: `src/app/actions/position.ts`

**Step 1: Create awardXP utility function**

Add to `src/lib/queries.ts`:

```typescript
import { getLevelForXP } from "./levels";

export async function awardXP(userId: string, amount: number): Promise<{ newXP: number; leveledUp: boolean; newLevel: number }> {
  const { data: profile } = await supabase
    .from("users")
    .select("xp, level")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { newXP: 0, leveledUp: false, newLevel: 1 };
  }

  const newXP = profile.xp + amount;
  const newLevelConfig = getLevelForXP(newXP);
  const leveledUp = newLevelConfig.level > profile.level;

  await supabase
    .from("users")
    .update({ xp: newXP, level: newLevelConfig.level })
    .eq("id", userId);

  return { newXP, leveledUp, newLevel: newLevelConfig.level };
}
```

**Step 2: Update position.ts to use awardXP and update level**

Replace manual XP updates with awardXP calls.

**Step 3: Verify no syntax errors**

Run: `cd /Users/javier/Documents/Desarrollo/theguild && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/queries.ts src/app/actions/position.ts
git commit -m "feat: add level-up logic when awarding XP"
```

---

## Task 9: Add CSS Animations for Polish

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add animation utilities**

```css
/* Fade in animation */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Slide in from right */
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-slide-in {
  animation: slide-in-right 0.3s ease-out;
}

/* Pulse for live indicator */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 15px currentColor; }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Level up celebration */
@keyframes level-up {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.animate-level-up {
  animation: level-up 0.5s ease-in-out;
}
```

**Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add CSS animations for UI polish"
```

---

## Task 10: Improve Mobile Responsive Layout

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/masters/MasterCard.tsx`

**Step 1: Improve Header mobile navigation**

Update Header to handle mobile better with condensed nav.

**Step 2: Update MasterCard for better mobile display**

Ensure stats grid works well on small screens.

**Step 3: Verify no syntax errors**

Run: `cd /Users/javier/Documents/Desarrollo/theguild && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/layout/Header.tsx src/components/masters/MasterCard.tsx
git commit -m "feat: improve mobile responsive layouts"
```

---

## Task 11: Run Full Type Check and Build

**Files:**
- None (verification only)

**Step 1: Run TypeScript check**

Run: `cd /Users/javier/Documents/Desarrollo/theguild && npx tsc --noEmit`
Expected: No errors

**Step 2: Run build**

Run: `cd /Users/javier/Documents/Desarrollo/theguild && npm run build`
Expected: Build succeeds

**Step 3: Commit any fixes if needed**

---

## Task 12: Push to GitHub

**Step 1: Push all changes**

```bash
cd /Users/javier/Documents/Desarrollo/theguild && git push origin main
```

---

## Summary

Phase 5 adds:
- **Level configuration** with XP thresholds (0, 100, 500, 1500 XP for levels 1-4)
- **Journey page** ("/journey" - "The Climb") showing progression timeline
- **LevelBadge component** for displaying user level
- **ProgressBar component** for visual XP progress
- **Level-up logic** that auto-updates level when XP thresholds are crossed
- **First follow XP bonus** (50 XP)
- **CSS animations** for polish (fade-in, slide-in, pulse-glow)
- **Mobile responsive improvements**

The level system:
| Level | Title | XP Required | Unlocks |
|-------|-------|-------------|---------|
| 1 | Initiate | 0 | View leaderboard, follow 3 masters |
| 2 | Apprentice | 100 | Unlimited follows, full reasoning |
| 3 | Student | 500 | Auto-copy apprenticeships |
| 4 | Journeyman | 1500 | Own bets, mini-leaderboard |
