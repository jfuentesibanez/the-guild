// src/components/ui/ProgressBar.tsx
interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({ value, showLabel = false, size = "md" }: ProgressBarProps) {
  const height = size === "sm" ? "h-2" : "h-3";
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`w-full ${height} rounded-full overflow-hidden`}
        style={{ backgroundColor: "var(--color-secondary)" }}
      >
        <div
          className={`${height} rounded-full transition-all duration-500 ease-out`}
          style={{
            width: `${clampedValue}%`,
            backgroundColor: "var(--color-accent)",
          }}
        />
      </div>
      {showLabel && (
        <p
          className="text-xs mt-1 text-right"
          style={{ color: "var(--color-muted)" }}
        >
          {clampedValue}%
        </p>
      )}
    </div>
  );
}
