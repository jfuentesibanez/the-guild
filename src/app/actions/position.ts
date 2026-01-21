// src/app/actions/position.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import type { Bet } from "@/lib/types";

export async function copyBet(bet: Bet, amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's current bankroll
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("virtual_bankroll")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "Could not fetch user profile" };
  }

  if (profile.virtual_bankroll < amount) {
    return { error: "Insufficient bankroll" };
  }

  // Create position
  const { error: positionError } = await supabase.from("positions").insert({
    user_id: user.id,
    bet_id: bet.id,
    master_id: bet.master_id,
    market_question: bet.market_question,
    side: bet.side,
    entry_odds: bet.entry_odds,
    entry_amount: amount,
    current_odds: bet.current_odds || bet.entry_odds,
    status: 'OPEN',
    source: 'COPY',
  });

  if (positionError) {
    return { error: positionError.message };
  }

  // Deduct from bankroll
  const { error: bankrollError } = await supabase
    .from("users")
    .update({ virtual_bankroll: profile.virtual_bankroll - amount })
    .eq("id", user.id);

  if (bankrollError) {
    return { error: "Failed to update bankroll" };
  }

  // Award XP for copying bet
  const { data: currentProfile } = await supabase
    .from("users")
    .select("xp")
    .eq("id", user.id)
    .single();

  if (currentProfile) {
    await supabase
      .from("users")
      .update({ xp: currentProfile.xp + 10 })
      .eq("id", user.id);
  }

  revalidatePath("/portfolio");
  return { success: true };
}

export async function closePosition(positionId: string, won: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get the position
  const { data: position, error: posError } = await supabase
    .from("positions")
    .select("*")
    .eq("id", positionId)
    .eq("user_id", user.id)
    .single();

  if (posError || !position) {
    return { error: "Position not found" };
  }

  if (position.status !== 'OPEN') {
    return { error: "Position already closed" };
  }

  // Calculate return
  let returnAmount = 0;
  if (won) {
    // Win: return entry_amount + profit based on odds
    // If you bet YES at 0.30 and win, you get 1/0.30 = 3.33x return
    const multiplier = 1 / position.entry_odds;
    returnAmount = position.entry_amount * multiplier;
  }
  // If lost, returnAmount stays 0

  // Update position
  const { error: updateError } = await supabase
    .from("positions")
    .update({
      status: won ? 'WON' : 'LOST',
      return_amount: returnAmount,
    })
    .eq("id", positionId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Update bankroll
  const { data: profile } = await supabase
    .from("users")
    .select("virtual_bankroll, xp")
    .eq("id", user.id)
    .single();

  if (profile) {
    const newBankroll = profile.virtual_bankroll + returnAmount;
    const xpGain = won ? 25 : 5;
    await supabase
      .from("users")
      .update({
        virtual_bankroll: newBankroll,
        xp: profile.xp + xpGain
      })
      .eq("id", user.id);
  }

  revalidatePath("/portfolio");
  return { success: true, returnAmount };
}
