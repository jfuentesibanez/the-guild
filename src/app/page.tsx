import { getMasters } from "@/lib/queries";
import { MasterCard } from "@/components/masters";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function LeaderboardPage() {
  const masters = await getMasters({ sort: "rank", limit: 20 });

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-xl md:text-3xl mb-2"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
          >
            THE MASTERS
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            Top predictors ranked by performance. Learn from the best.
          </p>
        </div>

        {/* Masters List */}
        <div className="space-y-4">
          {masters.length === 0 ? (
            <p style={{ color: "var(--color-muted)" }} className="text-center py-8">
              No masters found. Check your Supabase connection.
            </p>
          ) : (
            masters.map((master) => (
              <MasterCard key={master.id} master={master} />
            ))
          )}
        </div>

        {/* Footer tagline */}
        <p
          className="text-center text-xs mt-12"
          style={{ color: "var(--color-muted)" }}
        >
          &quot;Track records don&apos;t lie. Gurus do.&quot;
        </p>
      </div>
    </main>
  );
}
