// src/components/layout/Header.tsx
import Link from "next/link";
import { getUser } from "@/lib/supabase-server";
import { logout } from "@/app/login/actions";

export async function Header() {
  const user = await getUser();

  return (
    <header
      className="sticky top-0 z-50 px-4 py-3"
      style={{
        backgroundColor: "var(--color-bg)",
        borderBottom: "1px solid var(--color-secondary)",
      }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span
            className="text-lg"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
          >
            ♠
          </span>
          <span
            className="text-sm hidden sm:inline"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-text)" }}
          >
            THE GUILD
          </span>
        </Link>

        <nav className="flex items-center gap-2 md:gap-4">
          <Link
            href="/"
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-muted)" }}
          >
            Masters
          </Link>
          <Link
            href="/feed"
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-muted)" }}
          >
            Feed
          </Link>

          {user ? (
            <>
              <Link
                href="/portfolio"
                className="text-sm hover:opacity-80 transition-opacity"
                style={{ color: "var(--color-muted)" }}
              >
                Portfolio
              </Link>
              <Link
                href="/journey"
                className="text-sm hover:opacity-80 transition-opacity hidden sm:inline"
                style={{ color: "var(--color-muted)" }}
              >
                Journey
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: "var(--color-muted)" }}
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm px-3 py-1 rounded transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
