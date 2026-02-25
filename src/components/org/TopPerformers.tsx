"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LeaderboardEntry {
    memberId: string;
    name: string;
    totalPoints: number;
    rank: number;
    goalsCompleted: number;
    completionRate: number;
}

interface TopPerformersProps {
    orgId: string;
    leaderboard: LeaderboardEntry[];
}

export function TopPerformers({ orgId, leaderboard }: TopPerformersProps) {
    return (
        <div className="glass-card p-5 animate-slide-in-right" style={{ animationDelay: "80ms" }}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                    🏆 Top Performers
                </h2>
                <Link href={`/org/${orgId}/leaderboard`} className="text-[10px] text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-2.5">
                {leaderboard.map((entry) => (
                    <div key={entry.memberId} className="flex items-center gap-3 p-2.5 rounded-xl bg-accent/20 hover:bg-accent/40 transition-colors">
                        <span className="text-sm w-5 text-center">
                            {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                        </span>
                        <Avatar className="w-7 h-7">
                            <AvatarFallback className="bg-primary/15 text-primary text-[9px] font-bold">
                                {entry.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium truncate">{entry.name}</p>
                            <p className="text-[10px] text-muted-foreground">{entry.goalsCompleted} goals • {entry.completionRate}%</p>
                        </div>
                        <span className="text-[11px] font-bold text-primary">{entry.totalPoints}pt</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
