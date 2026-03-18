import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { telegramService } from "@/lib/services/telegram";
import { goalService } from "@/lib/services/goals";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Telegram Webhook] Body:", JSON.stringify(body));

    // Handle Callback Queries (Button Clicks)
    if (body.callback_query) {
      const callback = body.callback_query;
      const chatId = callback.message.chat.id.toString();
      const data = callback.data;

      if (data.startsWith("crush:")) {
        const goalId = data.split(":")[1];
        await goalService.updateStatus(goalId, "completed");
        await telegramService.sendMessage(chatId, "🎯 WIN CONFIRMED! \n\nGreat job on crushing that goal!");
      } else if (data.startsWith("block:")) {
        const goalId = data.split(":")[1];
        await goalService.updateStatus(goalId, "blocked");
        await telegramService.sendMessage(chatId, "🚨 BLOCKED ALERT! \n\nGoal marked as blocked. Someone will jump in to help.");
      }

      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id.toString();
    const chatTitle = message.chat.title || message.chat.username || "Unknown Group";
    const text = message.text.trim();
    const normalizedText = text.toLowerCase();

    // 1. Handle /connect [code] - Extremely flexible
    if (normalizedText.includes("connect") || normalizedText.includes("conncet")) {
      const words = text.split(/\s+/);
      const codeWord = words.find((w: string) => !w.startsWith("/") && w.length > 2);
      const code = codeWord ? codeWord.replace(/[\[\]]/g, "").trim().toUpperCase() : "";
      
      if (!code) {
        await telegramService.sendMessage(chatId, "❔ Which Organization?\n\nType /connect [code] using the code from your settings.");
        return NextResponse.json({ ok: true });
      }

      console.log("[Telegram Webhook] /connect Code:", code);

      const { data: org, error } = await supabaseAdmin
        .from("organizations")
        .select("*")
        .eq("connect_code", code)
        .maybeSingle();

      if (error || !org) {
        const { data: allOrgs } = await supabaseAdmin.from("organizations").select("connect_code");
        const allCodes = allOrgs?.map((o: any) => o.connect_code).join(", ") || "NONE";
        
        // Use plain text (no markdown escaping issues)
        await telegramService.sendMessage(chatId, 
          `❌ Code Not Found\n\nBot received: "${code}"\n\nCodes in DB: ${allCodes}`
        );
      } else {
        await supabaseAdmin
          .from("organizations")
          .update({ 
            telegram_chat_id: chatId,
            telegram_chat_title: chatTitle
          })
          .eq("id", org.id);
        
        await telegramService.sendMessage(chatId, `✅ Success! Connected to organization: ${org.name}`);
      }
      return NextResponse.json({ ok: true });
    }

    // 2. Fetch Organization for other commands
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("*")
      .eq("telegram_chat_id", chatId)
      .maybeSingle();

    if (!org) {
      if (text.startsWith("/")) {
        await telegramService.sendMessage(chatId, `⚠️ Group Not Connected\n\nReceived: "${text}"\n\nType /connect [code] first!`);
      }
      return NextResponse.json({ ok: true });
    }

    // 3. Handle Other Commands
    if (normalizedText.startsWith("/goals")) {
      const goals = await goalService.getGoals(org.id);
      const activeGoals = goals.filter((g: any) => g.status !== "completed");
      
      if (activeGoals.length === 0) {
        await telegramService.sendMessage(chatId, "🙌 No active goals! You're all caught up.");
      } else {
        let msg = "🎯 Active Goals:\n\n";
        activeGoals.forEach((g: any) => {
          msg += `• ${g.title} (${g.status})\n`;
        });
        await telegramService.sendMessage(chatId, msg);
      }
    } else if (normalizedText.startsWith("/leaderboard")) {
      const goals = await goalService.getGoals(org.id);
      const completedGoals = goals.filter((g: any) => g.status === "completed");
      const board: Record<string, number> = {};
      completedGoals.forEach((g: any) => {
        if (g.assigned_to) board[g.assigned_to] = (board[g.assigned_to] || 0) + 1;
      });
      const sorted = Object.entries(board).sort((a, b) => b[1] - a[1]);
      
      if (sorted.length === 0) {
        await telegramService.sendMessage(chatId, "🏆 Leaderboard - No goals crushed yet.");
      } else {
        let msg = "🏆 Crush Leaderboard:\n\n";
        sorted.forEach(([userId, count], index) => {
          msg += `${index+1}. User — ${count} crushed\n`;
        });
        await telegramService.sendMessage(chatId, msg);
      }
    } else if (normalizedText.startsWith("/help")) {
      await telegramService.sendMessage(chatId, "📖 CrushGoals Commands:\n\n/goals — List goals\n/leaderboard — Rankings\n/help — Commands");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
