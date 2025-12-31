import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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

        // Send email via Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: "CrushGoals <onboarding@resend.dev>",
            to: [profile.email],
            subject: `⏰ Your CrushGoals trial expires in ${hoursLeft} hour${hoursLeft === 1 ? '' : 's'}!`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
                <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%); border-radius: 24px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-size: 28px; margin: 0 0 10px 0;">⏰ Don't Lose Your Streak!</h1>
                    <p style="color: #888; margin: 0;">Your trial ends soon</p>
                  </div>
                  
                  <p style="font-size: 16px; line-height: 1.6;">Hey ${userName},</p>
                  
                  <p style="font-size: 16px; line-height: 1.6;">Your CrushGoals trial expires in <strong style="color: #f97316;">${hoursLeft} hour${hoursLeft === 1 ? '' : 's'}</strong>!</p>
                  
                  <p style="font-size: 16px; line-height: 1.6;">Don't let your progress slip away. Subscribe now to keep crushing your goals:</p>
                  
                  <div style="background: linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0.1) 100%); border-radius: 16px; padding: 20px; margin: 24px 0; border: 1px solid rgba(249,115,22,0.3);">
                    <div style="text-align: center;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #888;">Starting at</p>
                      <p style="margin: 0; font-size: 28px; font-weight: bold;">₦1,500<span style="font-size: 14px; font-weight: normal;">/month</span></p>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="https://crushgoals.app/settings?section=subscription" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">Subscribe Now</a>
                  </div>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">
                    Keep crushing your goals! 🎯
                  </p>
                </div>
              </body>
              </html>
            `,
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
