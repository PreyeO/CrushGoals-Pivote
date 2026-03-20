"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { PricingPlans } from "./PricingPlans";

interface SubscriptionModalProps {
    children?: React.ReactNode;
}

export function SubscriptionModal({ children }: SubscriptionModalProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="gradient-primary text-white border-0 gap-2 h-10 font-bold px-6">
                        <Sparkles className="w-4 h-4" /> Upgrade Plan
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] glass-card border-border/40 backdrop-blur-2xl p-0 overflow-hidden">
                <div className="p-6 sm:p-10">
                    <DialogHeader className="mb-10">
                        <DialogTitle className="text-3xl font-black tracking-tight text-center flex items-center justify-center gap-3">
                            <Zap className="w-8 h-8 text-primary fill-primary/20" />
                            Upgrade Your Experience
                        </DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground text-sm max-w-md mx-auto mt-2">
                            Expand your limits and unlock precision execution tools for your entire team.
                        </DialogDescription>
                    </DialogHeader>

                    <PricingPlans showHeader={false} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
