interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "accent";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const colors = {
    default: "var(--color-muted)",
    success: "var(--color-success)",
    danger: "var(--color-danger)",
    accent: "var(--color-accent)",
  };

  return (
    <span
      className="px-2 py-1 rounded text-xs font-medium"
      style={{
        backgroundColor: `${colors[variant]}20`,
        color: colors[variant],
        border: `1px solid ${colors[variant]}40`,
      }}
    >
      {children}
    </span>
  );
}
