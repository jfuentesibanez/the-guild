// src/components/portfolio/PositionCard.tsx
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { PositionWithMaster } from "@/lib/types";

interface PositionCardProps {
  position: PositionWithMaster;
}

export function PositionCard({ position }: PositionCardProps) {
  const isWon = position.status === 'WON';
  const isLost = position.status === 'LOST';
  const isOpen = position.status === 'OPEN';

  // Calculate unrealized P&L for open positions
  const currentValue = isOpen && position.current_odds
    ? position.entry_amount / position.current_odds
    : null;
  const unrealizedPnL = currentValue
    ? currentValue - position.entry_amount
    : null;

  // Calculate realized P&L for closed positions
  const realizedPnL = !isOpen && position.return_amount !== null
    ? position.return_amount - position.entry_amount
    : null;

  const pnl = isOpen ? unrealizedPnL : realizedPnL;
  const pnlColor = pnl && pnl > 0
    ? "var(--color-success)"
    : pnl && pnl < 0
      ? "var(--color-danger)"
      : "var(--color-muted)";

  return (
    <Card hover={false}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm mb-2 truncate" style={{ color: "var(--color-text)" }}>
            {position.market_question}
          </p>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span
              className="px-2 py-1 rounded"
              style={{
                backgroundColor: position.side === 'YES' ? 'var(--color-success)' : 'var(--color-danger)',
                color: 'var(--color-bg)',
              }}
            >
              {position.side}
            </span>
            <span style={{ color: "var(--color-muted)" }}>
              @ {position.entry_odds.toFixed(2)}
            </span>
            {isOpen && position.current_odds && (
              <>
                <span style={{ color: "var(--color-muted)" }}>→</span>
                <span style={{ color: "var(--color-accent)" }}>
                  {position.current_odds.toFixed(2)}
                </span>
              </>
            )}
            <span style={{ color: "var(--color-muted)" }}>
              ${position.entry_amount.toFixed(0)}
            </span>
          </div>

          {position.master && (
            <Link
              href={`/masters/${position.master.username}`}
              className="text-xs mt-2 inline-block hover:opacity-80"
              style={{ color: "var(--color-muted)" }}
            >
              via @{position.master.username}
            </Link>
          )}
        </div>

        <div className="text-right">
          <span
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: isWon
                ? "var(--color-success)"
                : isLost
                  ? "var(--color-danger)"
                  : "var(--color-secondary)",
              color: isOpen ? "var(--color-text)" : "var(--color-bg)",
            }}
          >
            {position.status}
          </span>

          {pnl !== null && (
            <p
              className="text-sm font-bold mt-2"
              style={{ color: pnlColor }}
            >
              {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
