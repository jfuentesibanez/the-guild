interface StatProps {
  label: string;
  value: string | number;
  suffix?: string;
  variant?: "default" | "success" | "danger";
}

export function Stat({ label, value, suffix, variant = "default" }: StatProps) {
  const colors = {
    default: "var(--color-text)",
    success: "var(--color-success)",
    danger: "var(--color-danger)",
  };

  return (
    <div className="flex flex-col">
      <span className="text-xs" style={{ color: "var(--color-muted)" }}>
        {label}
      </span>
      <span className="text-lg font-semibold" style={{ color: colors[variant] }}>
        {value}
        {suffix && <span className="text-sm ml-1">{suffix}</span>}
      </span>
    </div>
  );
}
