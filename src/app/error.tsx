"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: "var(--color-danger)" }}
      >
        <span className="text-2xl">!</span>
      </div>
      <h1
        className="text-xl mb-4"
        style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
      >
        SOMETHING WENT WRONG
      </h1>
      <p className="text-sm mb-8 text-center max-w-md" style={{ color: "var(--color-muted)" }}>
        An unexpected error occurred. Please try again.
      </p>
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
    </main>
  );
}
