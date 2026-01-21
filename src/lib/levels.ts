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
