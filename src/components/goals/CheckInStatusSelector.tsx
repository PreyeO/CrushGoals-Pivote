import { Label } from "@/components/ui/label";
import { CheckCircle2, TrendingUp, Clock, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { MemberGoalStatusValue, GoalStatus } from "@/types";

export const memberStatusOptions: { value: MemberGoalStatusValue; label: string; icon: React.ElementType; color: string }[] = [
    { value: "on_track", label: "On Track", icon: TrendingUp, color: "text-primary" },
    { value: "behind", label: "Behind", icon: Clock, color: "text-yellow-500" },
    { value: "blocked", label: "Blocked", icon: Ban, color: "text-destructive" },
    { value: "completed", label: "Completed", icon: CheckCircle2, color: "text-emerald-500" },
];

interface CheckInStatusSelectorProps {
    memberStatus: MemberGoalStatusValue;
    setMemberStatus: (value: MemberGoalStatusValue) => void;
    goalStatus: GoalStatus;
}

export function CheckInStatusSelector({
    memberStatus,
    setMemberStatus,
    goalStatus,
}: CheckInStatusSelectorProps) {
    return (
        <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">My Status</Label>
            <div className="grid grid-cols-2 gap-2">
                {memberStatusOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = memberStatus === opt.value;
                    
                    // Dynamic Label: If blocked, "On Track" becomes "Resolved / On Track"
                    let label = opt.label;
                    if (goalStatus === "blocked" && opt.value === "on_track") {
                        label = "Resolved / On Track";
                    }

                    return (
                        <button
                            key={opt.value}
                            onClick={() => setMemberStatus(opt.value)}
                            className={cn(
                                "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all font-semibold text-[11px] cursor-pointer",
                                isSelected
                                    ? "border-primary/40 bg-primary/10 text-foreground"
                                    : "border-border/30 bg-accent/20 text-muted-foreground hover:border-border/60"
                            )}
                        >
                            <Icon className={cn("w-3.5 h-3.5 shrink-0", isSelected ? opt.color : "")} />
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
