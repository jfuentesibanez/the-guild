"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SortOption, MarketCategory } from "@/lib/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rank", label: "Rank" },
  { value: "win_rate", label: "Win Rate" },
  { value: "total_return", label: "Total Return" },
  { value: "current_streak", label: "Hot Streak" },
];

const CATEGORY_OPTIONS: { value: MarketCategory | "all"; label: string }[] = [
  { value: "all", label: "All Markets" },
  { value: "politics", label: "Politics" },
  { value: "crypto", label: "Crypto" },
  { value: "sports", label: "Sports" },
  { value: "science", label: "Science" },
  { value: "culture", label: "Culture" },
];

export function LeaderboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sort") as SortOption) || "rank";
  const currentCategory = searchParams.get("category") || "all";

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "rank" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/?${params.toString()}`);
  };

  const selectStyle = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-secondary)",
    color: "var(--color-text)",
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        value={currentSort}
        onChange={(e) => updateParams("sort", e.target.value)}
        className="px-3 py-2 rounded text-sm cursor-pointer"
        style={selectStyle}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </select>

      <select
        value={currentCategory}
        onChange={(e) => updateParams("category", e.target.value)}
        className="px-3 py-2 rounded text-sm cursor-pointer"
        style={selectStyle}
      >
        {CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
