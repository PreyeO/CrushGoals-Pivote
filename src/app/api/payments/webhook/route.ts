import { NextResponse } from "next/server";
import { paymentProcessor } from "@/lib/services/paymentProcessor";

const FLW_WEBHOOK_HASH = process.env.FLUTTERWAVE_WEBHOOK_HASH;

export async function POST(request: Request) {
  // 1. Verify Webhook Signature (Secret Hash)
  const signature = request.headers.get("verif-hash");
  
  if (FLW_WEBHOOK_HASH && signature !== FLW_WEBHOOK_HASH) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Flutterwave webhook body contains the transaction data
    // We mainly need the transaction ID to re-verify for absolute certainty
    // or we can trust the body if the signature is valid.
    // Standard practice is to re-verify with the ID.
    
    const transactionId = body.id || body.data?.id;

    if (!transactionId) {
       return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
    }

    const result = await paymentProcessor.processTransaction({ 
        transactionId: String(transactionId) 
    });

    if (result.success) {
      return NextResponse.json({ status: "success", alreadyProcessed: result.alreadyProcessed });
    }

    return NextResponse.json({ status: "failed", error: result.error }, { status: 400 });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
