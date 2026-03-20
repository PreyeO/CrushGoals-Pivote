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

    for (const org of (orgs as any[])) {
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

      // Standardize member data (matching OrgMember interface)
      const members: OrgMember[] = (membersRes.data as any[]).map(m => ({
        ...m,
        name: m.profiles?.full_name || "Unknown",
        avatarUrl: m.profiles?.avatar_url
      }));

      // 3. Generate Summary
      const summary = reportService.getWeeklySummary(org.id, goalsRes.data as OrgGoal[], members);

      // 4. Deliver
      let slackSent = false;
      let telegramSent = false;

      if (hasSlack && org.slack_settings?.notify_on_summary !== false) {
        try {
          await slackService.sendWeeklySummary(org.slack_webhook_url, summary);
          slackSent = true;
        } catch (e) {
            console.error(`[Cron] Slack send failed for ${org.name}:`, e);
        }
      }

      if (hasTelegram && org.telegram_settings?.notify_on_summary !== false) {
        try {
          await telegramService.sendWeeklySummary(org.telegram_chat_id, summary);
          telegramSent = true;
        } catch (e) {
            console.error(`[Cron] Telegram send failed for ${org.name}:`, e);
        }
      }

      // 5. Update timestamp
      if (slackSent || telegramSent) {
        await supabase
          .from("organizations")
          .update({ last_weekly_summary_at: new Date().toISOString() })
          .eq("id", org.id);
        
        results.push({ org: org.name, slack: slackSent, telegram: telegramSent });
      }
    }

    return NextResponse.json({ 
        success: true, 
        processed: results.length,
        details: results
    });

  } catch (error: any) {
    console.error("[Cron] Weekly Report Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
