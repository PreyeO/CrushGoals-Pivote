import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { CRUSHGOALS_FROM, renderBrandedEmail } from "../_shared/email-template.ts";

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
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
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
    const appBaseUrl = origin && (ALLOWED_ORIGINS.includes(origin) || DEV_ORIGINS.includes(origin))
      ? origin
      : 'https://crushgoals.app';

    const bodyHtml = `
      <p style="margin:0 0 16px;color:#d1d5db;font-size:16px;line-height:1.6;">Hi ${firstName},</p>

      <div style="background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);border-radius:16px;padding:18px;text-align:center;margin:0 0 18px;">
        <p style="margin:0 0 6px;color:rgba(255,255,255,0.9);font-size:12px;text-transform:uppercase;letter-spacing:1px;">🎁 YOUR FREE TRIAL</p>
        <p style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">7 DAYS</p>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Unlimited access to all premium features</p>
      </div>

      <p style="margin:0 0 18px;color:#a1a1aa;font-size:15px;line-height:1.6;">
        You’ve unlocked <strong style=\"color:#ffffff;\">7 days of unlimited access</strong> to everything CrushGoals has to offer.
        No credit card required — just pure goal-crushing power.
      </p>

      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);border-radius:12px;padding:16px;margin:0 0 18px;">
        <p style="margin:0 0 10px;color:#ffffff;font-weight:700;">What you can do next:</p>
        <ul style="margin:0;padding-left:18px;color:#d1d5db;font-size:14px;line-height:1.9;">
          <li>✅ Set unlimited goals across all categories</li>
          <li>🔥 Build streaks and earn XP rewards</li>
          <li>📊 Track progress with detailed analytics</li>
          <li>🏆 Unlock achievements and climb the leaderboard</li>
          <li>👥 Share goals with friends for accountability</li>
        </ul>
      </div>

      <div style="text-align:center;margin:22px 0 0;">
        <a href="${appBaseUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:700;font-size:16px;">Start Crushing Goals →</a>
      </div>
    `;

    const emailHtml = renderBrandedEmail({
      title: `Welcome to CrushGoals, ${firstName}!`,
      preheader: 'Your 7-day free trial starts now',
      bodyHtml,
    });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: CRUSHGOALS_FROM,
        to: [email],
        subject: "🎯 Welcome to CrushGoals - Your 7-Day Free Trial Starts Now!",
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