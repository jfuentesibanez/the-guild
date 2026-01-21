import Link from "next/link";

export function Header() {
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

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-muted)" }}
          >
            Masters
          </Link>
          <span
            className="text-sm cursor-not-allowed"
            style={{ color: "var(--color-secondary)" }}
            title="Coming soon"
          >
            Feed
          </span>
          <span
            className="text-sm cursor-not-allowed"
            style={{ color: "var(--color-secondary)" }}
            title="Coming soon"
          >
            Portfolio
          </span>
        </nav>
      </div>
    </header>
  );
}
