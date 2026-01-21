// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1
        className="text-4xl mb-2"
        style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
      >
        404
      </h1>
      <h2
        className="text-xl mb-4"
        style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
      >
        PAGE NOT FOUND
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-text)",
        }}
      >
        Back to Home
      </Link>
    </main>
  );
}
