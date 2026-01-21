// src/app/portfolio/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getUserProfile } from "@/lib/supabase-server";
import { getFollowedMasters } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { MasterCard } from "@/components/masters";

export const revalidate = 60;

export default async function PortfolioPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, followedMasters] = await Promise.all([
    getUserProfile(),
    getFollowedMasters(user.id),
  ]);

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
            Your portfolio and followed masters
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
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-muted)",
              }}
            >
              Level {profile?.level || 1}
            </span>
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

          <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: "1px solid var(--color-secondary)" }}>
            <Stat label="XP" value={profile?.xp || 0} />
            <Stat label="Level" value={profile?.level || 1} />
            <Stat label="Following" value={followedMasters.length} />
          </div>
        </Card>

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

        {/* Coming Soon */}
        <Card hover={false} className="mt-8">
          <div className="text-center py-4">
            <p
              className="text-xs mb-2"
              style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
            >
              COMING SOON
            </p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Copy trades, track positions, and build your track record
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
