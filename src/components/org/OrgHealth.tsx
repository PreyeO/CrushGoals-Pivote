"use client";

import { Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OrgHealthProps {
    health: {
        goalProgress: number;
        memberEngagement: number;
        onTimeCompletion: number;
    };
}

export function OrgHealth({ health }: OrgHealthProps) {
    const items = [
        { label: "Goal Progress", value: health.goalProgress, color: "text-primary" },
        { label: "Team Engagement", value: health.memberEngagement, color: "text-[oklch(0.70_0.18_155)]" },
        { label: "On-Time Completion", value: health.onTimeCompletion, color: "text-[oklch(0.75_0.15_80)]" },
    ];

    return (
        <div className="glass-card p-5 animate-slide-in-right">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Team Health
            </h2>
            <div className="space-y-3.5">
                {items.map((item) => (
                    <div key={item.label}>
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className={`font-bold ${item.color}`}>{item.value}%</span>
                        </div>
                        <Progress value={item.value} className="h-[5px]" />
                    </div>
                ))}
            </div>
        </div>
    );
}
