import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CRUSHGOALS_FROM, renderBrandedEmail } from "../_shared/email-template.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// This function is called by the Supabase scheduler - minimal CORS needed
// Only allow Supabase internal calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://jnoqlbqilwohfyfudnss.supabase.co",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Find trial users whose trial ends within 6 hours and haven't been reminded
    const sixHoursFromNow = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    console.log(`Checking for trials expiring between ${now} and ${sixHoursFromNow}`);

    const { data: expiringTrials, error: fetchError } = await supabase
      .from('subscriptions')
      .select(`
        user_id,
        trial_ends_at
      `)
      .eq('status', 'trial')
      .eq('trial_reminder_sent', false)
      .lte('trial_ends_at', sixHoursFromNow)
      .gte('trial_ends_at', now);

    if (fetchError) {
      console.error('Error fetching expiring trials:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiringTrials?.length || 0} expiring trials`);

    if (!expiringTrials || expiringTrials.length === 0) {
      return new Response(
        JSON.stringify({ message: "No trials expiring soon", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const trial of expiringTrials) {
      try {
        // Get user profile for email and name
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('user_id', trial.user_id)
          .single();

        if (profileError || !profile?.email) {
          console.error(`No profile for user ${trial.user_id}:`, profileError);
          errorCount++;
          continue;
        }

        const hoursLeft = Math.max(1, Math.ceil((new Date(trial.trial_ends_at!).getTime() - Date.now()) / (1000 * 60 * 60)));
        const userName = profile.full_name || 'Goal Crusher';

        console.log(`Sending trial reminder to ${profile.email}, ${hoursLeft} hours left`);

        const bodyHtml = `
          <p style="font-size:16px;line-height:1.6;margin:0 0 12px;color:#d1d5db;">Hey ${userName},</p>
          <p style="font-size:15px;line-height:1.6;margin:0 0 14px;color:#a1a1aa;">
            Your CrushGoals trial expires in <strong style=\"color:#fbbf24;\">${hoursLeft} hour${hoursLeft === 1 ? '' : 's'}</strong>.
          </p>
          <p style="font-size:15px;line-height:1.6;margin:0 0 18px;color:#a1a1aa;">
            Subscribe now to keep your progress, streaks, and premium features.
          </p>

          <div style="background:rgba(251,191,36,0.10);border:1px solid rgba(251,191,36,0.30);border-radius:12px;padding:14px;text-align:center;margin:0 0 18px;">
            <p style="margin:0;color:#fbbf24;font-size:13px;"><strong>Tip:</strong> Subscribing before expiry keeps everything uninterrupted.</p>
          </div>

          <div style="text-align:center;">
            <a href="https://crushgoals.app/settings?section=subscription" style="display:inline-block;background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:700;font-size:16px;">Subscribe Now</a>
          </div>
        `;

        const html = renderBrandedEmail({
          title: "Your trial ends soon",
          preheader: `Trial expires in ${hoursLeft} hour${hoursLeft === 1 ? '' : 's'}`,
          bodyHtml,
        });

        // Send email via Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: CRUSHGOALS_FROM,
            to: [profile.email],
            subject: `⏰ Your CrushGoals trial expires in ${hoursLeft} hour${hoursLeft === 1 ? '' : 's'}!`,
            html,
          }),
        });

        const emailResult = await emailResponse.json();

        console.log(`Email sent to ${profile.email}:`, emailResult);

        // Mark reminder as sent
        await supabase
          .from('subscriptions')
          .update({ trial_reminder_sent: true })
          .eq('user_id', trial.user_id);

        sentCount++;
      } catch (emailError) {
        console.error(`Error sending email to user ${trial.user_id}:`, emailError);
        errorCount++;
      }
    }

    console.log(`Trial reminders complete. Sent: ${sentCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        message: "Trial reminders processed",
        sent: sentCount,
        errors: errorCount
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-trial-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
