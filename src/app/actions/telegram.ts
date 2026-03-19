"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function generateTelegramLinkCode(userId: string) {
  try {
    // Generate a 6-character random code (uppercase letters and numbers)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ telegram_link_code: code })
      .eq("id", userId);

    if (error) throw error;
    
    // Revalidate paths that use profile data
    revalidatePath(`/org/[orgId]/account`, "page");
    
    return { success: true, code };
  } catch (error) {
    console.error("Error generating Telegram link code:", error);
    return { success: false, error: "Failed to generate link code" };
  }
}

export async function unlinkTelegram(userId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ telegram_user_id: null, telegram_link_code: null })
      .eq("id", userId);

    if (error) throw error;
    
    revalidatePath(`/org/[orgId]/account`, "page");
    
    return { success: true };
  } catch (error) {
    console.error("Error unlinking Telegram:", error);
    return { success: false, error: "Failed to unlink Telegram" };
  }
}
