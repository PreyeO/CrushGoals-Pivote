import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  'https://crushgoals.app',
  'https://www.crushgoals.app',
  'https://crushgoals.lovable.app',
  'https://jnoqlbqilwohfyfudnss.supabase.co',
];

// For local development and Lovable preview domains
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

// Check if origin is a Lovable preview domain
function isLovablePreviewOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.hostname.endsWith('.lovableproject.com') || 
           url.hostname.endsWith('.lovable.app') ||
           url.hostname.endsWith('.webcontainer.io');
  } catch {
    return false;
  }
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allAllowedOrigins = [...ALLOWED_ORIGINS, ...DEV_ORIGINS];
  const isAllowed = origin && (allAllowedOrigins.includes(origin) || isLovablePreviewOrigin(origin));
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface InitializePaymentRequest {
  email: string;
  amount: number; // Amount in kobo (NGN smallest unit)
  plan: 'basic_monthly' | 'basic_annual' | 'premium_monthly' | 'premium_annual';
  userId: string;
  callbackUrl?: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Webhook handler (no auth required, uses Paystack signature)
    if (action === 'webhook') {
      return handleWebhook(req, corsHeaders);
    }

    // All other actions require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'initialize') {
      return handleInitialize(req, user.id, user.email!, corsHeaders);
    }

    if (action === 'verify') {
      return handleVerify(req, user.id, corsHeaders);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Paystack payment error:', error);
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Allowed callback paths - whitelist to prevent open redirect attacks
const ALLOWED_CALLBACK_PATHS = ['/settings', '/dashboard', '/subscription'];

// Production domain - hardcoded to prevent manipulation
const PRODUCTION_DOMAIN = 'https://crushgoals.app';

// Get callback domain - allow preview domains for testing
function getCallbackDomain(origin: string | null): string {
  if (!origin) return PRODUCTION_DOMAIN;
  
  // Allow Lovable preview domains for testing
  if (isLovablePreviewOrigin(origin)) {
    return origin;
  }
  
  // Check if in allowed origins
  const allAllowedOrigins = [...ALLOWED_ORIGINS, ...DEV_ORIGINS];
  if (allAllowedOrigins.includes(origin)) {
    return origin;
  }
  
  return PRODUCTION_DOMAIN;
}

async function handleInitialize(req: Request, userId: string, userEmail: string, corsHeaders: Record<string, string>) {
  const body: InitializePaymentRequest = await req.json();
  const { amount, plan, callbackUrl } = body;

  if (!amount || !plan) {
    return new Response(
      JSON.stringify({ error: 'Amount and plan are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get the origin for dynamic callback URL
  const requestOrigin = req.headers.get('origin');
  const callbackDomain = getCallbackDomain(requestOrigin);

  console.log(`Initializing Paystack payment for user ${userId}, plan: ${plan}, amount: ${amount} kobo, callback domain: ${callbackDomain}`);

  const reference = `cg_${userId.slice(0, 8)}_${Date.now()}`;

  // Sanitize callback URL to prevent open redirect attacks
  // Only allow whitelisted paths, default to /settings
  let sanitizedPath = '/settings?payment=success';
  if (callbackUrl) {
    try {
      // Extract just the pathname if a full URL is provided
      const urlPath = callbackUrl.startsWith('/') ? callbackUrl : new URL(callbackUrl).pathname;
      const basePath = urlPath.split('?')[0]; // Get path without query params
      
      if (ALLOWED_CALLBACK_PATHS.includes(basePath)) {
        sanitizedPath = `${basePath}?payment=success`;
      } else {
        console.warn(`Blocked callback URL attempt: ${callbackUrl}`);
      }
    } catch (e) {
      console.warn(`Invalid callback URL format: ${callbackUrl}`);
    }
  }

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userEmail,
      amount, // Amount in kobo
      reference,
      callback_url: `${callbackDomain}${sanitizedPath}`,
      metadata: {
        user_id: userId,
        plan,
        custom_fields: [
          {
            display_name: "Plan",
            variable_name: "plan",
            value: plan
          }
        ]
      }
    }),
  });

  const data = await response.json();
  console.log('Paystack initialize response:', data);

  if (!data.status) {
    return new Response(
      JSON.stringify({ error: data.message || 'Failed to initialize payment' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleVerify(req: Request, userId: string, corsHeaders: Record<string, string>) {
  const { reference } = await req.json();

  if (!reference) {
    return new Response(
      JSON.stringify({ error: 'Reference is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Verifying Paystack payment: ${reference}`);

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  });

  const data = await response.json();
  console.log('Paystack verify response:', data);

  if (!data.status || data.data.status !== 'success') {
    return new Response(
      JSON.stringify({ error: 'Payment verification failed', details: data }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Update subscription in database
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  const plan = data.data.metadata?.plan || 'premium_monthly';
  const isAnnual = plan.includes('annual');
  
  const periodEnd = new Date();
  if (isAnnual) {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  // Map to DB-allowed plan values: 'monthly' or 'annual'
  const dbPlanName = isAnnual ? 'annual' : 'monthly';

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      plan: dbPlanName,
      status: 'active',
      payment_provider: 'paystack',
      payment_id: data.data.reference,
      amount_paid: data.data.amount / 100, // Convert from kobo to naira
      currency: 'NGN',
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    return new Response(
      JSON.stringify({ error: 'Failed to update subscription' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Subscription updated for user ${userId} to plan: ${dbPlanName}`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      plan: dbPlanName,
      amount: data.data.amount / 100,
      currency: 'NGN'
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleWebhook(req: Request, corsHeaders: Record<string, string>) {
  const signature = req.headers.get('x-paystack-signature');
  const body = await req.text();

  // Verify webhook signature
  const crypto = await import("https://deno.land/std@0.168.0/crypto/mod.ts");
  const encoder = new TextEncoder();
  const key = encoder.encode(PAYSTACK_SECRET_KEY);
  const data = encoder.encode(body);
  
  const hmac = await crypto.crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.crypto.subtle.sign("HMAC", hmac, data);
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (signature !== expectedSignature) {
    console.error('Invalid webhook signature');
    return new Response(
      JSON.stringify({ error: 'Invalid signature' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const event = JSON.parse(body);
  console.log('Paystack webhook event:', event.event);

  if (event.event === 'charge.success') {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const userId = event.data.metadata?.user_id;
    const plan = event.data.metadata?.plan || 'premium_monthly';
    
    if (userId) {
      const isAnnual = plan.includes('annual');
      const periodEnd = new Date();
      if (isAnnual) {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Map to DB-allowed plan values: 'monthly' or 'annual'
      const dbPlanName = isAnnual ? 'annual' : 'monthly';

      await supabase
        .from('subscriptions')
        .update({
          plan: dbPlanName,
          status: 'active',
          payment_provider: 'paystack',
          payment_id: event.data.reference,
          amount_paid: event.data.amount / 100,
          currency: 'NGN',
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          trial_ends_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      console.log(`Webhook: Subscription updated for user ${userId}`);
    }
  }

  return new Response(
    JSON.stringify({ received: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}