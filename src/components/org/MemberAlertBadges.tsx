import { Ban, AlertCircle, Clock } from "lucide-react";
import { OrgGoal } from "@/types";

interface MemberAlertBadgesProps {
  blockedGoals: OrgGoal[];
  behindGoals: OrgGoal[];
  overdueGoals: OrgGoal[];
}

export function MemberAlertBadges({
  blockedGoals,
  behindGoals,
  overdueGoals,
}: MemberAlertBadgesProps) {
  if (
    blockedGoals.length === 0 &&
    behindGoals.length === 0 &&
    overdueGoals.length === 0
  ) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in duration-300">
      {blockedGoals.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/5 border border-destructive/20">
          <Ban className="w-3.5 h-3.5 text-destructive" />
          <span className="text-[11px] font-bold text-destructive">
            {blockedGoals.length} goal{blockedGoals.length > 1 ? "s" : ""} blocked
          </span>
        </div>
      )}
      {behindGoals.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
          <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-[11px] font-bold text-yellow-500">
            {behindGoals.length} goal{behindGoals.length > 1 ? "s" : ""} behind
            schedule
          </span>
        </div>
      )}
      {overdueGoals.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/5 border border-destructive/20">
          <Clock className="w-3.5 h-3.5 text-destructive" />
          <span className="text-[11px] font-bold text-destructive">
            {overdueGoals.length} overdue
          </span>
        </div>
      )}
    </div>
  );
}
