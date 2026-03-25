import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Target, Flame } from "lucide-react";

interface LeaderboardTableProps {
    leaderboard: {
        memberId: string;
        rank: number;
        name: string;
        totalPoints: number;
        goalsCompleted: number;
        completionRate: number;
        currentStreak: number;
    }[];
}

export function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
    if (leaderboard.length === 0) return null;

    return (
        <div className="glass-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[50px_1fr_90px_110px_70px_90px] px-5 py-3 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.15em] border-b border-border/30">
                <span>#</span>
                <span>Member</span>
                <span className="text-center">Goals</span>
                <span className="text-center">Completion</span>
                <span className="text-center">Streak</span>
                <span className="text-right">Points</span>
            </div>

            {/* Rows */}
            {leaderboard.map((entry, i) => (
                <div
                    key={entry.memberId}
                    className={`grid grid-cols-[50px_1fr_90px_110px_70px_90px] px-5 py-3.5 items-center hover:bg-accent/30 transition-colors ${entry.rank <= 3 ? "bg-primary/[0.03]" : ""} ${i < leaderboard.length - 1 ? "border-b border-border/15" : ""}`}
                >
                    <span className="text-base font-bold">
                        {entry.rank <= 3 ? (
                            <span>{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}</span>
                        ) : (
                            <span className="text-muted-foreground text-sm">{entry.rank}</span>
                        )}
                    </span>

                    <div className="flex items-center gap-2.5">
                        <Avatar className="w-7 h-7">
                            <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-bold">{entry.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-[13px]">{entry.name}</span>
                    </div>

                    <div className="text-center">
                        <span className="text-[13px] font-semibold flex items-center justify-center gap-1">
                            <Target className="w-3 h-3 text-primary" /> {entry.goalsCompleted}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 px-1">
                        <Progress value={entry.completionRate} className="h-[5px] flex-1" />
                        <span className="text-[11px] font-bold w-7 text-right">{entry.completionRate}%</span>
                    </div>

                    <div className="text-center">
                        <span className="text-[13px] font-semibold flex items-center justify-center gap-1">
                            <Flame className="w-3 h-3 text-[oklch(0.72_0.18_55)]" /> {entry.currentStreak}
                        </span>
                    </div>

                    <div className="text-right">
                        <span className="text-[13px] font-extrabold text-primary">{entry.totalPoints}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
