import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

export interface ProcessPaymentOptions {
    transactionId: string;
    expectedTxRef?: string;
}

export const paymentProcessor = {
    processTransaction: async ({ transactionId }: ProcessPaymentOptions) => {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // 1. Verify with Flutterwave
        const flwResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${FLW_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });

        const flwData = await flwResponse.json();

        if (flwData.status !== "success" || flwData.data.status !== "successful") {
            return { success: false, error: "Payment not successful", data: flwData };
        }

        const { tx_ref, amount, currency, customer, meta } = flwData.data;
        const tier = meta?.tier || "pro";
        const email = customer.email;

        // 2. Idempotency Check: Have we processed this tx_ref already?
        const { data: existingPayment } = await supabase
            .from("payments")
            .select("id, status")
            .eq("tx_ref", tx_ref)
            .single();

        if (existingPayment) {
            return { success: true, alreadyProcessed: true, tier };
        }

        // 3. Robust User Identification & Upgrade
        // We've updated the tx_ref format to include the full user ID: sub_TIMESTAMP_USERID
        const parts = tx_ref.split('_');
        const extractedUserId = parts.length >= 3 ? parts[2] : null;

        if (extractedUserId) {
            console.log(`[Payment] Upgrading by ID: ${extractedUserId} to tier: ${tier}`);
            const { error: profileError } = await supabase
                .from("profiles")
                .update({ subscription_tier: tier })
                .eq("id", extractedUserId);

            if (profileError) {
                console.error("[Payment] Profile update by ID error:", profileError);
                throw profileError;
            }
        } else {
            // Fallback for older transactions: Find profile by email.
            console.log(`[Payment] ID not in ref, falling back to email: ${email}`);
            const { data: profileToUpdate, error: lookupError } = await supabase
                .from("profiles")
                .select("id")
                .eq("email", email)
                .maybeSingle();

            let targetId = profileToUpdate?.id;

            if (!targetId || lookupError) {
                // Final fallback: try update directly by email on assumption it exists.
                const { error: updateByEmailError, count } = await supabase
                    .from("profiles")
                    .update({ subscription_tier: tier })
                    .eq("email", email);
                
                if (updateByEmailError || count === 0) {
                    console.error("[Payment] Failed to find profile via email lookup fallback.", updateByEmailError);
                    return { success: false, error: "Could not identify user for upgrade." };
                }
            } else {
                const { error: profileError } = await supabase
                    .from("profiles")
                    .update({ subscription_tier: tier })
                    .eq("id", targetId);

                if (profileError) throw profileError;
            }
        }

        // 4. Record the Payment
        const { error: paymentError } = await supabase
            .from("payments")
            .insert({
                email,
                amount,
                currency,
                tx_ref,
                transaction_id: transactionId,
                status: "successful",
                tier,
                meta: flwData.data
            });

        if (paymentError) {
            console.error("Payment record error:", paymentError);
            // We don't throw here to avoid failing the whole process if just the log fail, 
            // but in production we might want more robust logging.
        }

        return { success: true, tier };
    }
};
