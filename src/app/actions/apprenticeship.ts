// src/app/actions/apprenticeship.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import type { SizingMode } from "@/lib/types";

export async function createApprenticeship(
  masterId: string,
  options: {
    sizingMode: SizingMode;
    fixedAmount?: number;
    autoCopy: boolean;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("apprenticeships").insert({
    user_id: user.id,
    master_id: masterId,
    sizing_mode: options.sizingMode,
    fixed_amount: options.fixedAmount || 100,
    auto_copy: options.autoCopy,
    active: true,
  });

  if (error) {
    if (error.code === '23505') {
      return { error: "You already have an apprenticeship with this master" };
    }
    return { error: error.message };
  }

  revalidatePath("/portfolio");
  return { success: true };
}

export async function updateApprenticeship(
  masterId: string,
  options: {
    sizingMode?: SizingMode;
    fixedAmount?: number;
    autoCopy?: boolean;
    active?: boolean;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updateData: Record<string, unknown> = {};
  if (options.sizingMode !== undefined) updateData.sizing_mode = options.sizingMode;
  if (options.fixedAmount !== undefined) updateData.fixed_amount = options.fixedAmount;
  if (options.autoCopy !== undefined) updateData.auto_copy = options.autoCopy;
  if (options.active !== undefined) updateData.active = options.active;

  const { error } = await supabase
    .from("apprenticeships")
    .update(updateData)
    .eq("user_id", user.id)
    .eq("master_id", masterId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/portfolio");
  return { success: true };
}

export async function endApprenticeship(masterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("apprenticeships")
    .delete()
    .eq("user_id", user.id)
    .eq("master_id", masterId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/portfolio");
  return { success: true };
}
