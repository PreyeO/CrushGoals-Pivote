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
            <div className="flex items-center gap-1.5 p-1 bg-accent/10 rounded-xl border border-border/20">
                {memberStatusOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = memberStatus === opt.value;
                    
                    let label = opt.label;
                    if (goalStatus === "blocked" && opt.value === "on_track") {
                        label = "Resolved";
                    }

                    return (
                        <button
                            key={opt.value}
                            onClick={() => setMemberStatus(opt.value)}
                            title={label}
                            className={cn(
                                "flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer border border-transparent",
                                isSelected
                                    ? "bg-primary/15 border-primary/30 text-primary shadow-sm"
                                    : "text-muted-foreground hover:bg-accent/20"
                            )}
                        >
                            <Icon className={cn("w-4 h-4 shrink-0", isSelected ? "" : "opacity-50")} />
                            <span className={cn("text-[8px] font-black uppercase tracking-tighter truncate w-full text-center")}>
                                {label.split(' ')[0]}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
