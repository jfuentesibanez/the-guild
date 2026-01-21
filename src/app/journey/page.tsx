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
                  className={`${isCurrentLevel ? "ring-2 ring-[var(--color-accent)]" : ""} ${!isUnlocked ? "opacity-50" : ""}`}
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
