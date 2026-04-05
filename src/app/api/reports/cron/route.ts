import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { reportService } from "@/lib/services/reportService";
import { slackService } from "@/lib/services/slack";
import { telegramService } from "@/lib/services/telegram";
import { Organization, OrgGoal, OrgMember } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Basic security to prevent random triggers
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  
  try {
    // 1. Fetch all organizations with active integrations
    const { data: orgs, error: orgsError } = await supabase
      .from("organizations")
      .select("*");

    if (orgsError) throw orgsError;

    const results = [];

    for (const org of (orgs as Organization[])) {
      const hasSlack = !!org.slack_webhook_url;
      const hasTelegram = !!org.telegram_chat_id;

      if (!hasSlack && !hasTelegram) continue;

      // Check if we already sent one this week (to be safe)
      const lastSent = org.last_weekly_summary_at ? new Date(org.last_weekly_summary_at) : null;
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

      if (lastSent && lastSent > sixDaysAgo && !searchParams.get("force")) {
        console.log(`[Cron] Skipping ${org.name}, already sent on ${lastSent}`);
        continue;
      }

      // 2. Fetch data for this specific org
      const [goalsRes, membersRes] = await Promise.all([
        supabase.from("goals").select("*").eq("org_id", org.id),
        supabase.from("org_members").select("*, profiles(full_name, avatar_url)").eq("org_id", org.id)
      ]);

      if (goalsRes.error || membersRes.error) {
        console.error(`[Cron] Error fetching data for ${org.name}:`, goalsRes.error || membersRes.error);
        continue;
      }

      // Standardize member data
      const members: OrgMember[] = (membersRes.data as any[]).map(m => ({
        ...m,
        name: m.profiles?.full_name || "Unknown",
        avatarUrl: m.profiles?.avatar_url
      }));

      const now = new Date();
      const hour = now.getHours();
      const orgGoals = (goalsRes.data as any[]).map(g => ({
        ...g,
        updatedAt: g.updated_at,
        progress: g.current_value // Simplified for CRON context
      }));

      // 3. Weekly Summary (Monday morning)
      const isMonday = now.getDay() === 1;
      const totalMinutes = hour * 60 + now.getMinutes();

      // 3. Weekly Summary (Monday morning @ 7:30 AM)
      const shouldSendSummary = isMonday && totalMinutes >= 450 && totalMinutes < 600 && (
        !org.last_weekly_summary_at || 
        new Date(org.last_weekly_summary_at).getTime() < now.getTime() - 24 * 60 * 60 * 1000 * 6
      );

      if (shouldSendSummary && org.settings?.notify_on_summary !== false) {
          const summary = reportService.getWeeklySummary(org.id, orgGoals as any[], members);
          if (hasSlack) await slackService.sendWeeklySummary(org.slack_webhook_url, summary).catch(e => console.error("Slack summary fail", e));
          if (hasTelegram) await telegramService.sendWeeklySummary(org.telegram_chat_id, summary).catch(e => console.error("Telegram summary fail", e));
          
          await supabase.from("organizations").update({ last_weekly_summary_at: now.toISOString() }).eq("id", org.id);
          results.push({ org: org.name, type: 'weekly_summary' });
      }

      // 4. Stale Goal Nudge (Daily check @ 9:00 AM)
      const shouldCheckStale = totalMinutes >= 540 && totalMinutes < 660 && (
        !org.last_stale_nudge_at || 
        new Date(org.last_stale_nudge_at).getTime() < now.getTime() - 24 * 60 * 60 * 1000
      );

      if (shouldCheckStale) {
        const slackThreshold = org.slack_settings?.stale_threshold_days || 7;
        const telegramThreshold = org.telegram_settings?.stale_threshold_days || 7;
        
        const activeGoals = orgGoals.filter(g => g.status !== 'completed');
        
        const getStaleFor = (threshold: number) => activeGoals.filter(g => {
            const lastUpdate = new Date(g.updatedAt);
            const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceUpdate >= threshold;
        }).map(g => {
            const ownerId = g.assigned_to?.[0]; // Assume first assignee for nudge
            const owner = members.find(m => m.id === ownerId || (m as any).user_id === ownerId || (m as any).userId === ownerId);
            return {
                title: g.title,
                memberName: owner?.name || "Team",
                days: Math.floor((now.getTime() - new Date(g.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
            };
        });

        if (hasSlack && org.slack_settings?.notify_on_stale !== false) {
           const staleSlack = getStaleFor(slackThreshold);
           if (staleSlack.length > 0) await slackService.sendStaleNudge(org.slack_webhook_url, staleSlack).catch(e => console.error("Slack stale fail", e));
        }
        
        if (hasTelegram && org.telegram_settings?.notify_on_stale !== false) {
           const staleTelegram = getStaleFor(telegramThreshold);
           if (staleTelegram.length > 0) await telegramService.sendStaleNudge(org.telegram_chat_id, staleTelegram).catch(e => console.error("Telegram stale fail", e));
        }

        await supabase.from("organizations").update({ last_stale_nudge_at: now.toISOString() }).eq("id", org.id);
        results.push({ org: org.name, type: 'stale_nudge' });
      }

      // 5. Daily Gingering (Morning motivation @ 8:00 AM)
      const shouldGinger = totalMinutes >= 480 && totalMinutes < 540 && (
        !org.last_gingering_at || 
        new Date(org.last_gingering_at).getTime() < now.getTime() - 24 * 60 * 60 * 1000
      );

      if (shouldGinger) {
          if (hasSlack) await slackService.sendDailyGingering(org.slack_webhook_url).catch(e => console.error("Slack ginger fail", e));
          if (hasTelegram) await telegramService.sendDailyGingering(org.telegram_chat_id).catch(e => console.error("Telegram ginger fail", e));
          
          await supabase.from("organizations").update({ last_gingering_at: now.toISOString() }).eq("id", org.id);
          results.push({ org: org.name, type: 'daily_gingering' });
      }
    }

    return NextResponse.json({ 
        success: true, 
        processed: results.length,
        details: results
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Weekly Report Error";
    console.error("[Cron] Weekly Report Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
