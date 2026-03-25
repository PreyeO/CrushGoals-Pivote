"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, CreditCard } from "lucide-react";
import { useStore } from "@/lib/store";
import { flutterwaveService } from "@/lib/services/flutterwave";
import { toast } from "sonner";
import { PricingCard, PlanData } from "@/components/PricingCard";

const PLANS = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        period: "forever",
        description: "For small teams getting started",
        features: [
            "1 Organization",
            "Up to 10 members",
            "15 active goals",
            "Progress reports & analytics",
            "Leaderboard",
            "Export PDF / CSV",
            "Email notifications",
        ],
        buttonText: "Current Plan",
        disabled: true,
        gradient: "from-slate-500/20 to-slate-400/10",
        border: "border-slate-500/20",
    },
    {
        id: "pro",
        name: "Pro",
        price: "$8",
        period: "per month",
        description: "For growing teams who need more",
        features: [
            "3 Organizations",
            "Up to 25 members per org",
            "Unlimited goals",
            "Slack & Telegram notifications",
            "Leaderboard",
            "Progress reports & analytics",
            "Export PDF / CSV",
            "Priority Support",
        ],
        buttonText: "Upgrade to Pro",
        disabled: false,
        recommended: true,
        gradient: "from-primary/20 to-primary/5",
        border: "border-primary/30",
        glow: "glow-primary-sm",
    },
    {
        id: "business",
        name: "Business",
        price: "$19",
        period: "per month",
        description: "For organizations at scale",
        features: [
            "Unlimited Organizations",
            "Unlimited Members",
            "Unlimited Goals",
            "Advanced analytics",
            "Team health score",
            "Everything in Pro",
            "Dedicated support",
        ],
        buttonText: "Go Business",
        disabled: false,
        gradient: "from-[oklch(0.60_0.20_330/0.15)] to-[oklch(0.60_0.20_330/0.05)]",
        border: "border-[oklch(0.60_0.20_330/0.3)]",
    },
];

export function PricingPlans({ 
    showHeader = true, 
    highlightPlan 
}: { 
    showHeader?: boolean;
    highlightPlan?: string;
}) {
    const [loading, setLoading] = useState<string | null>(null);
    const user = useStore((state) => state.user);
    const currentTier = user?.subscriptionTier || "free";

    // Auto-scroll to pricing if a plan is highlighted
    useEffect(() => {
        if (highlightPlan) {
            const el = document.getElementById('pricing-plans-section');
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
            }
        }
    }, [highlightPlan]);

    const handleUpgrade = async (planId: string) => {
        if (planId === currentTier) return;
        
        setLoading(planId);
        try {
            const amount = planId === 'pro' ? 8 : 19;
            const data = await flutterwaveService.initializePayment({
                amount,
                currency: 'USD',
                email: user?.email || '',
                name: user?.name || 'User',
                tier: planId as any,
                tx_ref: `sub_${Date.now()}_${user?.id}`,
                callback_url: `${window.location.origin}/api/payments/verify`,
            });

            if (data.status === 'success' && data.data?.link) {
                window.location.href = data.data.link;
            } else {
                throw new Error("Failed to initialize payment");
            }
        } catch (error: any) {
            console.error("Payment failed:", error);
            toast.error(error.message || "Failed to start payment process");
            setLoading(null);
        }
    };

    return (
        <div className="w-full" id="pricing-plans-section">
            {showHeader && (
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black tracking-tight flex items-center justify-center gap-3 mb-3">
                        <Zap className="w-8 h-8 text-primary fill-primary/20" />
                        Choose Your Plan
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        Unlock the full potential of CrushGoals with features designed to help you and your team execute with precision.
                    </p>
                </div>
            )}

            <div className="grid sm:grid-cols-3 gap-6">
                {PLANS.map((plan) => {
                    const isCurrent = plan.id === currentTier;
                    const isHighlighted = highlightPlan === plan.id;

                    return (
                        <PricingCard 
                            key={plan.id}
                            plan={plan as PlanData}
                            isCurrent={isCurrent}
                            isHighlighted={isHighlighted}
                            loading={loading}
                            onUpgrade={handleUpgrade}
                        />
                    );
                })}
            </div>

            <div className="mt-10 bg-accent/20 border border-border/10 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-background border border-border/40 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold">Secure Payment</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Powered by Flutterwave</p>
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground text-center sm:text-right max-w-[300px]">
                    Payments are processed securely. You can cancel your subscription at any time from your billing settings.
                </p>
            </div>
        </div>
    );
}
