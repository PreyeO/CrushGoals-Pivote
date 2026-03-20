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

    // 2. Handle /start, /connect, and /link
    if (normalizedText.startsWith("/link")) {
      const code = text.split(/\s+/)[1]?.toUpperCase();
      if (!code) {
        await telegramService.sendMessage(chatId, "🔗 To link your profile, type:\n\n/link [your_code]\n\nYou can find your link code in Account Settings.");
        return NextResponse.json({ ok: true });
      }

      const telegramUserId = message.from.id.toString();
      const { data: profile, error: linkError } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name")
        .eq("telegram_link_code", code)
        .maybeSingle();

      if (linkError || !profile) {
        await telegramService.sendMessage(chatId, `❌ Invalid or expired link code: "${code}". Please generate a new one in Account Settings.`);
      } else {
        await supabaseAdmin
          .from("profiles")
          .update({ 
            telegram_user_id: telegramUserId,
            telegram_link_code: null 
          })
          .eq("id", profile.id);
        
        await telegramService.sendMessage(chatId, `✅ Success! Linked to profile: *${profile.full_name}*\n\nYou can now use /mystatus, /done, and /blocked!`);
      }
      return NextResponse.json({ ok: true });
    }

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

    // 3. Command logic with Admin Access (RLS bypass)
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

    // Lookup linked user for personalized commands
    const telegramUserId = message.from.id.toString();
    const { data: linkedProfile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("telegram_user_id", telegramUserId)
      .maybeSingle();

    // 4. Handle Commands
    if (normalizedText.startsWith("/goals")) {
      const { data: goals } = await supabaseAdmin.from("goals").select("*").eq("org_id", org.id).neq("status", "completed");
      if (!goals || goals.length === 0) {
        await telegramService.sendMessage(chatId, "🙌 No active goals! You're all caught up.");
      } else {
        let msg = "🎯 *Active Goals:*\n\n";
        // Fetch all unique assignees to get their names
        const allAssigneeIds = Array.from(new Set(goals.flatMap(g => Array.isArray(g.assigned_to) ? g.assigned_to : [])));
        const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name").in("id", allAssigneeIds);
        const nameMap = Object.fromEntries(profiles?.map(p => [p.id, p.full_name]) || []);

        goals.forEach((g: any) => { 
            const statusEmoji = g.status === 'blocked' ? '🚨' : (g.status === 'in_progress' ? '🏗️' : '⚪');
            const assignees = Array.isArray(g.assigned_to) ? g.assigned_to : [];
            const names = assignees.map((id: string) => nameMap[id] || "Someone").join(", ");
            const assigneeText = names ? `\n   └ 👤 ${names}` : "";
            
            msg += `${statusEmoji} *${g.title}*${assigneeText}\n`; 
        });
        await telegramService.sendMessage(chatId, msg);
      }
    } else if (normalizedText.startsWith("/leaderboard")) {
      const { data: comp } = await supabaseAdmin.from("goals").select("assigned_to").eq("org_id", org.id).eq("status", "completed");
      const board: Record<string, number> = {};
      
      comp?.forEach((g: any) => { 
        const assignees = Array.isArray(g.assigned_to) ? g.assigned_to : [];
        assignees.forEach((uId: string) => {
            board[uId] = (board[uId] || 0) + 1;
        });
      });

      const sorted = Object.entries(board).sort((a,b) => b[1]-a[1]);
      
      if (sorted.length === 0) {
        await telegramService.sendMessage(chatId, "🏆 *Leaderboard* \n\nNo goals crushed yet. Who's going first? 🚀");
      } else {
        // Fetch profiles for names
        const userIds = sorted.map(s => s[0]);
        const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name").in("id", userIds);
        const nameMap = Object.fromEntries(profiles?.map(p => [p.id, p.full_name]) || []);

        let msg = "🏆 *Crush Leaderboard*\n\n";
        sorted.forEach(([u, c], i) => { 
            const name = nameMap[u] || `User ${u.substring(0,4)}`;
            const medal = i === 0 ? "🥇 " : (i === 1 ? "🥈 " : (i === 2 ? "🥉 " : "• "));
            msg += `${medal}${name} — *${c} crushed*\n`; 
        });
        await telegramService.sendMessage(chatId, msg);
      }
    } else if (normalizedText.startsWith("/mystatus")) {
      if (!linkedProfile) {
        await telegramService.sendMessage(chatId, "👤 *My Status*\n\nLink your profile in settings to see your summary! Type /link for instructions.");
        return NextResponse.json({ ok: true });
      }

      const { data: myGoals } = await supabaseAdmin.from("goals")
        .select("*")
        .eq("org_id", org.id)
        .contains("assigned_to", [linkedProfile.id])
        .neq("status", "completed");

      if (!myGoals || myGoals.length === 0) {
        await telegramService.sendMessage(chatId, `👤 *My Status: ${linkedProfile.full_name}*\n\nYou have no active goals in this org! Time to pick up something new? 🎯`);
      } else {
        const blocked = myGoals.filter(g => g.status === 'blocked').length;
        let msg = `👤 *My Status: ${linkedProfile.full_name}*\n\n`;
        msg += `🎯 Active: *${myGoals.length}*\n`;
        msg += `🚨 Blocked: *${blocked}*\n\n`;
        msg += `*Your Goals:*\n`;
        myGoals.forEach(g => {
            const statusEmoji = g.status === 'blocked' ? '🚨' : '🏗️';
            msg += `${statusEmoji} ${g.title}\n`;
        });
        await telegramService.sendMessage(chatId, msg);
      }
    } else if (normalizedText.startsWith("/done") || normalizedText.startsWith("/blocked")) {
      if (!linkedProfile) {
        await telegramService.sendMessage(chatId, "⚡ *Quick Update*\n\nLink your profile first to update goals directly! Type /link for help.");
        return NextResponse.json({ ok: true });
      }

      const isDone = normalizedText.startsWith("/done");
      const { data: myGoals } = await supabaseAdmin.from("goals")
        .select("*")
        .eq("org_id", org.id)
        .contains("assigned_to", [linkedProfile.id])
        .neq("status", "completed");

      if (!myGoals || myGoals.length === 0) {
        await telegramService.sendMessage(chatId, `🙌 You don't have any active goals to mark as ${isDone ? 'completed' : 'blocked'}.`);
      } else {
        const keyboard = myGoals.map(g => ([{
            text: `${isDone ? '🎯' : '🚨'} ${g.title}`,
            callback_data: `${isDone ? 'crush' : 'block'}:${g.id}`
        }]));

        await telegramService.sendMessage(chatId, `Select a goal to mark as *${isDone ? 'COMPLETED' : 'BLOCKED'}*:`, {
            inline_keyboard: keyboard
        });
      }
    } else if (normalizedText.startsWith("/help")) {
      await telegramService.sendMessage(chatId, "📖 *Command Guide*\n\n/goals - Show all team goals\n/leaderboard - Who's crushing it?\n/mystatus - Your active goals\n/done - Mark a goal as finished\n/blocked - Flag a blocker\n/link - Connect your account\n/help - Show this guide");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
