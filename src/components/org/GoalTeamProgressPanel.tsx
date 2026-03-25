"use client";

import { useMemo } from "react";
import { AlertTriangle, Flame } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { OrgMember, MemberGoalStatus, DailyCheckIn, MemberGoalStatusValue } from "@/types";
import { memberStatusConfig, STALE_MS } from "@/lib/goal-constants";
import { calculateStreak } from "@/lib/store-utils";

interface GoalTeamProgressPanelProps {
  assignees: OrgMember[];
  memberGoalStatuses: MemberGoalStatus[];
  isDaily: boolean;
  checkins: DailyCheckIn[];
}

export function GoalTeamProgressPanel({ assignees, memberGoalStatuses, isDaily, checkins }: GoalTeamProgressPanelProps) {
  if (assignees.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground italic text-center py-4 bg-accent/10 rounded-xl border border-dashed border-border/40">
        No members assigned to this goal yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {assignees.map((member: OrgMember) => {
        // Match by userId (auth ID) first, then by member.id (org_members row ID) as fallback
        const ms = memberGoalStatuses.find(
          (s) => s.userId === member.userId || s.userId === member.id,
        );
        const stale = ms
          ? Date.now() - new Date(ms.updatedAt).getTime() > STALE_MS
          : true;
        const config = ms
          ? memberStatusConfig[ms.status as MemberGoalStatusValue]
          : null;
        const Icon = config?.icon;

        // For daily goals, show member-specific check-in streak
        const memberCheckins = isDaily
          ? checkins.filter(c => c.userId === member.userId || c.userId === member.id)
          : [];
        const memberCheckedDates = new Set(memberCheckins.filter(c => c.completed).map(c => c.checkDate));
        const memberStreak = isDaily ? calculateStreak(memberCheckedDates) : 0;

        return (
          <div
            key={member.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-accent/20 border border-border/10 hover:border-primary/20 transition-colors"
          >
            <Avatar className="w-7 h-7 shrink-0 border border-background">
              <AvatarFallback className="bg-primary/20 text-primary text-[9px] font-black">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] font-bold">
                  {member.name}
                </span>
                {isDaily ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[oklch(0.72_0.18_55_/_0.12)] text-[oklch(0.72_0.18_55)]">
                    <Flame className="w-2.5 h-2.5" />
                    {memberStreak} day streak
                  </span>
                ) : config ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                      config.badgeClass,
                    )}
                  >
                    {Icon && <Icon className="w-2.5 h-2.5" />}
                    {config.label}
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground">
                    No update
                  </span>
                )}
                {!isDaily && stale && (
                  <span className="text-[9px] text-yellow-500 font-bold flex items-center gap-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {ms ? "Stale" : "Never updated"}
                  </span>
                )}
              </div>
              {ms?.note && (
                <p className="text-[11px] text-muted-foreground mt-1 bg-accent/30 rounded-lg p-2 border border-border/10">
                  &ldquo;{ms.note}&rdquo;
                </p>
              )}
              {ms && (
                <p className="text-[9px] text-muted-foreground/50 mt-1">
                  Updated{" "}
                  {new Date(ms.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
