import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

// Allowed email types to prevent abuse
const ALLOWED_EMAIL_TYPES = [
  "welcome",
  "otp",
  "password_reset",
  "friend_invite",
  "shared_goal_invite",
  "streak_reminder",
] as const;

type EmailType = (typeof ALLOWED_EMAIL_TYPES)[number];

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  email_type: EmailType;
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory rate limiting store (per user ID for authenticated, per IP for unauthenticated OTP)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_MAX_REQUESTS = 10; // Max emails per window for authenticated users
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_OTP_REQUESTS = 3; // Max OTP emails per IP (unauthenticated)

function getClientIP(req: Request): string {
  // Try various headers that might contain the real IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback - use a hash of user-agent + accept-language as pseudo-identifier
  const userAgent = req.headers.get("user-agent") || "unknown";
  const acceptLang = req.headers.get("accept-language") || "unknown";
  return `fallback-${userAgent.slice(0, 20)}-${acceptLang.slice(0, 10)}`;
}

function checkRateLimit(key: string, maxRequests: number = RATE_LIMIT_MAX_REQUESTS): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [k, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  if (!record || now > record.resetTime) {
    // First request or window expired - reset
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: maxRequests - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: record.resetTime - now 
    };
  }
  
  // Increment counter
  record.count++;
  rateLimitStore.set(key, record);
  return { 
    allowed: true, 
    remaining: maxRequests - record.count, 
    resetIn: record.resetTime - now 
  };
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Parse request body first to check email_type
    const { to, subject, html, text, from, email_type }: EmailRequest = await req.json();

    // Validate email_type is provided and allowed
    if (!email_type || !ALLOWED_EMAIL_TYPES.includes(email_type)) {
      console.error("Invalid or missing email_type:", email_type);
      return new Response(
        JSON.stringify({ error: "Invalid email type. Must be one of: " + ALLOWED_EMAIL_TYPES.join(", ") }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const clientIP = getClientIP(req);
    let userId: string | null = null;

    // For OTP emails during signup, allow unauthenticated requests with stricter rate limiting
    if (email_type === "otp") {
      // Stricter rate limit for unauthenticated OTP requests
      const rateLimit = checkRateLimit(clientIP, RATE_LIMIT_MAX_OTP_REQUESTS);
      
      if (!rateLimit.allowed) {
        console.warn(`OTP rate limit exceeded for IP: ${clientIP}`);
        return new Response(
          JSON.stringify({ 
            error: "Too many OTP requests. Please try again later.",
            retryAfter: Math.ceil(rateLimit.resetIn / 1000)
          }),
          { 
            status: 429, 
            headers: { 
              "Content-Type": "application/json",
              "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
              ...corsHeaders 
            } 
          }
        );
      }
      console.log(`OTP email request from IP: ${clientIP}`);
    } else {
      // All other email types require authentication
      if (!authHeader) {
        console.warn("Authentication required for non-OTP email");
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        });

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.warn("Auth failed:", authError?.message);
          return new Response(
            JSON.stringify({ error: "Invalid authentication" }),
            { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        userId = user.id;
        console.log(`Authenticated user: ${userId}`);

        // Rate limit by user ID for authenticated requests
        const rateLimit = checkRateLimit(`user:${userId}`, RATE_LIMIT_MAX_REQUESTS);
        
        if (!rateLimit.allowed) {
          console.warn(`Rate limit exceeded for user: ${userId}`);
          return new Response(
            JSON.stringify({ 
              error: "Too many email requests. Please try again later.",
              retryAfter: Math.ceil(rateLimit.resetIn / 1000)
            }),
            { 
              status: 429, 
              headers: { 
                "Content-Type": "application/json",
                "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
                ...corsHeaders 
              } 
            }
          );
        }
      } catch (e) {
        console.error("Auth check failed:", e);
        return new Response(
          JSON.stringify({ error: "Authentication failed" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Input validation
    if (!to || !emailRegex.test(to)) {
      console.error("Invalid email address:", to);
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subject || subject.length === 0 || subject.length > 200) {
      console.error("Invalid subject length:", subject?.length);
      return new Response(
        JSON.stringify({ error: "Subject must be between 1 and 200 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!html || html.length === 0 || html.length > 100000) {
      console.error("Invalid html content length:", html?.length);
      return new Response(
        JSON.stringify({ error: "HTML content must be between 1 and 100,000 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Use the verified hello.crushgoals.app domain for sending
        from: from || "CrushGoals <no-reply@hello.crushgoals.app>",
        to: [to],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      return new Response(
        JSON.stringify({ error: data.message || "Failed to send email" }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
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