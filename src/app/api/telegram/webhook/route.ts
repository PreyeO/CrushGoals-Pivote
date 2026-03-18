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

    // Handle Callback Queries (Button Clicks)
    if (body.callback_query) {
      const callback = body.callback_query;
      const chatId = callback.message.chat.id.toString();
      const data = callback.data;

      if (data.startsWith("crush:")) {
        const goalId = data.split(":")[1];
        await goalService.updateStatus(goalId, "completed");
        await telegramService.sendMessage(chatId, "🎯 *WIN CONFIRMED\\!* \n\nGreat job on crushing that goal\\!");
      } else if (data.startsWith("block:")) {
        const goalId = data.split(":")[1];
        await goalService.updateStatus(goalId, "blocked");
        await telegramService.sendMessage(chatId, "🚨 *BLOCKED ALERT\\!* \n\nGoal marked as blocked. Someone will jump in to help.");
      }

      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    // 1. Handle /connect [code]
    if (text.startsWith("/connect")) {
      const code = text.split(" ")[1]?.toUpperCase();
      if (!code) {
        await telegramService.sendMessage(chatId, "❔ *Which Organization?* \n\nType `/connect [code]` using the code found in your CrushGoals Integration settings.");
        return NextResponse.json({ ok: true });
      }

      const { data: org, error } = await supabaseAdmin
        .from("organizations")
        .select("*")
        .eq("connect_code", code)
        .single();

      if (error || !org) {
        await telegramService.sendMessage(chatId, "❌ *Code Not Found* \n\nPlease double check the code in your CrushGoals Integrations page.");
      } else {
        await supabaseAdmin
          .from("organizations")
          .update({ telegram_chat_id: chatId })
          .eq("id", org.id);
        
        await telegramService.sendWelcome(chatId);
      }
      return NextResponse.json({ ok: true });
    }

    // 2. Fetch Organization for other commands
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("*")
      .eq("telegram_chat_id", chatId)
      .single();

    if (!org) {
      // If not connected, ignored or prompt to connect
      if (text.startsWith("/")) {
        await telegramService.sendMessage(chatId, "⚠️ *Group Not Connected* \n\nType `/connect [code]` to link this group to your CrushGoals organization.");
      }
      return NextResponse.json({ ok: true });
    }

    // 3. Handle Other Commands
    if (text === "/goals") {
      const goals = await goalService.getGoals(org.id);
      const activeGoals = goals.filter((g: any) => g.status !== "completed");
      
      if (activeGoals.length === 0) {
        await telegramService.sendMessage(chatId, "🙌 *No active goals\\!* \n\nYou're all caught up. Crushing it\\!");
      } else {
        let msg = "🎯 *Active Goals:*\n\n";
        activeGoals.forEach((g: any) => {
          msg += `• *${g.title}* (${g.status})\n`;
        });
        await telegramService.sendMessage(chatId, msg);
      }
    } else if (text === "/leaderboard") {
      const goals = await goalService.getGoals(org.id);
      const completedGoals = goals.filter((g: any) => g.status === "completed");
      
      // Basic count by assigned_to
      const board: Record<string, number> = {};
      completedGoals.forEach((g: any) => {
        if (g.assigned_to) board[g.assigned_to] = (board[g.assigned_to] || 0) + 1;
      });

      const sorted = Object.entries(board).sort((a, b) => b[1] - a[1]);
      
      if (sorted.length === 0) {
        await telegramService.sendMessage(chatId, "🏆 *Leaderboard* \n\nNo goals crushed yet\\. Who will be first? 🏁");
      } else {
        let msg = "🏆 *Crush Leaderboard:* \n\n";
        sorted.forEach(([userId, count], index) => {
          msg += `${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'} *User* — ${count} crushed\n`;
        });
        await telegramService.sendMessage(chatId, msg);
      }
    } else if (text === "/help") {
      const msg = `📖 *CrushGoals Commands:* \n\n/goals — List all active goals \n/leaderboard — See who's crushing it \n/help — Show this menu \n\n_Tip: You can respond to nudges using the inline buttons!_`;
      await telegramService.sendMessage(chatId, msg);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
