import { Target, CheckCircle, Trophy, Flame } from "lucide-react";
import { OrgMember } from "@/types";

interface MemberStatsRowProps {
  member: OrgMember;
}

export function MemberStatsRow({ member }: MemberStatsRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 stagger">
      <div className="glass-card p-4 text-center animate-fade-in-up">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <Target className="w-4 h-4 text-primary" />
        </div>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
          Goals Assigned
        </p>
        <p className="text-2xl font-black text-foreground">
          {member.goalsAssigned}
        </p>
      </div>
      <div className="glass-card p-4 text-center animate-fade-in-up">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
          Completed
        </p>
        <p className="text-2xl font-black text-emerald-500">
          {member.goalsCompleted}
        </p>
      </div>
      <div className="glass-card p-4 text-center animate-fade-in-up">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <Trophy className="w-4 h-4 text-primary" />
        </div>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
          Completion Rate
        </p>
        <p className="text-2xl font-black text-primary">
          {member.completionRate}%
        </p>
      </div>
      <div className="glass-card p-4 text-center animate-fade-in-up">
        <div className="w-9 h-9 rounded-xl bg-[oklch(0.72_0.18_55_/0.12)] flex items-center justify-center mx-auto mb-2">
          <Flame className="w-4 h-4 text-[oklch(0.72_0.18_55)]" />
        </div>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
          Streak
        </p>
        <p className="text-2xl font-black text-[oklch(0.72_0.18_55)]">
          {member.currentStreak}
          <span className="text-sm font-bold text-muted-foreground ml-1">
            days
          </span>
        </p>
      </div>
    </div>
  );
}
