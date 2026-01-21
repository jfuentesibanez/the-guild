# THE GUILD — Technical Design Document

**Date:** 2026-01-21
**Status:** Approved for implementation

---

## Overview

A platform that surfaces winning predictors from Polymarket and lets users learn from them through apprenticeship. Users can watch, copy, and learn from top predictors, building their own track record over time.

**Core value prop:** "Apprentice under winning bettors. Learn how they think. Build your edge."

---

## Technical Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + custom retro theme |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google) |
| Hosting | Vercel |
| Real-time | Polling (30-60s intervals) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    Next.js 14 (App Router)                       │
│         TypeScript + Tailwind CSS + Pixel Font Headers           │
│                      Deployed on Vercel                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Auth       │  │  Database   │  │  Storage (avatars)      │  │
│  │  (Email +   │  │  (Postgres) │  │                         │  │
│  │  Google)    │  │             │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### masters
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| username | text | Unique handle (e.g., "maria_macro") |
| display_name | text | Display name |
| bio | text | Short bio |
| avatar_url | text | Profile image |
| polymarket_wallet | text | For future verification |
| primary_markets | text[] | Categories (politics, crypto, etc.) |
| created_at | timestamp | |

### master_stats
| Column | Type | Description |
|--------|------|-------------|
| master_id | uuid | FK to masters |
| total_bets | int | |
| wins | int | |
| losses | int | |
| pending | int | |
| win_rate | decimal | |
| total_return | decimal | |
| avg_return | decimal | |
| current_streak | int | |
| best_streak | int | |
| contrarian_score | int | 0-100 |
| rank | int | Leaderboard position |
| updated_at | timestamp | |

### bets
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| master_id | uuid | FK to masters |
| market_question | text | e.g., "Fed cuts rates by March" |
| market_url | text | Link to Polymarket |
| market_category | text | politics, crypto, sports, etc. |
| side | text | "YES" or "NO" |
| entry_odds | decimal | Price when entered |
| entry_amount | decimal | Amount bet |
| entry_date | timestamp | |
| exit_odds | decimal | Price when exited (if closed) |
| exit_date | timestamp | |
| current_odds | decimal | Current market price |
| status | text | OPEN, WON, LOST |
| return_pct | decimal | % return |
| reasoning | text | Master's notes (optional) |
| created_at | timestamp | |

### users
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (matches auth.users) |
| username | text | Unique handle |
| virtual_bankroll | decimal | Default $10,000 |
| level | int | Default 1 |
| xp | int | Default 0 |
| created_at | timestamp | |

### follows
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | FK to users |
| master_id | uuid | FK to masters |
| created_at | timestamp | |

### apprenticeships
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| master_id | uuid | FK to masters |
| sizing_mode | text | "match", "half", "fixed" |
| fixed_amount | decimal | If sizing_mode = fixed |
| auto_copy | boolean | Default false |
| active | boolean | Default true |
| created_at | timestamp | |

### positions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| bet_id | uuid | FK to bets (null if own bet) |
| master_id | uuid | FK to masters (null if own bet) |
| market_question | text | |
| side | text | YES or NO |
| entry_odds | decimal | |
| entry_amount | decimal | |
| entry_date | timestamp | |
| status | text | OPEN, WON, LOST |
| return_amount | decimal | |
| source | text | "COPY" or "OWN" |
| created_at | timestamp | |

---

## Pages & Routes

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
│
├── (main)/
│   ├── layout.tsx              # Nav: logo, links, user menu
│   ├── page.tsx                # Leaderboard ("The Masters")
│   ├── masters/[username]/page.tsx  # Master profile ("The Card")
│   ├── feed/page.tsx           # Activity stream ("The Wire")
│   ├── portfolio/page.tsx      # User positions ("The Hand")
│   ├── journey/page.tsx        # Progression ("The Climb")
│   └── settings/page.tsx
│
└── api/
    ├── masters/
    ├── bets/
    ├── positions/
    ├── follow/
    └── apprentice/
```

---

## UI Theme

### Colors (Tailwind config)
```js
colors: {
  bg:        '#1a1a2e',  // deep blue-black
  surface:   '#16213e',  // dark blue (cards)
  primary:   '#e94560',  // hot pink/red (CTAs)
  secondary: '#0f3460',  // navy (borders)
  accent:    '#f0c040',  // gold (highlights)
  text:      '#eaeaea',  // off-white
  muted:     '#888888',  // gray
  success:   '#4ade80',  // green (wins)
  danger:    '#ef4444',  // red (losses)
}
```

### Typography
- Headers: "Press Start 2P" (pixel font)
- Body: "JetBrains Mono" (monospace)

### Core vibe
- Color palette + pixel fonts for headers
- Subtle hover states (border glow, scale)
- Skip heavy CRT effects and sounds for MVP

---

## Component Structure

```
components/
├── ui/
│   ├── Card.tsx
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── Stat.tsx
│   └── ProgressBar.tsx
│
├── masters/
│   ├── MasterCard.tsx
│   ├── MasterProfile.tsx
│   └── MasterStats.tsx
│
├── bets/
│   ├── BetCard.tsx
│   ├── BetList.tsx
│   └── CopyBetButton.tsx
│
├── portfolio/
│   ├── PositionCard.tsx
│   ├── PositionList.tsx
│   └── BankrollDisplay.tsx
│
├── feed/
│   └── FeedItem.tsx
│
└── journey/
    ├── LevelBadge.tsx
    └── ProgressTracker.tsx
```

---

## Progression System

### Levels (MVP: 1-4)
| Level | Title | Requirements | Unlocks |
|-------|-------|--------------|---------|
| 1 | Initiate | Join | View leaderboard, follow 3 masters |
| 2 | Apprentice | 10 copied bets | Unlimited follows, full reasoning |
| 3 | Student | 30 days + 50 bets | Apprenticeships (auto-copy) |
| 4 | Journeyman | 40% win rate + 100 bets | Own bets, mini-leaderboard |

### XP Awards
- Copy bet: 10 XP
- Bet won: 25 XP
- Bet lost: 5 XP
- First follow: 50 XP
- Daily login: 5 XP

---

## Copy Mode Logic

1. User starts apprenticeship → row in `apprenticeships`
2. New bet added for master:
   - Query active apprenticeships
   - For auto_copy=true: create position, deduct bankroll
3. Bet resolves:
   - Update all linked positions
   - Adjust bankrolls
   - Award XP

### Position sizing
```ts
if (sizing_mode === 'match') {
  amount = (bet.entry_amount / master_bankroll) * user.virtual_bankroll
} else if (sizing_mode === 'half') {
  amount = ((bet.entry_amount / master_bankroll) * user.virtual_bankroll) / 2
} else {
  amount = apprenticeship.fixed_amount
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Project setup: Next.js 14, Tailwind, Supabase
- Auth flow: signup, login, logout
- Database schema + RLS policies
- Base layout with nav and theme

### Phase 2: Masters & Leaderboard (Week 2)
- Seed 10-15 masters manually
- Leaderboard page with sorting
- Master profile page
- Basic filters

### Phase 3: User Portfolio (Week 3)
- Follow/unfollow
- Portfolio page with bankroll
- Position cards
- P&L calculations

### Phase 4: Copy Mode (Week 4)
- Apprenticeship setup modal
- Position creation on copy
- Bet resolution flow
- Basic feed

### Phase 5: Progression & Polish (Week 5)
- Level system with XP
- Journey page
- UI polish
- Mobile responsive

### Phase 6: Launch Prep (Week 6)
- Seed 20-30 masters
- Add reasoning to bets
- Error handling
- Production deploy

---

## Data Sourcing (MVP)

- Manual curation of 20-50 masters
- Research top Polymarket wallets
- Enter historical bet data manually
- Automation planned for post-MVP

---

## Success Metrics

- **North Star:** Monthly Active Guild Members (1+ bet/month)
- Signups: 5,000 (Month 3)
- MAU: 1,500
- Bets placed: 10,000
- Week 4 retention: 25%
