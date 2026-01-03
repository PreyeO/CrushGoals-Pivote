import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InitializePaymentRequest {
  amount: number;
  currency: string;
  plan: string;
  email: string;
  userId: string;
  callbackUrl?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  console.log(`[Flutterwave] Received action: ${action}`);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // =============== INITIALIZE PAYMENT ===============
    if (action === "initialize") {
      // Get auth user from token
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Authorization header required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error("[Flutterwave] Auth error:", authError);
        return new Response(
          JSON.stringify({ error: "Invalid auth token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      const { amount, currency, plan, callbackUrl } = body;

      console.log(`[Flutterwave] Initializing payment for user: ${user.id}, plan: ${plan}, amount: ${amount} ${currency}`);

      // Generate unique transaction reference
      const txRef = `cg_${user.id.slice(0, 8)}_${Date.now()}`;

      // Create Flutterwave payment link
      // Use test key if available, otherwise use live key
      const flutterwaveSecretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY_TEST") || Deno.env.get("FLUTTERWAVE_SECRET_KEY");
      if (!flutterwaveSecretKey) {
        console.error("[Flutterwave] Missing FLUTTERWAVE_SECRET_KEY");
        return new Response(
          JSON.stringify({ error: "Payment configuration error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const siteUrl = Deno.env.get("SITE_URL") || "https://crushgoals.lovable.app";
      const redirectUrl = `${siteUrl}${callbackUrl || "/settings?section=subscription"}&payment=success`;

      const paymentPayload = {
        tx_ref: txRef,
        amount: amount,
        currency: currency,
        redirect_url: redirectUrl,
        customer: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        },
        customizations: {
          title: "CrushGoals Subscription",
          description: `CrushGoals ${plan === "basic_annual" ? "Annual" : "Monthly"} Plan`,
          logo: "https://crushgoals.lovable.app/favicon.svg",
        },
        meta: {
          user_id: user.id,
          plan: plan,
          currency: currency,
        },
      };

      console.log("[Flutterwave] Creating payment with payload:", JSON.stringify(paymentPayload));

      const flwResponse = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flutterwaveSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      });

      const flwData = await flwResponse.json();
      console.log("[Flutterwave] Payment init response:", JSON.stringify(flwData));

      if (flwData.status === "success" && flwData.data?.link) {
        return new Response(
          JSON.stringify({
            success: true,
            authorization_url: flwData.data.link,
            tx_ref: txRef,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.error("[Flutterwave] Payment init failed:", flwData);
      return new Response(
        JSON.stringify({ error: flwData.message || "Failed to initialize payment" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =============== VERIFY PAYMENT ===============
    if (action === "verify") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Authorization header required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid auth token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      const { transaction_id, tx_ref } = body;

      console.log(`[Flutterwave] Verifying payment - tx_id: ${transaction_id}, tx_ref: ${tx_ref}`);

      const flutterwaveSecretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY_TEST") || Deno.env.get("FLUTTERWAVE_SECRET_KEY");
      if (!flutterwaveSecretKey) {
        return new Response(
          JSON.stringify({ error: "Payment configuration error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify with Flutterwave using transaction ID
      const verifyUrl = transaction_id 
        ? `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`
        : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`;

      const verifyResponse = await fetch(verifyUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${flutterwaveSecretKey}`,
          "Content-Type": "application/json",
        },
      });

      const verifyData = await verifyResponse.json();
      console.log("[Flutterwave] Verify response:", JSON.stringify(verifyData));

      if (verifyData.status === "success" && verifyData.data?.status === "successful") {
        const paymentData = verifyData.data;
        const plan = paymentData.meta?.plan || "basic_monthly";
        const isAnnual = plan.includes("annual");

        // Calculate subscription period
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + (isAnnual ? 12 : 1));

        // Update subscription
        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: user.id,
            status: "active",
            plan: plan,
            payment_provider: "flutterwave",
            payment_id: String(paymentData.id),
            amount_paid: paymentData.amount,
            currency: paymentData.currency,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            trial_ends_at: null, // Clear trial
            updated_at: now.toISOString(),
          }, { onConflict: "user_id" });

        if (subError) {
          console.error("[Flutterwave] Subscription update error:", subError);
        }

        // Record in payment history
        const { error: historyError } = await supabase
          .from("payment_history")
          .insert({
            user_id: user.id,
            amount: paymentData.amount,
            currency: paymentData.currency,
            plan: plan,
            payment_provider: "flutterwave",
            payment_reference: paymentData.tx_ref,
            status: "success",
          });

        if (historyError) {
          console.error("[Flutterwave] Payment history error:", historyError);
        }

        console.log(`[Flutterwave] Payment verified and subscription activated for user: ${user.id}`);

        return new Response(
          JSON.stringify({
            success: true,
            plan: plan,
            amount: paymentData.amount,
            currency: paymentData.currency,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.error("[Flutterwave] Verification failed:", verifyData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: verifyData.message || "Payment verification failed" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =============== WEBHOOK ===============
    if (action === "webhook") {
      const secretHash = Deno.env.get("FLUTTERWAVE_SECRET_HASH_TEST") || Deno.env.get("FLUTTERWAVE_SECRET_HASH");
      const signature = req.headers.get("verif-hash");

      // Verify webhook signature
      if (secretHash && signature !== secretHash) {
        console.error("[Flutterwave] Webhook signature mismatch");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const payload = await req.json();
      console.log("[Flutterwave] Webhook received:", JSON.stringify(payload));

      // Handle charge.completed event
      if (payload.event === "charge.completed" && payload.data?.status === "successful") {
        const paymentData = payload.data;
        const userId = paymentData.meta?.user_id;
        const plan = paymentData.meta?.plan || "basic_monthly";

        if (!userId) {
          console.error("[Flutterwave] Webhook missing user_id in meta");
          return new Response(
            JSON.stringify({ error: "Missing user_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const isAnnual = plan.includes("annual");
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + (isAnnual ? 12 : 1));

        // Update subscription
        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            status: "active",
            plan: plan,
            payment_provider: "flutterwave",
            payment_id: String(paymentData.id),
            amount_paid: paymentData.amount,
            currency: paymentData.currency,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            trial_ends_at: null,
            updated_at: now.toISOString(),
          }, { onConflict: "user_id" });

        if (subError) {
          console.error("[Flutterwave] Webhook subscription error:", subError);
        }

        // Record payment
        const { error: historyError } = await supabase
          .from("payment_history")
          .insert({
            user_id: userId,
            amount: paymentData.amount,
            currency: paymentData.currency,
            plan: plan,
            payment_provider: "flutterwave",
            payment_reference: paymentData.tx_ref,
            status: "success",
          });

        if (historyError) {
          console.error("[Flutterwave] Webhook payment history error:", historyError);
        }

        console.log(`[Flutterwave] Webhook processed - subscription activated for user: ${userId}`);
      }

      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("[Flutterwave] Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
