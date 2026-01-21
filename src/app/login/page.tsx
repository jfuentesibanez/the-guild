// src/app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { login, signup } from "./actions";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = isSignUp ? await signup(formData) : await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-secondary)",
    color: "var(--color-text)",
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-xl mb-2"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
          >
            {isSignUp ? "JOIN THE GUILD" : "ENTER THE GUILD"}
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            {isSignUp
              ? "Create your account and start learning"
              : "Welcome back, apprentice"}
          </p>
        </div>

        <Card>
          <form action={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs mb-1"
                  style={{ color: "var(--color-muted)" }}
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full px-3 py-2 rounded text-sm"
                  style={inputStyle}
                  placeholder="your_handle"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs mb-1"
                style={{ color: "var(--color-muted)" }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 rounded text-sm"
                style={inputStyle}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs mb-1"
                style={{ color: "var(--color-muted)" }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-2 rounded text-sm"
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs" style={{ color: "var(--color-danger)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
            >
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs hover:opacity-80 transition-opacity"
              style={{ color: "var(--color-muted)" }}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </Card>

        <p
          className="text-center text-xs mt-8"
          style={{ color: "var(--color-muted)" }}
        >
          <Link href="/" className="hover:opacity-80 transition-opacity">
            ← Back to Masters
          </Link>
        </p>
      </div>
    </main>
  );
}
