import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product IDs from Polar.sh (sandbox)
const PRODUCTS = {
  basic_monthly: "a9be60cf-0410-4f79-9f79-d580efbce621",
  basic_annual: "9fdc4091-4687-42d1-9635-0006522f5d9d",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const polarAccessToken = Deno.env.get("POLAR_ACCESS_TOKEN");

  if (!polarAccessToken) {
    console.error("POLAR_ACCESS_TOKEN not configured");
    return new Response(
      JSON.stringify({ error: "Payment service not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if this is a webhook (Polar webhooks have specific headers)
    const polarSignature = req.headers.get("webhook-signature") || req.headers.get("polar-signature");
    
    let body: any = {};
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    }

    // Handle webhook from Polar (detected by signature header or event type)
    if (polarSignature || body.type?.startsWith("checkout.") || body.type?.startsWith("order.")) {
      console.log("Handling Polar webhook");
      return await handleWebhook(req, body, supabase, polarSignature);
    }

    const { action } = body;
    console.log("Polar payment action:", action);

    // Handle checkout initialization
    if (action === "initialize") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Authorization required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        console.error("Auth error:", authError);
        return new Response(
          JSON.stringify({ error: "Invalid authorization" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { plan, callbackUrl } = body;
      const productId = plan === "basic_annual" ? PRODUCTS.basic_annual : PRODUCTS.basic_monthly;

      console.log("Creating Polar checkout for user:", user.id, "plan:", plan, "productId:", productId);

      // Create checkout session with Polar API
      // Using sandbox API for testing
      const polarResponse = await fetch("https://sandbox-api.polar.sh/v1/checkouts/custom/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${polarAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          success_url: `${req.headers.get("origin") || "https://crushgoals.app"}${callbackUrl}?checkout_id={CHECKOUT_ID}`,
          customer_email: user.email,
          metadata: {
            user_id: user.id,
            plan: plan,
          },
        }),
      });

      if (!polarResponse.ok) {
        const errorText = await polarResponse.text();
        console.error("Polar API error:", polarResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: "Failed to create checkout", details: errorText }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const checkoutData = await polarResponse.json();
      console.log("Polar checkout created:", checkoutData.id);

      return new Response(
        JSON.stringify({ 
          checkoutUrl: checkoutData.url,
          checkoutId: checkoutData.id,
          success: true 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle payment verification
    if (action === "verify") {
      const { checkoutId } = body;

      if (!checkoutId) {
        return new Response(
          JSON.stringify({ error: "Checkout ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Verifying Polar checkout:", checkoutId);

      // Get checkout status from Polar
      const polarResponse = await fetch(`https://sandbox-api.polar.sh/v1/checkouts/custom/${checkoutId}`, {
        headers: {
          "Authorization": `Bearer ${polarAccessToken}`,
        },
      });

      if (!polarResponse.ok) {
        const errorText = await polarResponse.text();
        console.error("Polar verification error:", errorText);
        return new Response(
          JSON.stringify({ error: "Verification failed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const checkout = await polarResponse.json();
      console.log("Checkout status:", checkout.status);

      if (checkout.status === "succeeded" || checkout.status === "confirmed") {
        const userId = checkout.metadata?.user_id;
        const plan = checkout.metadata?.plan;

        if (userId && plan) {
          // Update subscription
          const isAnnual = plan === "basic_annual";
          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + (isAnnual ? 12 : 1));

          const { error: subError } = await supabase
            .from("subscriptions")
            .upsert({
              user_id: userId,
              plan: isAnnual ? "annual" : "monthly",
              status: "active",
              payment_provider: "polar",
              payment_id: checkoutId,
              amount_paid: isAnnual ? 3300 : 300,
              currency: "USD",
              current_period_start: new Date().toISOString(),
              current_period_end: periodEnd.toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

          if (subError) {
            console.error("Subscription update error:", subError);
          }

          // Log payment history
          await supabase.from("payment_history").insert({
            user_id: userId,
            amount: isAnnual ? 33.00 : 3.00,
            currency: "USD",
            plan: isAnnual ? "annual" : "monthly",
            status: "completed",
            payment_provider: "polar",
            payment_reference: checkoutId,
          });

          console.log("Subscription activated for user:", userId);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            plan: checkout.metadata?.plan,
            amount: checkout.amount,
            currency: "USD"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, status: checkout.status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Polar payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleWebhook(req: Request, body: any, supabase: any, signature: string | null) {
  const webhookSecret = Deno.env.get("POLAR_WEBHOOK_SECRET");
  
  // Verify webhook signature if secret is configured
  if (webhookSecret && signature) {
    // Note: Add proper signature verification for production
    console.log("Webhook signature present:", !!signature);
  }

  const event = body;
  console.log("Polar webhook event:", event.type);

  if (event.type === "checkout.confirmed" || event.type === "order.created") {
    const data = event.data;
    const userId = data.metadata?.user_id;
    const plan = data.metadata?.plan;

    if (userId && plan) {
      const isAnnual = plan === "basic_annual";
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + (isAnnual ? 12 : 1));

      const { error } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: userId,
          plan: isAnnual ? "annual" : "monthly",
          status: "active",
          payment_provider: "polar",
          payment_id: data.id,
          amount_paid: isAnnual ? 3300 : 300,
          currency: "USD",
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) {
        console.error("Webhook subscription error:", error);
      } else {
        console.log("Webhook: Subscription activated for user:", userId);
      }

      // Log payment
      await supabase.from("payment_history").insert({
        user_id: userId,
        amount: isAnnual ? 33.00 : 3.00,
        currency: "USD",
        plan: isAnnual ? "annual" : "monthly",
        status: "completed",
        payment_provider: "polar",
        payment_reference: data.id,
      });
    }
  }

  return new Response(
    JSON.stringify({ received: true }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
