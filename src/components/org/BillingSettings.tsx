import { useStore } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import { PricingPlans } from "@/components/PricingPlans";
import { CreditCard, Zap } from "lucide-react";

import { Organization } from "@/types";

export function BillingSettings({ org }: { org: Organization }) {
    const searchParams = useSearchParams();
    const highlightPlan = searchParams.get('plan') || undefined;

    return (
        <section className="glass-card p-6 space-y-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Zap className="w-24 h-24 text-primary fill-primary" />
            </div>
            
            <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-primary" /> Subscription & Billing
                </h2>
                <p className="text-[11px] text-muted-foreground">Manage your plan and organization limits.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-accent/20 border border-border/40">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 mb-1">Organizations</p>
                    <p className="text-lg font-bold">
                        {useStore.getState().organizations.length} <span className="text-[11px] font-normal text-muted-foreground">/ {useStore.getState().user?.subscriptionTier === 'free' ? '1' : useStore.getState().user?.subscriptionTier === 'pro' ? '3' : '∞'}</span>
                    </p>
                    <div className="w-full h-1 bg-accent/30 rounded-full mt-2 overflow-hidden">
                        <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min(100, (useStore.getState().organizations.length / (useStore.getState().user?.subscriptionTier === 'free' ? 1 : useStore.getState().user?.subscriptionTier === 'pro' ? 3 : 100)) * 100)}%` }}
                        />
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-accent/20 border border-border/40">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 mb-1">Members</p>
                    <p className="text-lg font-bold">
                        {org.memberCount} <span className="text-[11px] font-normal text-muted-foreground">/ {useStore.getState().user?.subscriptionTier === 'free' ? '10' : useStore.getState().user?.subscriptionTier === 'pro' ? '25' : '∞'}</span>
                    </p>
                    <div className="w-full h-1 bg-accent/30 rounded-full mt-2 overflow-hidden">
                        <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min(100, (org.memberCount / (useStore.getState().user?.subscriptionTier === 'free' ? 10 : useStore.getState().user?.subscriptionTier === 'pro' ? 25 : 100)) * 100)}%` }}
                        />
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-accent/20 border border-border/40">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 mb-1">Active Goals</p>
                    <p className="text-lg font-bold">
                        {org.goalCount} <span className="text-[11px] font-normal text-muted-foreground">/ {useStore.getState().user?.subscriptionTier === 'free' ? '15' : '∞'}</span>
                    </p>
                    <div className="w-full h-1 bg-accent/30 rounded-full mt-2 overflow-hidden">
                        <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min(100, (org.goalCount / (useStore.getState().user?.subscriptionTier === 'free' ? 15 : 100)) * 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-border/10">
                <PricingPlans showHeader={false} highlightPlan={highlightPlan} />
            </div>
        </section>
    );
}
