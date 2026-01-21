import Link from "next/link";

export default function MasterNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1
        className="text-xl mb-4"
        style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
      >
        MASTER NOT FOUND
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
        This predictor doesn&apos;t exist or has left the guild.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-text)",
        }}
      >
        Back to Masters
      </Link>
    </main>
  );
}
