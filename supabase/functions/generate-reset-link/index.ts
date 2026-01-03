import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  
  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP;
  
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;
  
  return "unknown";
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  return true;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    // Validate email
    if (!email || !emailRegex.test(email)) {
      console.error("Invalid email:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limit by IP
    const clientIP = getClientIP(req);
    if (!checkRateLimit(`reset:${clientIP}`)) {
      console.warn(`Rate limit exceeded for password reset from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service role to generate password reset link
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user exists first (don't reveal this to the client for security)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    const userExists = userData?.users?.some(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!userExists) {
      // Don't reveal that user doesn't exist - just log and return success
      console.log(`Password reset requested for non-existent email: ${email}`);
      return new Response(
        JSON.stringify({ success: true }), // Don't include resetLink
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate password reset link
    // NOTE: We intentionally generate the recovery token, but we DO NOT send the raw verify/action link to users.
    // Many email clients/security scanners prefetch links which can consume one-time tokens.
    // Instead, we send an app link that contains token_hash + email and only verifies when the user submits a new password.

    const allAllowedOrigins = [...ALLOWED_ORIGINS, ...DEV_ORIGINS];
    const siteUrl = origin && allAllowedOrigins.includes(origin)
      ? origin
      : "https://www.crushgoals.app";

    const redirectTo = `${siteUrl}/reset-password`;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectTo,
      },
    });

    if (error) {
      console.error("Error generating reset link:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate reset link" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const actionLink = data.properties?.action_link;
    const tokenHash = (data.properties as any)?.hashed_token || (data.properties as any)?.hashedToken;

    // Prefer our safer app link when token hash is available; fallback to actionLink otherwise.
    // Note: for verifyOtp({ type: 'recovery', token_hash }), ONLY token_hash + type are allowed.
    const resetLink = tokenHash
      ? `${siteUrl}/reset-password?type=recovery&token_hash=${encodeURIComponent(tokenHash)}`
      : actionLink;

    if (!resetLink) {
      console.error("No reset link in response:", data);
      return new Response(
        JSON.stringify({ error: "Failed to generate reset link" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Password reset link generated for: ${email}`);

    return new Response(
      JSON.stringify({ success: true, resetLink, actionLink }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in generate-reset-link:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
