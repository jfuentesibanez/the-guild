# THE GUILD — Product Specification

## One-Liner

**"Apprentice under winning bettors. Learn how they think. Build your edge."**

---

## The Problem

Financial nihilism is real. A generation believes the traditional path to wealth is closed. They're taking asymmetric bets anyway — crypto, prediction markets, sports betting — because it's the only place that offers a real shot at escape.

But they're doing it blind. Alone. Without mentorship.

Meanwhile, the best predictors in the world are making bets in public (Polymarket, Metaculus, etc.), but their reasoning is invisible. You can see *what* they bet, but not *why*.

**The gap:** There's no way to learn from people who actually win.

---

## The Solution

A platform that surfaces winning predictors and lets you:

1. **Watch** what they bet and why
2. **Copy** their positions with one click
3. **Learn** their reasoning over time
4. **Build** your own track record
5. **Become** someone others learn from

It's apprenticeship for the prediction market era.

---

## Core Philosophy

- **Real stakes, real learning** — This is not a simulator
- **Imitation before innovation** — Copy first, diverge later
- **Transparency over mystery** — Track records are public, reasoning is shared
- **Skill compounds** — The more you learn, the better you get
- **No fake gurus** — Only verified track records, no "trust me bro"

---

## Target User

### Primary: The Rational Nihilist

- Age 22-35
- Believes traditional paths are closed
- Already dabbling in prediction markets, crypto, betting
- Smart but lacks mentorship
- Wants real stakes, not simulations
- Skeptical of gurus and courses
- Respects transparency and track records

### Secondary: The Curious Learner

- Age 18-28
- Interested in markets, geopolitics, forecasting
- Wants to develop a real skill
- Drawn to competitive/strategic games
- Prefers learning by doing over reading

---

## Aesthetic Direction: Retro Casino Meets Terminal

### Visual Vibe

Think: **Balatro meets Bloomberg Terminal meets 90s casino carpet**

- Dark background (deep green or charcoal)
- CRT screen glow / scanlines (subtle)
- Pixel fonts for headers, clean sans-serif for body
- Playing card motifs for predictors ("Aces", deck-building metaphors)
- Gold, green, red accents
- Satisfying micro-animations (card flips, chip stacks, slot-machine reveals)
- Sound design: casino chips, card shuffles, retro synth stings

### Tone of Voice

- Direct, no bullshit
- Slightly rebellious ("The system is rigged. Learn to play anyway.")
- Insider language, not corporate speak
- Dark humor welcome
- Never preachy about "responsible gambling"

### Sample Copy

```
"The house always wins. Join the house."

"Your portfolio of minds."

"They saw it coming. Now you can too."

"Track records don't lie. Gurus do."

"Copy. Learn. Diverge. Win."

"Welcome to The Guild."

"Masters teach. Apprentices learn. Everyone profits."
```

---

## Core Features (MVP)

### 1. The Leaderboard — "The Masters"

A ranked list of top masters with verified track records.

**Display for each master:**

```
┌─────────────────────────────────────────────────────────────┐
│  🂡 MARIA_MACRO                                    Rank #3  │
│  ───────────────────────────────────────────────────────── │
│  Win Rate: 64%    │  Avg Return: +127%  │  Bets: 847       │
│  Style: Political / Macro                                   │
│  Hot Streak: 🔥🔥🔥 (7 wins in a row)                       │
│  ───────────────────────────────────────────────────────── │
│  Latest: "Fed cuts by March" — YES @ 0.73                  │
│                                                             │
│  [ FOLLOW ]    [ VIEW BETS ]    [ COPY MODE ]              │
└─────────────────────────────────────────────────────────────┘
```

**Filters:**
- Time period (7d, 30d, 90d, All time)
- Style (Political, Crypto, Sports, Science, Culture)
- Risk profile (Conservative, Balanced, Degen)
- Minimum bets placed

**Sorting:**
- Win rate
- Total return
- Sharpe ratio (return / volatility)
- Current streak

---

### 2. Master Profiles — "The Card"

Each master has a detailed profile.

**Sections:**

**Stats Block:**
```
Total Bets: 847
Win Rate: 64%
Avg Return per Bet: +14.2%
Best Bet: +340% (Trump wins Iowa)
Worst Bet: -100% (Bitcoin ETF Jan)
Current Streak: 7W
Longest Streak: 12W
```

**Style Analysis:**
```
Markets: Politics (62%), Crypto (24%), Other (14%)
Avg Position Size: 3.2% of bankroll
Avg Odds When Entering: 0.35 (likes underdogs)
Avg Hold Time: 12 days
Contrarian Score: 78/100 (often bets against consensus)
```

**Recent Bets (with reasoning if shared):**
```
┌────────────────────────────────────────────────────────────┐
│  "Fed cuts rates by March 2025"                            │
│  Position: YES @ 0.73  │  Size: 3%  │  Status: OPEN        │
│  ──────────────────────────────────────────────────────── │
│  REASONING:                                                │
│  "Unemployment ticking up. Powell's language softening.    │
│  Bond market already pricing it in. 73% implied feels      │
│  low given historical patterns. Survivable if wrong."      │
│  ──────────────────────────────────────────────────────── │
│  [ COPY THIS BET ]                                         │
└────────────────────────────────────────────────────────────┘
```

**Performance Chart:**
- Cumulative returns over time
- Drawdowns highlighted
- Comparison to "market" (average predictor)

---

### 3. Copy Mode — "Apprenticeship"

Follow a master and mirror their bets.

**Setup:**
```
┌─────────────────────────────────────────────────────────────┐
│  APPRENTICE MODE: MARIA_MACRO                               │
│  ───────────────────────────────────────────────────────── │
│  Your virtual bankroll: $10,000                            │
│                                                             │
│  Position sizing:                                           │
│  ○ Match exactly (if she bets 3%, you bet 3%)              │
│  ○ Scale down 50% (if she bets 3%, you bet 1.5%)           │
│  ○ Fixed amount ($100 per bet)                              │
│                                                             │
│  Auto-copy new bets?  [YES] / [NO, notify me first]        │
│                                                             │
│  [ BEGIN APPRENTICESHIP ]                                   │
└─────────────────────────────────────────────────────────────┘
```

**Notifications:**
- "Maria just bet YES on 'Bitcoin above $100K by June' @ 0.42"
- "Maria closed her Fed position for +34%"
- "Your copy of Maria's bet just resolved: +$340"

---

### 4. Your Portfolio — "The Hand"

Your current positions and tracked performance.

**Display:**
```
┌─────────────────────────────────────────────────────────────┐
│  YOUR HAND                          Virtual Bankroll: $12,340│
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  OPEN POSITIONS (4)                                         │
│                                                             │
│  Fed cuts March │ YES @ 0.73 │ Now: 0.81 │ +$108 │ via Maria│
│  BTC > $100K    │ YES @ 0.42 │ Now: 0.38 │ -$47  │ via Maria│
│  Trump nominee  │ YES @ 0.65 │ Now: 0.71 │ +$89  │ OWN BET  │
│  UFC: Jones win │ YES @ 0.55 │ Now: 0.60 │ +$23  │ via Dan  │
│                                                             │
│  ───────────────────────────────────────────────────────── │
│  PERFORMANCE                                                │
│  Today: +$134 (+1.1%)                                       │
│  This Week: +$890 (+7.8%)                                   │
│  All Time: +$2,340 (+23.4%)                                 │
│  Win Rate: 58%                                              │
│  ───────────────────────────────────────────────────────── │
│  Your Rank: #4,892 of 23,441 players                       │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. The Feed — "The Wire"

Real-time stream of activity.

```
┌─────────────────────────────────────────────────────────────┐
│  THE WIRE                                          LIVE 🔴  │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  2 min ago   @maria_macro bet $2,400 on "Starship          │
│              orbital success by Q1" YES @ 0.45              │
│              "SpaceX track record + recent tests = 🚀"      │
│                                                             │
│  7 min ago   @data_dan closed "Biden approval >42%" for    │
│              +67% return. Held for 23 days.                 │
│                                                             │
│  12 min ago  @contrarian_k bet AGAINST consensus:          │
│              "No Ukraine ceasefire 2025" YES @ 0.31         │
│              "Everyone wants it, no one can deliver it"     │
│                                                             │
│  18 min ago  YOUR COPY of maria_macro just won! +$156      │
│                                                             │
│  34 min ago  NEW PREDICTOR entered Top 20: @sigma_sarah    │
│              Win rate 71% over 3 months                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. Learning Mode — "The Library"

Curated content explaining why predictors made specific calls.

**Post-mortems on resolved bets:**
```
┌─────────────────────────────────────────────────────────────┐
│  CASE STUDY: How @maria_macro called the Fed pivot         │
│  ───────────────────────────────────────────────────────── │
│  Result: +127% return                                       │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  THE BET                                                    │
│  "Fed cuts rates by March 2025" — YES @ 0.43               │
│  Entry: November 12, 2024                                   │
│  Exit: Resolved YES, March 3, 2025                         │
│                                                             │
│  HER REASONING (from her notes)                            │
│  1. Labor market softening (cited specific data)           │
│  2. Inflation trajectory (showed chart)                    │
│  3. Historical Fed behavior patterns                       │
│  4. Bond market already pricing cuts                       │
│  5. Contrarian signal: "everyone expects higher for longer"│
│                                                             │
│  WHAT WE CAN LEARN                                         │
│  - Entry timing: She bought when odds were 0.43, not 0.70  │
│  - Position sizing: 4% of bankroll (confident but not reckless)│
│  - Information sources: Fed speeches, labor data, bond yields│
│  - Contrarian instinct: Bet against "consensus" narrative  │
│                                                             │
│  [ EXPLORE SIMILAR BETS ]    [ FOLLOW MARIA ]              │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. Your Journey — "The Climb"

Progression system showing skill development.

**Levels:**

| Level | Title | Requirements | Unlocks |
|-------|-------|--------------|---------|
| 1 | Initiate | Join | View leaderboard, follow 3 masters |
| 2 | Apprentice | First 10 copied bets | View full reasoning, basic stats |
| 3 | Student | 30 days active, 50 bets | Copy unlimited masters |
| 4 | Journeyman | 20% win rate, 100 bets | Make own bets visible |
| 5 | Craftsman | 50% win rate, 200 bets | Share reasoning on your bets |
| 6 | Expert | 55% win rate, 500 bets | Appear on mini-leaderboard |
| 7 | Master | 60% win rate, 1000 bets, followers | Full leaderboard, others can copy you |
| 8 | Grandmaster | Top 1%, verified edge | Revenue share on copiers |

**Display:**
```
┌─────────────────────────────────────────────────────────────┐
│  YOUR JOURNEY                                               │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  Current Level: STUDENT (Level 3)                          │
│  ████████████░░░░░░░░ 62% to Practitioner                  │
│                                                             │
│  To advance:                                                │
│  ✓ 30 days active (41 days)                                │
│  ✓ 50 bets placed (73 bets)                                │
│  ○ 20% win rate (currently 18% — need 2 more wins)         │
│                                                             │
│  Next unlock: Make your own bets visible to others         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model (Simplified)

### Master
```
{
  id: string
  username: string
  display_name: string
  avatar: string (or generated pixel art)
  bio: string
  
  stats: {
    total_bets: number
    wins: number
    losses: number
    pending: number
    win_rate: float
    total_return: float
    avg_return_per_bet: float
    current_streak: number
    best_streak: number
    sharpe_ratio: float
  }
  
  style: {
    primary_markets: string[] (politics, crypto, sports, etc)
    avg_position_size: float
    avg_entry_odds: float
    avg_hold_time_days: number
    contrarian_score: number (0-100)
  }
  
  rank: number
  apprentices: number (followers)
  created_at: timestamp
}
```

### Bet
```
{
  id: string
  master_id: string
  
  market: {
    platform: string (polymarket, metaculus, etc)
    question: string
    url: string
    category: string
  }
  
  position: {
    side: "YES" | "NO"
    entry_odds: float
    entry_amount: float
    entry_date: timestamp
    
    exit_odds: float (if closed)
    exit_date: timestamp (if closed)
    
    current_odds: float (if open)
    status: "OPEN" | "WON" | "LOST" | "CLOSED_EARLY"
    return_pct: float
  }
  
  reasoning: string (optional, shared by master)
  
  copied_by: number (count of apprentices who copied)
}
```

### User
```
{
  id: string
  username: string
  
  virtual_bankroll: float (starts at $10,000)
  
  following: string[] (master_ids)
  apprenticeships: {
    master_id: string
    sizing: "match" | "half" | "fixed"
    fixed_amount: float (if sizing = fixed)
    auto_copy: boolean
  }[]
  
  positions: Position[]
  
  stats: {
    total_bets: number
    win_rate: float
    total_return: float
    rank: number
  }
  
  level: number
  xp: number
  
  created_at: timestamp
}
```

### Position (User's copy or own bet)
```
{
  id: string
  user_id: string
  bet_id: string (if copied) | null (if own bet)
  
  side: "YES" | "NO"
  entry_odds: float
  entry_amount: float
  entry_date: timestamp
  
  status: "OPEN" | "WON" | "LOST"
  return_amount: float
  
  source: "APPRENTICE" | "OWN"
  copied_from: string (master_id, if apprentice copy)
}
```

---

## MVP Scope

### Must Have (V1)

1. **Leaderboard** with 20-50 seeded masters (can be manually curated initially)
2. **Master profiles** with stats and recent bets
3. **Follow system** (follow masters, see their activity)
4. **Virtual bankroll** ($10,000 starting)
5. **Apprentice mode** (mirror a master's bets with virtual money)
6. **Your portfolio** (see your positions and performance)
7. **Basic feed** (activity stream)
8. **Simple progression** (levels 1-4 at least)
9. **Retro UI** (the vibe matters from day 1)

### Nice to Have (V1.5)

10. Reasoning/notes on bets (masters can explain their thinking)
11. Case studies / learning mode
12. Notifications (new bets, resolved positions)
13. Search and filters on leaderboard
14. Comparison tool (compare two masters)

### Later (V2+)

15. Real wallet connection
16. Real money copying
17. Revenue share for top masters
18. Mobile app
19. Social features (comments, discussions)
20. API for masters to auto-post bets

---

## Platform Decision

### Options

| Platform | Pros | Cons |
|----------|------|------|
| **Web App** | Richest UI, best for retro aesthetic, works everywhere | More dev time, need responsive design |
| **Telegram Bot** | Fast to build, built-in notifications, viral loops | Limited UI, hard to do retro vibe, no rich data viz |
| **Mobile App** | Best UX, notifications, native feel | Longest dev time, app store approval |

### Recommendation

**Start with Web App (mobile-responsive).**

Reasons:
- The retro aesthetic is core to the product — Telegram can't deliver it
- Data visualization (charts, stats) needs screen real estate
- Can still be used on mobile via browser
- Faster to iterate than native app
- Can add Telegram notifications later as a layer

---

## Technical Considerations

### Data Sources

For MVP, we need prediction market data:

**Polymarket:**
- Public API available
- Bet history is on-chain (can verify)
- Categories: Politics, Crypto, Sports, Culture

**Metaculus:**
- API available
- More science/tech focused
- Good for calibration tracking

**For MVP:** Start with Polymarket only. It's where the volume is.

### Master Seeding

For launch, we need compelling masters. Options:

1. **Scrape top Polymarket wallets** — identify consistently profitable addresses
2. **Invite known forecasters** — reach out to people with public track records
3. **Synthetic masters** — create "strategies" based on historical patterns (clearly labeled as algorithmic)
4. **Founding masters** — recruit 10-20 people to be early guild masters

Recommendation: Combination of 1 + 4. Scrape for data, recruit for reasoning.

### No Wallet Connection (MVP)

Users don't connect wallets. Everything is virtual/simulated.

- User signs up (email or social)
- Gets $10,000 virtual bankroll
- All bets are tracked in our database, not on-chain
- Predictor data is pulled from public sources

This keeps it simple and avoids regulatory complexity for V1.

---

## Success Metrics

### North Star
**Monthly Active Guild Members** — users who place at least 1 bet (copy or own) per month

### Supporting Metrics

| Metric | Target (Month 3) |
|--------|------------------|
| Signups | 5,000 |
| MAU | 1,500 |
| Bets placed (copies + own) | 10,000 |
| Avg bets per active user | 7 |
| Retention (Week 4) | 25% |
| Users reaching Level 3 | 500 |

### Qualitative
- Do users talk about it? (social sharing, word of mouth)
- Are users developing real opinions? (moving from pure copy to own bets)
- Do users understand *why* bets won or lost? (learning is happening)

---

## Open Questions

1. **Name?** "The Guild" — clean, mysterious, implies craft and apprenticeship. Alternatives considered:
   - BetGuild (too gambling-forward)
   - Predictors Guild (too long)
   - The Pit
   - Oracle Club  
   - EdgeFinder

2. **How to verify master track records?** Polymarket is on-chain, so we can verify. But need to link wallets to usernames somehow.

3. **How to incentivize masters to share reasoning?** More apprentices? Gamification? Future revenue share?

4. **What's the minimum viable retro aesthetic?** Can we get 80% of the vibe with a good color palette + one pixel font + simple animations?

5. **Community moderation?** What if masters game the system or share bad reasoning?

---

## Next Steps

1. **Validate demand** — landing page + waitlist
2. **Design core screens** — Leaderboard, Profile, Portfolio (Figma or direct code)
3. **Build data pipeline** — Polymarket API integration, predictor identification
4. **Recruit founding predictors** — 10-20 people with track records
5. **Build MVP** — 6-8 week sprint
6. **Closed beta** — 100-500 users, iterate
7. **Public launch**

---

## Appendix: UI Inspiration

### Color Palette
```
Background:     #1a1a2e (deep blue-black)
Surface:        #16213e (dark blue)
Primary:        #e94560 (hot pink/red)
Secondary:      #0f3460 (navy)
Accent:         #f0c040 (gold)
Text:           #eaeaea (off-white)
Text-muted:     #888888 (gray)
Success:        #4ade80 (green)
Danger:         #ef4444 (red)
```

### Typography
```
Headers:        "Press Start 2P" or "VT323" (pixel fonts)
Body:           "IBM Plex Mono" or "JetBrains Mono" (monospace)
Numbers:        "Roboto Mono" (tabular for alignment)
```

### Micro-interactions
- Card flip animation when revealing bet outcome
- Chip stack animation when bankroll changes
- Subtle CRT flicker on screen transitions
- Slot machine spin when loading leaderboard
- Confetti burst on level up
- Streak fire animation (🔥) on hot predictors

---

## Final Note

This product isn't about gambling. It's about **learning from people who win**.

The prediction market is the classroom. The top predictors are the masters. The copy function is the training wheels. The goal is graduation — becoming someone who can think for themselves.

**The Guild** — because skill is a craft. And crafts are learned through apprenticeship.

Build it simple. Build it beautiful. Build it honest.

**"Track records don't lie. Learn from the masters. Build your edge."**
