// src/app/masters/[username]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMasterByUsername, getMasterBets, isFollowingMaster, getMasterFollowerCount } from "@/lib/queries";
import { getUser } from "@/lib/supabase-server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Stat";
import { BetCard } from "@/components/bets";
import { FollowButton } from "@/components/masters";

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

  const [bets, user, followerCount] = await Promise.all([
    getMasterBets(master.id, { limit: 10 }),
    getUser(),
    getMasterFollowerCount(master.id),
  ]);

  const isFollowing = user ? await isFollowingMaster(user.id, master.id) : false;
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

            <div className="flex items-center gap-4">
              {stats?.current_streak && Math.abs(stats.current_streak) >= 3 && (
                <span className="text-2xl">
                  {"🔥".repeat(Math.min(Math.abs(stats.current_streak), 5))}
                </span>
              )}
              <FollowButton
                masterId={master.id}
                isFollowing={isFollowing}
                isAuthenticated={!!user}
              />
            </div>
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
            <Stat label="Followers" value={followerCount} />
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
