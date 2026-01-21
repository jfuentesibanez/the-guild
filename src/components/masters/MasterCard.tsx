import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Stat";
import type { MasterWithStats } from "@/lib/types";

interface MasterCardProps {
  master: MasterWithStats;
}

export function MasterCard({ master }: MasterCardProps) {
  const stats = master.master_stats;

  const streakDisplay = stats?.current_streak
    ? stats.current_streak > 0
      ? `${stats.current_streak}W`
      : `${Math.abs(stats.current_streak)}L`
    : "—";

  const streakVariant = stats?.current_streak && stats.current_streak > 0
    ? "success"
    : stats?.current_streak && stats.current_streak < 0
      ? "danger"
      : "default";

  return (
    <Link href={`/masters/${master.username}`}>
      <Card className="cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{
                backgroundColor: "var(--color-secondary)",
                fontFamily: "var(--font-pixel)",
                color: "var(--color-accent)"
              }}
            >
              {stats?.rank || "—"}
            </div>
            <div>
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {master.display_name}
              </h3>
              <p
                className="text-xs"
                style={{ color: "var(--color-muted)" }}
              >
                @{master.username}
              </p>
            </div>
          </div>

          {stats?.current_streak && Math.abs(stats.current_streak) >= 3 && (
            <span className="text-lg" title={`${Math.abs(stats.current_streak)} streak`}>
              {"🔥".repeat(Math.min(Math.abs(stats.current_streak), 5))}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {master.primary_markets.map((market) => (
            <Badge key={market}>{market}</Badge>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Stat
            label="Win Rate"
            value={stats?.win_rate ? `${stats.win_rate.toFixed(1)}%` : "—"}
          />
          <Stat
            label="Return"
            value={stats?.total_return ? `+${stats.total_return.toFixed(0)}%` : "—"}
            variant={stats?.total_return && stats.total_return > 0 ? "success" : "default"}
          />
          <Stat
            label="Bets"
            value={stats?.total_bets || 0}
          />
          <Stat
            label="Streak"
            value={streakDisplay}
            variant={streakVariant}
          />
        </div>
      </Card>
    </Link>
  );
}
