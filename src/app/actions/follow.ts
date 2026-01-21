// src/app/actions/follow.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { getUserFollowCount } from "@/lib/queries";
import { XP_AWARDS } from "@/lib/levels";

export async function followMaster(masterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("follows").insert({
    user_id: user.id,
    master_id: masterId,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if this was the first follow (count should now be 1)
  const followCount = await getUserFollowCount(user.id);
  if (followCount === 1) {
    // Award first follow XP bonus
    const { data: profile } = await supabase
      .from("users")
      .select("xp")
      .eq("id", user.id)
      .single();

    if (profile) {
      await supabase
        .from("users")
        .update({ xp: profile.xp + XP_AWARDS.FIRST_FOLLOW })
        .eq("id", user.id);
    }
  }

  revalidatePath("/");
  revalidatePath("/portfolio");
  return { success: true };
}

export async function unfollowMaster(masterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("user_id", user.id)
    .eq("master_id", masterId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/portfolio");
  return { success: true };
}
