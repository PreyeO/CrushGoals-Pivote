import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlanData {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    buttonText: string;
    disabled: boolean;
    recommended?: boolean;
    gradient: string;
    border: string;
    glow?: string;
}

export interface PricingCardProps {
    plan: PlanData;
    isCurrent: boolean;
    isHighlighted: boolean;
    loading: string | null;
    onUpgrade: (planId: string) => void;
}

export function PricingCard({ plan, isCurrent, isHighlighted, loading, onUpgrade }: PricingCardProps) {
    return (
        <div
            className={cn(
                "relative flex flex-col p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.02]",
                plan.border,
                plan.gradient,
                plan.glow,
                plan.recommended && !isHighlighted && "ring-2 ring-primary/50 ring-offset-4 ring-offset-background",
                isHighlighted && "ring-4 ring-primary ring-offset-8 ring-offset-background scale-[1.05] z-10"
            )}
        >
            {(plan.recommended || isHighlighted) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                    {isHighlighted ? "Selected Plan" : "Most Popular"}
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
                onClick={() => onUpgrade(plan.id)}
                disabled={isCurrent || plan.disabled || loading === plan.id}
                variant={(plan.recommended || isHighlighted) ? "default" : "outline"}
                className={cn(
                    "w-full h-11 rounded-2xl font-bold tracking-tight transition-all",
                    (plan.recommended || isHighlighted) && "gradient-primary text-white border-0 hover:opacity-90",
                    isCurrent && "bg-primary/10 text-primary border-primary/20",
                    !plan.recommended && !isCurrent && !isHighlighted && "border-border/60 hover:bg-accent/60"
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
}
