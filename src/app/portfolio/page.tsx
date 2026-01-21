// src/app/portfolio/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getUserProfile } from "@/lib/supabase-server";
import { getFollowedMasters, getUserPositions, getUserStats } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { MasterCard } from "@/components/masters";
import { PositionCard } from "@/components/portfolio";
import { LevelBadge } from "@/components/journey";
import { getXPProgress } from "@/lib/levels";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const revalidate = 60;

export default async function PortfolioPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, followedMasters, openPositions, recentPositions, stats] = await Promise.all([
    getUserProfile(),
    getFollowedMasters(user.id),
    getUserPositions(user.id, { status: 'OPEN' }),
    getUserPositions(user.id, { limit: 10 }),
    getUserStats(user.id),
  ]);

  const winRate = stats.totalPositions > 0
    ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)
    : "0";

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
            YOUR HAND
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            Your portfolio and positions
          </p>
        </div>

        {/* Bankroll Card */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm"
              style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
            >
              VIRTUAL BANKROLL
            </h2>
            <LevelBadge xp={xp} size="sm" />
          </div>

          <div className="text-center py-4">
            <p
              className="text-4xl font-bold"
              style={{ color: "var(--color-success)" }}
            >
              ${(profile?.virtual_bankroll || 10000).toLocaleString()}
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: "var(--color-muted)" }}
            >
              Starting balance: $10,000
            </p>
          </div>

          {nextLevel && (
            <div className="mt-4 mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                  XP Progress
                </span>
                <span className="text-xs" style={{ color: "var(--color-accent)" }}>
                  {xp} / {nextLevel.xpRequired} XP
                </span>
              </div>
              <ProgressBar value={progressPercent} size="sm" />
              <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                {xpToNext} XP to {nextLevel.title}
              </p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4 pt-4" style={{ borderTop: "1px solid var(--color-secondary)" }}>
            <Stat label="XP" value={profile?.xp || 0} />
            <Stat label="Level" value={profile?.level || 1} />
            <Stat label="Following" value={followedMasters.length} />
            <Stat label="Positions" value={stats.totalPositions} />
          </div>
        </Card>

        {/* Performance Stats */}
        {stats.totalPositions > 0 && (
          <Card className="mb-8">
            <h2
              className="text-sm mb-4"
              style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
            >
              PERFORMANCE
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <Stat label="Win Rate" value={`${winRate}%`} />
              <Stat label="Wins" value={stats.wins} variant="success" />
              <Stat label="Losses" value={stats.losses} variant="danger" />
              <Stat
                label="Total Return"
                value={`$${stats.totalReturn.toFixed(0)}`}
                variant={stats.totalReturn >= 0 ? "success" : "danger"}
              />
            </div>
          </Card>
        )}

        {/* Open Positions */}
        <div className="mb-8">
          <h2
            className="text-sm mb-4"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
          >
            OPEN POSITIONS ({openPositions.length})
          </h2>

          {openPositions.length === 0 ? (
            <Card hover={false}>
              <div className="text-center py-8">
                <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
                  No open positions. Copy a bet from a master to get started.
                </p>
                <Link
                  href="/"
                  className="inline-block px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                  }}
                >
                  Browse Masters
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {openPositions.map((position) => (
                <PositionCard key={position.id} position={position} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Closed Positions */}
        {recentPositions.filter(p => p.status !== 'OPEN').length > 0 && (
          <div className="mb-8">
            <h2
              className="text-sm mb-4"
              style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
            >
              RECENT CLOSED
            </h2>
            <div className="space-y-3">
              {recentPositions
                .filter(p => p.status !== 'OPEN')
                .slice(0, 5)
                .map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
            </div>
          </div>
        )}

        {/* Followed Masters */}
        <div className="mb-4">
          <h2
            className="text-sm mb-4"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
          >
            FOLLOWING ({followedMasters.length})
          </h2>

          {followedMasters.length === 0 ? (
            <Card hover={false}>
              <div className="text-center py-8">
                <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
                  You&apos;re not following any masters yet.
                </p>
                <Link
                  href="/"
                  className="inline-block px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                  }}
                >
                  Browse Masters
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {followedMasters.map((master) => (
                <MasterCard key={master.id} master={master} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
