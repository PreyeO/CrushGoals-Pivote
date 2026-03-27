import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { telegramService } from "@/lib/services/telegram";
import { RawGoal } from "@/types";

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
      const telegramUserId = callback.from.id.toString();
      const data = callback.data;

      // Identify the user
      const { data: profile } = await supabaseAdmin.from("profiles").select("full_name").eq("telegram_user_id", telegramUserId).maybeSingle();
      const userName = profile?.full_name || callback.from.first_name || "Someone";

      if (data.startsWith("crush:") || data.startsWith("block:")) {
        const goalId = data.split(":")[1];
        const isCrush = data.startsWith("crush:");
        
        // Fetch goal info first
        const { data: goal } = await supabaseAdmin.from("goals").select("title").eq("id", goalId).maybeSingle();
        const goalTitle = goal?.title || "a goal";
        
        await supabaseAdmin.from("goals").update({ 
          status: isCrush ? "completed" : "blocked", 
          updated_at: new Date().toISOString() 
        }).eq("id", goalId);
        
        if (isCrush) {
          await telegramService.sendMessage(chatId, `🎯 *WIN CONFIRMED!*\n\n${userName} just CRUSHED: *${goalTitle}*! 🔥`);
        } else {
          await telegramService.sendMessage(chatId, `🚨 *BLOCKED ALERT!*\n\n${userName} flagged *${goalTitle}* as blocked. Support needed! 🆘`);
        }
      }
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id.toString();
    const chatTitle = message.chat.title || message.chat.username || "Unknown Group";
    const text = message.text.trim();
    const normalizedText = text.toLowerCase();

    // 2. Handle /connect
    if (normalizedText.startsWith("/connect")) {
      const words = text.split(/\s+/);
      const code = words[1]?.replace(/[\[\]]/g, "").trim().toUpperCase();
      
      if (!code) {
        await telegramService.sendMessage(chatId, "👋 Welcome! Link your team to CrushGoals by typing:\n\n/connect [your_code]");
        return NextResponse.json({ ok: true });
      }

      const { data: org, error: findError } = await supabaseAdmin.from("organizations").select("*").eq("connect_code", code).maybeSingle();

      if (findError || !org) {
        await telegramService.sendMessage(chatId, `❌ Code not found: "${code}". Please double check your Integrations settings.`);
        return NextResponse.json({ ok: true });
      }

      // Ensure this group isn't linked to another org
      await supabaseAdmin
        .from("organizations")
        .update({ telegram_chat_id: null, telegram_chat_title: null })
        .eq("telegram_chat_id", chatId);

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

    // 3. Command logic for linked organizations
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
        const { data: orgMembersWithProfiles } = await supabaseAdmin
            .from("org_members")
            .select(`
                id,
                profiles:user_id (full_name)
            `)
            .eq("org_id", org.id);
        
        const memberNameMap = Object.fromEntries(
            (orgMembersWithProfiles as any[] | null)?.map((m: { id: string, profiles: { full_name: string | null } | null } | any) => [
                m.id, 
                m.profiles?.full_name || "Someone"
            ]) || []
        );

        let msg = "🎯 Active Goals:\n\n";
        goals.forEach((g: RawGoal, i: number) => { 
            const assignees = Array.isArray(g.assigned_to) ? g.assigned_to : [];
            const names = assignees.map((id: string) => memberNameMap[id] || "Someone").join(", ");
            const assigneeText = names ? ` — ${names}` : "";
            
            msg += `${i + 1}. ${g.title}${assigneeText}\n\n`; 
        });
        await telegramService.sendMessage(chatId, msg);
      }
    } else if (normalizedText.startsWith("/leaderboard")) {
      const { data: comp } = await supabaseAdmin.from("goals").select("assigned_to").eq("org_id", org.id).eq("status", "completed");
      const board: Record<string, number> = {};
      
      comp?.forEach((g: { assigned_to: string[] | null }) => { 
        const assignees = Array.isArray(g.assigned_to) ? g.assigned_to : [];
        assignees.forEach((mId: string) => {
            board[mId] = (board[mId] || 0) + 1;
        });
      });

      const sorted = Object.entries(board).sort((a,b) => b[1]-a[1]);
      
      if (sorted.length === 0) {
        await telegramService.sendMessage(chatId, "🏆 Leaderboard \n\nNo goals crushed yet. Who's going first? 🚀");
      } else {
        const { data: orgMembersWithProfiles } = await supabaseAdmin
            .from("org_members")
            .select(`
                id,
                profiles:user_id (full_name)
            `)
            .eq("org_id", org.id);
        
        const memberNameMap = Object.fromEntries(
            (orgMembersWithProfiles as any[] | null)?.map((m: { id: string, profiles: { full_name: string | null } | null } | any) => [
                m.id, 
                m.profiles?.full_name || "Someone"
            ]) || []
        );

        let msg = "🏆 Crush Leaderboard:\n\n";
        sorted.forEach(([mId, c], i) => { 
            const name = memberNameMap[mId] || `Member ${mId.substring(0,4)}`;
            const medal = i === 0 ? "🥇 " : (i === 1 ? "🥈 " : (i === 2 ? "🥉 " : "• "));
            msg += `${medal}${name} — ${c} crushed\n`; 
        });
        await telegramService.sendMessage(chatId, msg);
      }
    } else if (normalizedText.startsWith("/help")) {
      await telegramService.sendMessage(chatId, "📖 Command Guide:\n\n/goals - Show all team goals\n/leaderboard - Who's crushing it?\n/help - Show this guide");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
