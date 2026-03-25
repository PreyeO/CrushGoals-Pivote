"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStore, AppState } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { OrgGoal, OrgMember } from "@/types";
import { sortGoals } from "@/lib/store-utils";
import { DailyGoalCard } from "./DailyGoalCard";
import { StandardGoalCard } from "./StandardGoalCard";

export function DashboardGoals() {
  const goals = useStore(useShallow((state: AppState) => state.goals));
  const members = useStore(useShallow((state: AppState) => state.members));
  const user = useStore(useShallow((state: AppState) => state.user));
  const organizations = useStore(
    useShallow((state: AppState) => state.organizations),
  );

  // Find all member IDs for the current user across all orgs
  const myMemberIds = members
    .filter((m: OrgMember) => m.userId === user?.id)
    .map((m: OrgMember) => m.id);

  // Filter for goals assigned to any of these member IDs and sort them
  const myGoals = sortGoals(
    goals.filter((g: OrgGoal) => g.assignedTo.some((id) => myMemberIds.includes(id)))
  ).slice(0, 3);

  if (myGoals.length === 0) return null;

  // For the "View all" link, go to the first org's goals page
  const firstGoalOrgId = myGoals[0]?.orgId;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          My Active Goals
        </h2>
        {firstGoalOrgId && (
          <Link
            href={`/org/${firstGoalOrgId}/goals`}
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
        {myGoals.map((goal) => {
          const isDaily =
            goal.frequency === "daily" ||
            goal.frequency === "weekly" ||
            goal.frequency === "monthly";

          if (isDaily) {
            return <DailyGoalCard key={goal.id} goal={goal} orgs={organizations} />;
          }

          return (
            <StandardGoalCard key={goal.id} goal={goal} organizations={organizations} />
          );
        })}
      </div>
    </div>
  );
}
