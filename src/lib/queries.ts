// src/lib/queries.ts
import { supabase } from "./supabase";
import type { MasterWithStats, Bet, SortOption, User, Follow } from "./types";

export async function getMasters(options?: {
  sort?: SortOption;
  category?: string;
  limit?: number;
}): Promise<MasterWithStats[]> {
  const { sort = "rank", category, limit = 50 } = options || {};

  let query = supabase
    .from("masters")
    .select(`
      *,
      master_stats (*)
    `)
    .limit(limit);

  // Filter by category if provided
  if (category && category !== "all") {
    query = query.contains("primary_markets", [category]);
  }

  // Apply sorting based on master_stats
  const ascending = sort === "rank";
  query = query.order(sort, {
    ascending,
    referencedTable: "master_stats"
  });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching masters:", error);
    return [];
  }

  return data as MasterWithStats[];
}

export async function getMasterByUsername(username: string): Promise<MasterWithStats | null> {
  const { data, error } = await supabase
    .from("masters")
    .select(`
      *,
      master_stats (*)
    `)
    .eq("username", username)
    .single();

  if (error) {
    console.error("Error fetching master:", error);
    return null;
  }

  return data as MasterWithStats;
}

export async function getMasterBets(masterId: string, options?: {
  status?: "OPEN" | "WON" | "LOST";
  limit?: number;
}): Promise<Bet[]> {
  const { status, limit = 20 } = options || {};

  let query = supabase
    .from("bets")
    .select("*")
    .eq("master_id", masterId)
    .order("entry_date", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching bets:", error);
    return [];
  }

  return data as Bet[];
}

// User queries
export async function getUserFollows(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("master_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching follows:", error);
    return [];
  }

  return data.map((f) => f.master_id);
}

export async function isFollowingMaster(userId: string, masterId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("follows")
    .select("master_id")
    .eq("user_id", userId)
    .eq("master_id", masterId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

export async function getFollowedMasters(userId: string): Promise<MasterWithStats[]> {
  const { data, error } = await supabase
    .from("follows")
    .select(`
      master:masters (
        *,
        master_stats (*)
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching followed masters:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((f: any) => f.master) as MasterWithStats[];
}

export async function getMasterFollowerCount(masterId: string): Promise<number> {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("master_id", masterId);

  if (error) {
    console.error("Error fetching follower count:", error);
    return 0;
  }

  return count || 0;
}
