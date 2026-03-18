"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Medal,
  Star,
  TrendingUp,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, type AppState } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
}

export function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  const user = useStore((state: AppState) => state.user);
  // Only show members with actual activity to avoid "empty cards"
  const activeCompetitors = leaderboard.filter(
    (entry) => entry.goalsCompleted > 0 || entry.totalPoints > 0,
  );
  const isLonely = activeCompetitors.length <= 1;

  return (
    <div className="space-y-6">
      <div className="glass-card overflow-hidden border-border/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent/30 border-b border-border/40">
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  Rank
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  Member
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  Goals Done
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground w-1/3">
                  Avg. Completion
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground text-right">
                  Accountability
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {activeCompetitors
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .map((entry, index) => (
                  <tr
                    key={entry.memberId}
                    className={cn(
                      "hover:bg-primary/[0.02] transition-colors group cursor-pointer",
                      entry.memberId === user?.id && "bg-primary/[0.03]",
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20 group-hover:bg-primary/10 transition-colors">
                        {index === 0 ? (
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        ) : index === 1 ? (
                          <Medal className="w-4 h-4 text-slate-400" />
                        ) : index === 2 ? (
                          <Medal className="w-4 h-4 text-amber-600" />
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border-2 border-background shadow-sm">
                          <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-black">
                            {entry.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold group-hover:text-primary transition-colors">
                            {entry.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Member
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-foreground">
                          {entry.goalsCompleted}
                        </span>
                        <Star className="w-3 h-3 text-primary" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-muted-foreground">
                            {entry.completionRate}%
                          </span>
                        </div>
                        <Progress
                          value={entry.completionRate}
                          className="h-2 rounded-full"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[oklch(0.70_0.18_155_/_0.1)] text-[oklch(0.70_0.18_155)] border border-[oklch(0.70_0.18_155_/_0.2)]">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {entry.currentStreak} Streak
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {activeCompetitors.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground italic text-sm">
              No active leaderboard stats yet. Complete goals to start climbing!
            </p>
          </div>
        )}
      </div>

      {/* Lonely Leaderboard CTA */}
      {isLonely && (
        <div className="p-8 rounded-3xl bg-primary/5 border border-dashed border-primary/30 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <UserPlus className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h3 className="text-lg font-bold mb-2">
            It's lonely at the top (and everywhere else).
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
            CrushGoals is better with friends. Invite others to start competing
            for the #1 spot!
          </p>
          <Button className="gradient-primary text-white border-0 gap-2 h-11 px-8 rounded-xl font-bold">
            <Sparkles className="w-4 h-4" />
            Invite Others
          </Button>
        </div>
      )}
    </div>
  );
}
