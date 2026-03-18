import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { telegramService } from "@/lib/services/telegram";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Telegram Webhook] Request received");

    // 1. Handle Callback Queries (Button Clicks)
    if (body.callback_query) {
      const callback = body.callback_query;
      const chatId = callback.message.chat.id.toString();
      const data = callback.data;

      if (data.startsWith("crush:")) {
        const goalId = data.split(":")[1];
        await supabaseAdmin.from("goals").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", goalId);
        await telegramService.sendMessage(chatId, "🎯 WIN CONFIRMED! \n\nGreat job on crushing that goal!");
      } else if (data.startsWith("block:")) {
        const goalId = data.split(":")[1];
        await supabaseAdmin.from("goals").update({ status: "blocked", updated_at: new Date().toISOString() }).eq("id", goalId);
        await telegramService.sendMessage(chatId, "🚨 BLOCKED ALERT! \n\nGoal marked as blocked. Support will jump in.");
      }
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id.toString();
    const chatTitle = message.chat.title || message.chat.username || "Unknown Group";
    const text = message.text.trim();
    const normalizedText = text.toLowerCase();

    // 2. Handle /start and /connect
    if (normalizedText.startsWith("/start") || normalizedText.includes("connect") || normalizedText.includes("conncet")) {
      const words = text.split(/\s+/);
      const codeWord = words.find((w: string) => !w.startsWith("/") && w.length > 2);
      const code = codeWord ? codeWord.replace(/[\[\]]/g, "").trim().toUpperCase() : "";
      
      if (!code) {
        await telegramService.sendMessage(chatId, "👋 Welcome! Link your team to CrushGoals by typing:\n\n/connect [your_code]");
        return NextResponse.json({ ok: true });
      }

      const { data: org, error: findError } = await supabaseAdmin.from("organizations").select("*").eq("connect_code", code).maybeSingle();

      if (findError || !org) {
        await telegramService.sendMessage(chatId, `❌ Code not found: "${code}". Please double check your Integrations settings.`);
        return NextResponse.json({ ok: true });
      }

      // --- UNIQUE CONNECTION LOGIC ---
      // 1. First, "unplug" this Telegram group from any other organization it might be linked to
      await supabaseAdmin
        .from("organizations")
        .update({ telegram_chat_id: null, telegram_chat_title: null })
        .eq("telegram_chat_id", chatId);

      // 2. Now link it to the NEW organization
      const { error: updateError } = await supabaseAdmin
        .from("organizations")
        .update({ 
          telegram_chat_id: chatId,
          telegram_chat_title: chatTitle
        })
        .eq("id", org.id);

      if (updateError) {
        await telegramService.sendMessage(chatId, `❌ Connection error! Database update failed.`);
      } else {
        await telegramService.sendMessage(chatId, `✅ Success! Connected to: ${org.name}\n\nType /goals to see active tasks.`);
      }
      return NextResponse.json({ ok: true });
    }

    // 3. Command logic with Admin Access (RLS bypass)
    // We use .limit(1) and .maybeSingle() to survive even if there are duplicate rows in DB
    const { data: org, error: lookupError } = await supabaseAdmin
      .from("organizations")
      .select("*")
      .eq("telegram_chat_id", chatId)
      .limit(1)
      .maybeSingle();

    if (lookupError || !org) {
      if (text.startsWith("/")) {
        await telegramService.sendMessage(chatId, `⚠️ Group Not Linked. Please type /connect [code] to link this group.`);
      }
      return NextResponse.json({ ok: true });
    }

    // 4. Handle Commands
    if (normalizedText.startsWith("/goals")) {
      const { data: goals } = await supabaseAdmin.from("goals").select("*").eq("org_id", org.id).neq("status", "completed");
      if (!goals || goals.length === 0) {
        await telegramService.sendMessage(chatId, "🙌 No active goals! You're all caught up.");
      } else {
        let msg = "🎯 Active Goals:\n\n";
        goals.forEach((g: any) => { msg += `• ${g.title} (${g.status})\n`; });
        await telegramService.sendMessage(chatId, msg);
      }
    } else if (normalizedText.startsWith("/leaderboard")) {
      const { data: comp } = await supabaseAdmin.from("goals").select("assigned_to").eq("org_id", org.id).eq("status", "completed");
      const board: Record<string, number> = {};
      comp?.forEach((g: any) => { if (g.assigned_to) board[g.assigned_to] = (board[g.assigned_to] || 0) + 1; });
      const sorted = Object.entries(board).sort((a,b) => b[1]-a[1]);
      if (sorted.length === 0) {
        await telegramService.sendMessage(chatId, "🏆 Leaderboard - No goals crushed yet.");
      } else {
        let msg = "🏆 Crush Leaderboard:\n\n";
        sorted.forEach(([u, c], i) => { msg += `${i+1}. User ${u.substring(0,4)} — ${c} crushed\n`; });
        await telegramService.sendMessage(chatId, msg);
      }
    } else if (normalizedText.startsWith("/mystatus")) {
      await telegramService.sendMessage(chatId, "👤 My Status: Link your profile in settings to see your summary!");
    } else if (normalizedText.startsWith("/done") || normalizedText.startsWith("/blocked")) {
      await telegramService.sendMessage(chatId, "⚡ Tip: Use the buttons on goal nudges to mark them as completed or blocked!");
    } else if (normalizedText.startsWith("/help")) {
      await telegramService.sendMessage(chatId, "📖 Commands:\n/goals - Show goals\n/leaderboard - Rankings\n/help - All commands");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
