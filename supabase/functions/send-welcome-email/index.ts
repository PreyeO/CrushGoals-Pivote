import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  'https://crushgoals.app',
  'https://www.crushgoals.app',
  'https://crushgoals.lovable.app',
  'https://jnoqlbqilwohfyfudnss.supabase.co',
];

// For local development, also allow localhost origins
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allAllowedOrigins = [...ALLOWED_ORIGINS, ...DEV_ORIGINS];
  const isAllowed = origin && allAllowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

interface WelcomeEmailRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-welcome-email function invoked");

  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, name }: WelcomeEmailRequest = await req.json();
    
    console.log(`Sending welcome email to ${email} for user ${name}`);

    const firstName = name.split(' ')[0] || name;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CrushGoals</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 600px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Welcome to CrushGoals, ${firstName}!
              </h1>
            </td>
          </tr>
          
          <!-- Trial Badge -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 16px; padding: 24px; text-align: center;">
                <p style="margin: 0 0 8px; color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  🎁 YOUR FREE TRIAL
                </p>
                <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                  48 HOURS
                </p>
                <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                  Unlimited access to all premium features
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0 0 20px; color: #d1d5db; font-size: 16px; line-height: 1.6;">
                You've just unlocked <strong style="color: #ffffff;">48 hours of unlimited access</strong> to everything CrushGoals has to offer. No credit card required - just pure goal-crushing power!
              </p>
              
              <!-- Features List -->
              <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 16px; color: #ffffff; font-weight: 600; font-size: 16px;">
                  Here's what you can do:
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                      ✅ Set unlimited goals across all categories
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                      🔥 Build streaks and earn XP rewards
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                      📊 Track your progress with detailed analytics
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                      🏆 Unlock achievements and climb the leaderboard
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                      👥 Share goals with friends for accountability
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://crushgoals.lovable.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                  Start Crushing Goals →
                </a>
              </div>
              
              <!-- Urgency Note -->
              <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 16px; text-align: center;">
                <p style="margin: 0; color: #fbbf24; font-size: 14px;">
                  ⏰ <strong>Pro tip:</strong> Users who set their first goal within 24 hours are 3x more likely to build lasting habits!
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px;">
                Questions? Reply to this email - we're here to help!
              </p>
              <p style="margin: 0; color: #4b5563; font-size: 12px;">
                © ${new Date().getFullYear()} CrushGoals. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CrushGoals <onboarding@resend.dev>",
        to: [email],
        subject: "🎯 Welcome to CrushGoals - Your 48-Hour Free Trial Starts Now!",
        html: emailHtml,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Welcome email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);