// src/lib/queries.ts
import { supabase } from "./supabase";
import type { MasterWithStats, Bet, SortOption, User, Follow, Apprenticeship, ApprenticeshipWithMaster, Position, PositionWithMaster } from "./types";

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

// Apprenticeship queries
export async function getUserApprenticeships(userId: string): Promise<ApprenticeshipWithMaster[]> {
  const { data, error } = await supabase
    .from("apprenticeships")
    .select(`
      *,
      master:masters (*)
    `)
    .eq("user_id", userId)
    .eq("active", true);

  if (error) {
    console.error("Error fetching apprenticeships:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((a: any) => ({ ...a, master: a.master })) as ApprenticeshipWithMaster[];
}

export async function getApprenticeship(userId: string, masterId: string): Promise<Apprenticeship | null> {
  const { data, error } = await supabase
    .from("apprenticeships")
    .select("*")
    .eq("user_id", userId)
    .eq("master_id", masterId)
    .single();

  if (error) {
    return null;
  }

  return data as Apprenticeship;
}

// Position queries
export async function getUserPositions(userId: string, options?: {
  status?: 'OPEN' | 'WON' | 'LOST';
  limit?: number;
}): Promise<PositionWithMaster[]> {
  const { status, limit = 50 } = options || {};

  let query = supabase
    .from("positions")
    .select(`
      *,
      master:masters (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching positions:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((p: any) => ({ ...p, master: p.master })) as PositionWithMaster[];
}

export async function getUserStats(userId: string): Promise<{
  totalPositions: number;
  openPositions: number;
  wins: number;
  losses: number;
  totalReturn: number;
}> {
  const { data, error } = await supabase
    .from("positions")
    .select("status, return_amount")
    .eq("user_id", userId);

  if (error || !data) {
    return { totalPositions: 0, openPositions: 0, wins: 0, losses: 0, totalReturn: 0 };
  }

  const stats = data.reduce((acc, pos) => {
    acc.totalPositions++;
    if (pos.status === 'OPEN') acc.openPositions++;
    if (pos.status === 'WON') acc.wins++;
    if (pos.status === 'LOST') acc.losses++;
    if (pos.return_amount) acc.totalReturn += Number(pos.return_amount);
    return acc;
  }, { totalPositions: 0, openPositions: 0, wins: 0, losses: 0, totalReturn: 0 });

  return stats;
}
