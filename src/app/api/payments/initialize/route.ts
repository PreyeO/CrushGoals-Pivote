import { NextResponse } from "next/server";

const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, email, name, tier, tx_ref, callback_url, currency = "USD" } = body;

    const PLAN_IDS = {
      pro: process.env.FLUTTERWAVE_PLAN_ID_PRO,
      business: process.env.FLUTTERWAVE_PLAN_ID_BUSINESS
    };

    const planId = (PLAN_IDS as Record<string, string | undefined>)[tier];
    const numericPlanId = planId ? parseInt(planId) : undefined;

    console.log("Initializing payment:", { tier, amount, email });
    console.log("Using Plan IDs:", PLAN_IDS);
    console.log("Selected Plan ID:", numericPlanId);

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref,
        amount, // Keep amount as fallback/first charge
        currency,
        payment_plan: numericPlanId,
        redirect_url: callback_url,
        customer: {
          email,
          name,
        },
        meta: {
           tier,
        },
        customizations: {
          title: `CrushGoals ${tier.toUpperCase()} Subscription`,
          description: `Recurring ${tier} plan subscription`,
          logo: "https://hello.crushgoals.app/logo.png",
        },
      }),
    });

    const data = await response.json();
    console.log("Flutterwave response:", data);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment initialization error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
