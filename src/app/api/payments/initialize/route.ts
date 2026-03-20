import { NextResponse } from "next/server";

const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, email, name, tier, tx_ref, callback_url, currency = "USD" } = body;

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref,
        amount,
        currency,
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
          description: `Upgrade to ${tier} plan`,
          logo: "https://hello.crushgoals.app/logo.png",
        },
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
