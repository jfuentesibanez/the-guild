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
