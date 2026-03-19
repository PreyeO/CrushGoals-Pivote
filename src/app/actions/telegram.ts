"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function generateTelegramLinkCode(userId: string) {
  console.log(`[Telegram Action] Generating link code for user: ${userId}`);
  
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[Telegram Action] Missing Supabase environment variables");
      return { success: false, error: "Server configuration error: Missing Supabase keys" };
    }

    // Generate a 6-character random code (uppercase letters and numbers)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    console.log(`[Telegram Action] Updating profile with code: ${code}`);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ telegram_link_code: code })
      .eq("id", userId);

    if (error) {
      console.error("[Telegram Action] Supabase update error:", error);
      throw error;
    }
    
    console.log("[Telegram Action] Revalidating paths...");
    // Use layout revalidation as a fallback if page revalidation is finicky
    revalidatePath("/", "layout");
    
    return { success: true, code };
  } catch (error: any) {
    console.error("[Telegram Action] Final catch error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to generate link code. Ensure database migrations are applied." 
    };
  }
}

export async function unlinkTelegram(userId: string) {
  console.log(`[Telegram Action] Unlinking Telegram for user: ${userId}`);
  
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[Telegram Action] Missing Supabase environment variables");
      return { success: false, error: "Server configuration error: Missing Supabase keys" };
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ telegram_user_id: null, telegram_link_code: null })
      .eq("id", userId);

    if (error) {
      console.error("[Telegram Action] Supabase update error:", error);
      throw error;
    }
    
    console.log("[Telegram Action] Revalidating (layout)...");
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("[Telegram Action] Final catch error:", error);
    return { 
      success: false, 
      error: error.message || "Failed to unlink Telegram. Ensure database migrations are applied." 
    };
  }
}
