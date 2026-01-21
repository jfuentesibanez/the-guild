import { getXPProgress } from "@/lib/levels";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface LevelBadgeProps {
  xp: number;
  showProgress?: boolean;
  size?: "sm" | "lg";
}

export function LevelBadge({ xp, showProgress = false, size = "sm" }: LevelBadgeProps) {
  const { currentLevel, nextLevel, progressPercent, xpToNext } = getXPProgress(xp);

  if (size === "lg") {
    return (
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-2"
          style={{
            backgroundColor: "var(--color-secondary)",
            border: "3px solid var(--color-accent)",
          }}
        >
          <span
            className="text-2xl"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
          >
            {currentLevel.level}
          </span>
        </div>
        <p
          className="text-sm mb-1"
          style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
        >
          {currentLevel.title}
        </p>
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          {xp} XP
        </p>
        {showProgress && nextLevel && (
          <div className="mt-3 max-w-32 mx-auto">
            <ProgressBar value={progressPercent} size="sm" />
            <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
              {xpToNext} XP to {nextLevel.title}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="px-2 py-1 rounded text-xs"
        style={{
          backgroundColor: "var(--color-secondary)",
          color: "var(--color-accent)",
          fontFamily: "var(--font-pixel)",
        }}
      >
        Lv.{currentLevel.level}
      </span>
      <span className="text-xs" style={{ color: "var(--color-muted)" }}>
        {currentLevel.title}
      </span>
    </div>
  );
}
