import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Bet } from "@/lib/types";

interface BetCardProps {
  bet: Bet;
}

export function BetCard({ bet }: BetCardProps) {
  const statusVariant = bet.status === "WON"
    ? "success"
    : bet.status === "LOST"
      ? "danger"
      : "accent";

  const pnlDisplay = bet.return_pct
    ? bet.return_pct > 0
      ? `+${bet.return_pct.toFixed(0)}%`
      : `${bet.return_pct.toFixed(0)}%`
    : null;

  const currentOddsChange = bet.current_odds && bet.entry_odds
    ? ((bet.current_odds - bet.entry_odds) * 100).toFixed(0)
    : null;

  return (
    <Card hover={false}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--color-text)" }}
          >
            {bet.market_question}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={bet.side === "YES" ? "success" : "danger"}>
              {bet.side}
            </Badge>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              @ {(bet.entry_odds * 100).toFixed(0)}¢
            </span>
            {bet.current_odds && bet.status === "OPEN" && (
              <span
                className="text-xs"
                style={{
                  color: currentOddsChange && parseInt(currentOddsChange) > 0
                    ? "var(--color-success)"
                    : currentOddsChange && parseInt(currentOddsChange) < 0
                      ? "var(--color-danger)"
                      : "var(--color-muted)"
                }}
              >
                → {(bet.current_odds * 100).toFixed(0)}¢
              </span>
            )}
          </div>
        </div>
        <Badge variant={statusVariant}>
          {bet.status}
          {pnlDisplay && ` ${pnlDisplay}`}
        </Badge>
      </div>

      {bet.reasoning && (
        <div
          className="mt-3 p-3 rounded text-xs"
          style={{
            backgroundColor: "var(--color-bg)",
            color: "var(--color-muted)",
            borderLeft: "2px solid var(--color-accent)"
          }}
        >
          &quot;{bet.reasoning}&quot;
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
        <span>
          ${bet.entry_amount.toLocaleString()}
        </span>
        <span>
          {new Date(bet.entry_date).toLocaleDateString()}
        </span>
        <Badge>{bet.market_category}</Badge>
      </div>
    </Card>
  );
}
