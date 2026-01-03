import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminLoginRequest {
  email: string;
  otp?: string;
  action: "request_otp" | "verify_otp";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, action }: AdminLoginRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!action || !["request_otp", "verify_otp"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Valid action is required (request_otp or verify_otp)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user by email
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (profileError || !profileData) {
      console.error("Profile lookup error:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", profileData.user_id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("Role check error:", roleError);
      return new Response(
        JSON.stringify({ error: "Access denied. Admin role required." }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check rate limit for admin login attempts
    const { data: remainingAttempts, error: rateLimitError } = await supabaseAdmin.rpc(
      "check_admin_login_rate_limit",
      { check_email: email.toLowerCase() }
    );

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    }

    if (remainingAttempts !== null && remainingAttempts <= 0) {
      return new Response(
        JSON.stringify({ error: "Too many login attempts. Please try again in 30 minutes." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Handle OTP request
    if (action === "request_otp") {
      // Generate OTP
      const { data: otpCode, error: otpError } = await supabaseAdmin.rpc("generate_email_otp", {
        p_user_id: profileData.user_id,
        p_email: email.toLowerCase(),
      });

      if (otpError) {
        console.error("OTP generation error:", otpError);
        return new Response(
          JSON.stringify({ error: otpError.message || "Failed to generate OTP" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Send OTP via email using Resend
      try {
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (RESEND_API_KEY) {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "CrushGoals <noreply@crushgoals.app>",
              to: [email.toLowerCase()],
              subject: "Your Admin Login Code",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #6366f1;">Admin Login Verification</h2>
                  <p>Your one-time verification code is:</p>
                  <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otpCode}</span>
                  </div>
                  <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
                  <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                </div>
              `,
            }),
          });

          if (!emailResponse.ok) {
            console.error("Email send error:", await emailResponse.text());
          }
        }
      } catch (emailError) {
        console.error("Failed to send OTP email:", emailError);
        // Continue anyway - OTP is generated, user might have other means to get it
      }

      console.log("OTP requested for admin:", email);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Verification code sent to your email",
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Handle OTP verification
    if (action === "verify_otp") {
      if (!otp) {
        return new Response(
          JSON.stringify({ error: "OTP is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Verify OTP
      const { data: isValid, error: verifyError } = await supabaseAdmin.rpc("verify_email_otp", {
        p_otp: otp,
        p_user_id: profileData.user_id,
      });

      if (verifyError || !isValid) {
        console.error("OTP verification error:", verifyError);
        
        // Record failed attempt
        await supabaseAdmin.rpc("record_login_attempt", {
          attempt_email: email.toLowerCase(),
          attempt_success: false,
        });

        return new Response(
          JSON.stringify({ error: "Invalid or expired verification code" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Generate a magic link token for the user (this creates a session)
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: email.toLowerCase(),
        options: {
          redirectTo: "https://crushgoals.app/admin",
        },
      });

      if (linkError || !linkData) {
        console.error("Link generation error:", linkError);
        return new Response(
          JSON.stringify({ error: "Failed to generate login session" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Record successful login
      await supabaseAdmin.rpc("record_login_attempt", {
        attempt_email: email.toLowerCase(),
        attempt_success: true,
      });

      // Extract the token from the generated link
      const url = new URL(linkData.properties.action_link);
      const token = url.searchParams.get("token");

      console.log("Admin login successful for:", email);

      return new Response(
        JSON.stringify({
          success: true,
          token,
          email: email.toLowerCase(),
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Admin OTP login error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);