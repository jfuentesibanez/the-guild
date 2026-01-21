// src/components/feed/FeedItem.tsx
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Bet, Master } from "@/lib/types";

interface FeedItemProps {
  bet: Bet & { master: Master };
  timeAgo: string;
}

export function FeedItem({ bet, timeAgo }: FeedItemProps) {
  return (
    <Card hover={false}>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0"
          style={{
            backgroundColor: "var(--color-secondary)",
            fontFamily: "var(--font-pixel)",
            color: "var(--color-accent)",
          }}
        >
          {bet.master.display_name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/masters/${bet.master.username}`}
              className="text-sm font-medium hover:opacity-80"
              style={{ color: "var(--color-primary)" }}
            >
              @{bet.master.username}
            </Link>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {timeAgo}
            </span>
          </div>

          <p className="text-sm mb-2" style={{ color: "var(--color-text)" }}>
            bet{' '}
            <span
              className="px-1 rounded"
              style={{
                backgroundColor: bet.side === 'YES' ? 'var(--color-success)' : 'var(--color-danger)',
                color: 'var(--color-bg)',
              }}
            >
              {bet.side}
            </span>
            {' '}on
          </p>

          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            &quot;{bet.market_question}&quot;
          </p>

          <p className="text-xs mt-2" style={{ color: "var(--color-accent)" }}>
            @ {bet.entry_odds.toFixed(2)} • ${bet.entry_amount.toFixed(0)}
          </p>

          {bet.reasoning && (
            <p className="text-xs mt-2 italic" style={{ color: "var(--color-muted)" }}>
              &quot;{bet.reasoning}&quot;
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
