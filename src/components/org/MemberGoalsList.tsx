import { Target, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { OrgGoal, OrgMember, MemberGoalStatus } from "@/types";
import { goalStatusConfig } from "@/lib/constants";
import { GoalCheckInModal } from "@/components/goals/GoalCheckInModal";
import { useStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface MemberGoalsListProps {
  memberGoals: OrgGoal[];
  member: OrgMember;
  memberGoalStatuses: MemberGoalStatus[];
  now: number;
}

export function MemberGoalsList({
  memberGoals,
  member,
  memberGoalStatuses,
  now,
}: MemberGoalsListProps) {
  const allMembers = useStore((state) => state.members);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/50">
          Assigned Objectives
        </h3>
        <Badge variant="outline" className="text-[10px] font-bold h-5">
          {memberGoals.length} Total
        </Badge>
      </div>

      {memberGoals.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed">
          <Target className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-bold text-foreground mb-1">
            No goals assigned
          </p>
          <p className="text-xs text-muted-foreground">
            This member {`hasn't been assigned any goals yet`}.
          </p>
        </div>
      ) : (
        <div className="space-y-3 stagger">
          {memberGoals.map((goal) => {
            const sc = goalStatusConfig[goal.status] || goalStatusConfig.not_started;
            const StatusIcon = sc.icon;
            const isOverdue =
              goal.status !== "completed" &&
              new Date(goal.deadline).getTime() < now;

            // Pacing
            const start = new Date(
              goal.startDate || goal.createdAt,
            ).getTime();
            const end = new Date(goal.deadline).getTime();
            const totalTime = end - start;
            const elapsed = now - start;
            const expected =
              totalTime > 0
                ? Math.min(
                    100,
                    Math.max(0, Math.round((elapsed / totalTime) * 100)),
                  )
                : 0;
            const isBehind = goal.progress < expected - 15;
            const isAhead = goal.progress > expected + 15;

            // Member's individual status for this goal
            const ms = memberGoalStatuses.find(
              (s) =>
                s.goalId === goal.id &&
                (s.userId === member.userId || s.userId === member.id),
            );

            return (
              <div
                key={goal.id}
                className={cn(
                  "glass-card p-5 transition-all animate-fade-in-up group relative overflow-hidden",
                  isOverdue && "border-destructive/30 bg-destructive/2",
                  goal.status === "completed" &&
                    "border-emerald-500/20 bg-emerald-500/2",
                )}
              >
                {isOverdue && (
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-destructive text-white text-[9px] font-bold uppercase tracking-wider rounded-bl-lg">
                    Overdue
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{goal.emoji}</span>
                    <div>
                      <h4 className="font-bold text-[14px]">{goal.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {goal.category}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-1.5 h-4",
                            isBehind
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : isAhead
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-primary/10 text-primary border-primary/20",
                          )}
                        >
                          {isBehind
                            ? "Behind"
                            : isAhead
                              ? "Ahead"
                              : "On Track"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${sc.color} text-[9px] gap-1`}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {sc.label}
                    </Badge>
                    <GoalCheckInModal goal={goal} />
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                      Progress
                    </span>
                    <span className="text-[10px] font-bold text-primary">
                      {goal.targetNumber
                        ? `${goal.currentValue} / ${goal.targetNumber} ${goal.unit}`
                        : `${goal.progress}%`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-black w-10 text-right tabular-nums",
                        isOverdue ? "text-destructive" : "text-primary",
                      )}
                    >
                      {goal.progress}%
                    </span>
                  </div>
                </div>

                {/* Member's status note */}
                {ms && (
                  <div className="pt-3 mt-3 border-t border-border/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-wider">
                        Last Check-in
                      </span>
                      <span className="text-[9px] text-muted-foreground/50">
                        {new Date(ms.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {ms.note && (
                      <p className="text-[11px] text-muted-foreground bg-accent/20 rounded-lg p-2 border border-border/10">
                        &ldquo;{ms.note}&rdquo;
                      </p>
                    )}
                    {ms.taggedMemberIds && ms.taggedMemberIds.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-tighter flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" /> Tagged:
                            </span>
                            <div className="flex -space-x-1.5 overflow-hidden">
                                {ms.taggedMemberIds.map(id => {
                                    const m = allMembers.find(am => am.id === id);
                                    if (!m) return null;
                                    return (
                                        <Avatar key={id} className="w-4 h-4 border-2 border-background ring-1 ring-border/10" title={m.name}>
                                            <AvatarImage src={m.avatarUrl || undefined} />
                                            <AvatarFallback className="text-[7px] font-bold">{m.name[0]}</AvatarFallback>
                                        </Avatar>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                  </div>
                )}

                {/* Deadline */}
                <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Due{" "}
                  {new Date(goal.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
