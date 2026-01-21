interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <div
      className={`rounded-lg p-4 transition-all duration-200 ${hover ? "card-glow" : ""} ${className}`}
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-secondary)",
      }}
    >
      {children}
    </div>
  );
}
