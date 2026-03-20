"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchInitialData, user, organizations } = useStore();

  useEffect(() => {
    const payment = searchParams.get("payment");
    const tier = searchParams.get("tier");
    
    if (payment === "success") {
      toast.success(`Success! Your account has been upgraded to ${tier?.toUpperCase()}.`, {
        description: "You now have access to all premium features.",
        duration: 5000,
      });
      // Force refresh data to pick up the new tier
      fetchInitialData();
      
      // Clean up URL without losing the rest of the path
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("tier");
      router.replace(url.pathname + url.search);
    } else if (payment === "failed") {
      toast.error("Payment failed. Please try again or contact support.");
      
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      router.replace(url.pathname + url.search);
    }

    // Handle Plan Redirection from Landing
    const plan = searchParams.get("plan");
    if (plan && user && organizations.length > 0) {
      const orgId = organizations[0].id;
      router.replace(`/org/${orgId}/settings?plan=${plan}`);
    }
  }, [searchParams, router, fetchInitialData, user, organizations]);

  return null;
}

export function PaymentStatusHandler() {
  return (
    <Suspense fallback={null}>
      <PaymentStatusContent />
    </Suspense>
  );
}
