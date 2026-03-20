import { NextResponse } from "next/server";
import { paymentProcessor } from "@/lib/services/paymentProcessor";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get("transaction_id") || searchParams.get("transactionId");

  if (!transactionId) {
    return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?payment=error&message=missing_id`);
  }

  try {
    const result = await paymentProcessor.processTransaction({ transactionId });

    if (result.success) {
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?payment=success&tier=${result.tier}`);
    }

    return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?payment=failed`);
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?payment=error`);
  }
}
