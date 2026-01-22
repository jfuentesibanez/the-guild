// scripts/scrape-polymarket.ts
// Scrapes recent trades from Polymarket for tracked masters

import { createClient } from "@supabase/supabase-js";

const POLYMARKET_API = "https://data-api.polymarket.com";

// Initialize Supabase with service role for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PolymarketTrade {
  proxyWallet: string;
  side: "BUY" | "SELL";
  asset: string;
  conditionId: string;
  size: number;
  price: number;
  timestamp: number;
  title: string;
  slug: string;
  outcome: string;
  outcomeIndex: number;
  transactionHash: string;
}

interface Master {
  id: string;
  username: string;
  display_name: string;
  polymarket_wallet: string | null;
}

async function fetchMastersWithWallets(): Promise<Master[]> {
  const { data, error } = await supabase
    .from("masters")
    .select("id, username, display_name, polymarket_wallet")
    .not("polymarket_wallet", "is", null);

  if (error) {
    console.error("Error fetching masters:", error);
    return [];
  }

  return data || [];
}

async function fetchTradesForWallet(wallet: string, limit = 50): Promise<PolymarketTrade[]> {
  try {
    const url = `${POLYMARKET_API}/trades?user=${wallet}&limit=${limit}`;
    console.log(`  Fetching: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`  API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error(`  Fetch error for wallet ${wallet}:`, error);
    return [];
  }
}

async function getExistingBetHashes(masterId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("bets")
    .select("market_url")
    .eq("master_id", masterId)
    .not("market_url", "is", null);

  const hashes = new Set<string>();
  data?.forEach((bet) => {
    if (bet.market_url) {
      // Extract transaction hash from market_url if stored there
      hashes.add(bet.market_url);
    }
  });
  return hashes;
}

function categorizeMarket(title: string): string {
  const lower = title.toLowerCase();

  if (lower.includes("election") || lower.includes("president") || lower.includes("congress") ||
      lower.includes("senate") || lower.includes("governor") || lower.includes("vote") ||
      lower.includes("trump") || lower.includes("biden") || lower.includes("democrat") ||
      lower.includes("republican")) {
    return "politics";
  }

  if (lower.includes("bitcoin") || lower.includes("ethereum") || lower.includes("crypto") ||
      lower.includes("btc") || lower.includes("eth") || lower.includes("token") ||
      lower.includes("defi") || lower.includes("nft")) {
    return "crypto";
  }

  if (lower.includes("nfl") || lower.includes("nba") || lower.includes("mlb") ||
      lower.includes("super bowl") || lower.includes("championship") || lower.includes("playoffs") ||
      lower.includes("world series") || lower.includes("mvp") || lower.includes("game")) {
    return "sports";
  }

  if (lower.includes("ai") || lower.includes("gpt") || lower.includes("openai") ||
      lower.includes("spacex") || lower.includes("fda") || lower.includes("climate") ||
      lower.includes("vaccine") || lower.includes("research")) {
    return "science";
  }

  if (lower.includes("oscar") || lower.includes("grammy") || lower.includes("emmy") ||
      lower.includes("taylor swift") || lower.includes("movie") || lower.includes("album") ||
      lower.includes("tiktok") || lower.includes("viral")) {
    return "culture";
  }

  return "social";
}

async function insertBet(masterId: string, trade: PolymarketTrade): Promise<boolean> {
  const bet = {
    master_id: masterId,
    market_question: trade.title,
    market_url: trade.transactionHash, // Store tx hash for deduplication
    market_category: categorizeMarket(trade.title),
    side: trade.side === "BUY" ? (trade.outcomeIndex === 0 ? "YES" : "NO") : (trade.outcomeIndex === 0 ? "NO" : "YES"),
    entry_odds: trade.price,
    entry_amount: trade.size * trade.price,
    entry_date: new Date(trade.timestamp * 1000).toISOString(),
    status: "OPEN",
    reasoning: null, // To be filled manually
  };

  const { error } = await supabase.from("bets").insert(bet);

  if (error) {
    if (error.code === "23505") {
      // Duplicate key - already exists
      return false;
    }
    console.error(`  Error inserting bet:`, error);
    return false;
  }

  return true;
}

async function scrapeMaster(master: Master): Promise<number> {
  console.log(`\nScraping ${master.display_name} (${master.polymarket_wallet})`);

  const trades = await fetchTradesForWallet(master.polymarket_wallet!, 30);
  console.log(`  Found ${trades.length} recent trades`);

  if (trades.length === 0) return 0;

  const existingHashes = await getExistingBetHashes(master.id);
  let inserted = 0;

  for (const trade of trades) {
    // Skip if we already have this trade
    if (existingHashes.has(trade.transactionHash)) {
      continue;
    }

    // Only insert BUY trades (opening positions)
    if (trade.side !== "BUY") {
      continue;
    }

    // Skip small trades (less than $100)
    const tradeValue = trade.size * trade.price;
    if (tradeValue < 100) {
      continue;
    }

    const success = await insertBet(master.id, trade);
    if (success) {
      console.log(`  + Added: "${trade.title}" ($${tradeValue.toFixed(0)})`);
      inserted++;
    }
  }

  return inserted;
}

async function main() {
  console.log("=".repeat(60));
  console.log("Polymarket Scraper for The Guild");
  console.log("=".repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);

  const masters = await fetchMastersWithWallets();
  console.log(`\nFound ${masters.length} masters with Polymarket wallets`);

  if (masters.length === 0) {
    console.log("\nNo masters have polymarket_wallet set.");
    console.log("Add wallet addresses to masters in Supabase to enable scraping.");
    console.log("\nExample wallet addresses for known traders:");
    console.log("- Theo (Fredi9999): 0x56687bf447db6ffa42ffe2204a05edaa20f55839");
    return;
  }

  let totalInserted = 0;
  for (const master of masters) {
    const inserted = await scrapeMaster(master);
    totalInserted += inserted;
  }

  console.log("\n" + "=".repeat(60));
  console.log(`Done! Inserted ${totalInserted} new bets.`);
  console.log("Bets without reasoning will show in feed but need manual curation.");
  console.log("=".repeat(60));
}

main().catch(console.error);
