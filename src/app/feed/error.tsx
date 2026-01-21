"use client";

import Link from "next/link";

export default function RouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1
        className="text-xl mb-4"
        style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
      >
        COULDN&apos;T LOAD FEED
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
        There was a problem loading the activity feed.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-text)",
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
          style={{
            backgroundColor: "var(--color-secondary)",
            color: "var(--color-text)",
          }}
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
