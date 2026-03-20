"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Building2, CreditCard } from "lucide-react";
import { useStore } from "@/lib/store";
import { flutterwaveService } from "@/lib/services/flutterwave";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SubscriptionModalProps {
    children?: React.ReactNode;
}

const PLANS = [
    {
        id: "free",
        name: "Free",
        price: "₦0",
        period: "forever",
        description: "Perfect for getting started",
        features: [
            "1 Organization",
            "10 Members per org",
            "15 Active goals",
            "Basic reporting",
        ],
        buttonText: "Current Plan",
        disabled: true,
        gradient: "from-slate-500/20 to-slate-400/10",
        border: "border-slate-500/20",
    },
    {
        id: "pro",
        name: "Pro",
        price: "₦10,000",
        period: "per month",
        description: "For growing teams",
        features: [
            "3 Organizations",
            "25 Members per org",
            "Unlimited goals",
            "Slack & Telegram Integration",
            "Advanced Analytics",
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
        price: "₦25,000",
        period: "per month",
        description: "For established businesses",
        features: [
            "Unlimited Organizations",
            "Unlimited Members",
            "Unlimited Goals",
            "Priority Support",
            "Everything in Pro",
        ],
        buttonText: "Go Business",
        disabled: false,
        gradient: "from-[oklch(0.60_0.20_330/0.15)] to-[oklch(0.60_0.20_330/0.05)]",
        border: "border-[oklch(0.60_0.20_330/0.3)]",
    },
];

export function SubscriptionModal({ children }: SubscriptionModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const user = useStore((state) => state.user);
    const currentTier = user?.subscriptionTier || "free";

    const handleUpgrade = async (planId: string) => {
        if (planId === currentTier) return;
        
        setLoading(planId);
        try {
            const amount = planId === 'pro' ? 10000 : 25000;
            const data = await flutterwaveService.initializePayment({
                amount,
                email: user?.email || '',
                name: user?.name || 'User',
                tier: planId as any,
                tx_ref: `sub_${Date.now()}_${user?.id?.substring(0, 8)}`,
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="gradient-primary text-white border-0 gap-2 h-10 font-bold px-6">
                        <Sparkles className="w-4 h-4" /> Upgrade Plan
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] glass-card border-border/40 backdrop-blur-2xl p-0 overflow-hidden">
                <div className="p-6 sm:p-8">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-3xl font-black tracking-tight text-center flex items-center justify-center gap-3">
                            <Zap className="w-8 h-8 text-primary fill-primary/20" />
                            Choose Your Plan
                        </DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground text-sm max-w-md mx-auto mt-2">
                            Unlock the full potential of CrushGoals with features designed to help you and your team execute with precision.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid sm:grid-cols-3 gap-6">
                        {PLANS.map((plan) => {
                            const isCurrent = plan.id === currentTier;
                            return (
                                <div
                                    key={plan.id}
                                    className={cn(
                                        "relative flex flex-col p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.02]",
                                        plan.border,
                                        plan.gradient,
                                        plan.glow,
                                        plan.recommended && "ring-2 ring-primary/50 ring-offset-4 ring-offset-background"
                                    )}
                                >
                                    {plan.recommended && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black">{plan.price}</span>
                                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{plan.period}</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{plan.description}</p>
                                    </div>

                                    <div className="space-y-3 flex-1 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <div className="mt-1 p-0.5 rounded-full bg-primary/10">
                                                    <Check className="w-3 h-3 text-primary" />
                                                </div>
                                                <span className="text-xs text-muted-foreground/90">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => handleUpgrade(plan.id)}
                                        disabled={isCurrent || plan.disabled || loading === plan.id}
                                        variant={plan.recommended ? "default" : "outline"}
                                        className={cn(
                                            "w-full h-11 rounded-2xl font-bold tracking-tight transition-all",
                                            plan.recommended && "gradient-primary text-white border-0 hover:opacity-90",
                                            isCurrent && "bg-primary/10 text-primary border-primary/20",
                                            !plan.recommended && !isCurrent && "border-border/60 hover:bg-accent/60"
                                        )}
                                    >
                                        {loading === plan.id ? (
                                            "Processing..."
                                        ) : isCurrent ? (
                                            <span className="flex items-center gap-2">
                                                <Check className="w-4 h-4" /> Current
                                            </span>
                                        ) : (
                                            plan.buttonText
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-accent/20 border-t border-border/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
            </DialogContent>
        </Dialog>
    );
}
