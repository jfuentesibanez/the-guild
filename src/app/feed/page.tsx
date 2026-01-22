// src/app/feed/page.tsx
import { supabase } from "@/lib/supabase";
import { FeedItem } from "@/components/feed";
import type { Bet, Master } from "@/lib/types";
import Link from "next/link";

export const revalidate = 30;

async function getBets(activeOnly: boolean): Promise<(Bet & { master: Master })[]> {
  let query = supabase
    .from("bets")
    .select(`
      *,
      master:masters (*)
    `);

  if (activeOnly) {
    query = query.eq("status", "OPEN");
  }

  const { data, error } = await query
    .order("entry_date", { ascending: false })
    .limit(30);

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

interface FeedPageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
  const filter = params.filter || "active";
  const activeOnly = filter === "active";
  const bets = await getBets(activeOnly);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
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
            {activeOnly ? "Active bets you can copy now" : "All activity from the masters"}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          <Link
            href="/feed?filter=active"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeOnly ? "var(--color-primary)" : "var(--color-surface)",
              color: activeOnly ? "var(--color-bg)" : "var(--color-muted)",
              border: `1px solid ${activeOnly ? "var(--color-primary)" : "var(--color-border)"}`,
            }}
          >
            Active Bets
          </Link>
          <Link
            href="/feed?filter=all"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: !activeOnly ? "var(--color-primary)" : "var(--color-surface)",
              color: !activeOnly ? "var(--color-bg)" : "var(--color-muted)",
              border: `1px solid ${!activeOnly ? "var(--color-primary)" : "var(--color-border)"}`,
            }}
          >
            All History
          </Link>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {bets.length === 0 ? (
            <p style={{ color: "var(--color-muted)" }} className="text-center py-8">
              {activeOnly ? "No active bets right now." : "No activity yet. Check back soon."}
            </p>
          ) : (
            bets.map((bet) => (
              <FeedItem key={bet.id} bet={bet} timeAgo={getTimeAgo(bet.entry_date)} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
