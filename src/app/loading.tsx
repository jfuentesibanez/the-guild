export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: "var(--color-primary)", animationDelay: "0.2s" }}
        />
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: "var(--color-primary)", animationDelay: "0.4s" }}
        />
      </div>
      <p
        className="text-sm"
        style={{ fontFamily: "var(--font-pixel)", color: "var(--color-muted)" }}
      >
        Loading...
      </p>
    </main>
  );
}
