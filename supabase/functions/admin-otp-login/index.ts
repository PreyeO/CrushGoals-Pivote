import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Hardcoded admin credentials - ONLY this email and passphrase can access admin
const ADMIN_EMAIL = "omusukup@yahoo.com";
const ADMIN_PASSPHRASE = "SperAdmin@123#";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://crushgoals.app',
  'https://www.crushgoals.app',
  'https://crushgoals.lovable.app',
  'https://jnoqlbqilwohfyfudnss.supabase.co',
];

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

interface AdminLoginRequest {
  email: string;
  passphrase: string;
  action: "verify_admin";
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, passphrase, action }: AdminLoginRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!passphrase) {
      return new Response(
        JSON.stringify({ error: "Passphrase is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action !== "verify_admin") {
      return new Response(
        JSON.stringify({ error: "Valid action is required (verify_admin)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if this is THE admin email (case-insensitive)
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      console.log("Access denied for non-admin email:", email);
      return new Response(
        JSON.stringify({ error: "Access denied. This login is for the designated administrator only." }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the passphrase
    if (passphrase !== ADMIN_PASSPHRASE) {
      console.log("Invalid passphrase attempt for admin:", email);
      return new Response(
        JSON.stringify({ error: "Invalid passphrase. Access denied." }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if user exists and has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role, user_id")
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Role lookup error:", roleError);
      return new Response(
        JSON.stringify({ error: "Failed to verify admin status" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the email matches the admin user
    if (roleData) {
      const { data: profileData } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("user_id", roleData.user_id)
        .maybeSingle();
      
      if (!profileData || profileData.email.toLowerCase() !== email.toLowerCase()) {
        return new Response(
          JSON.stringify({ error: "Admin credentials mismatch" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Record successful verification
    await supabaseAdmin.rpc("record_login_attempt", {
      attempt_email: email.toLowerCase(),
      attempt_success: true,
    });

    console.log("Admin verification successful for:", email);

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Admin login error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);