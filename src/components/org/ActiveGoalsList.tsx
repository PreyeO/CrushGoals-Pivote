"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { OrgGoal, OrgMember } from "@/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getVisibleGoals } from "@/lib/store-utils";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

import { ActiveDailyGoalItem } from "./ActiveDailyGoalItem";
import { ActiveStandardGoalItem } from "./ActiveStandardGoalItem";
import { CrushedGoalsSection } from "./CrushedGoalsSection";

interface ActiveGoalsListProps {
  orgId: string;
  limit?: number;
  goals?: OrgGoal[];
  members?: OrgMember[];
}

export function ActiveGoalsList({
  orgId,
  limit,
  goals: propGoals,
  members: propMembers,
}: ActiveGoalsListProps) {
  const storeGoals = useStore(
    useShallow((state) => state.goals.filter((g) => g.orgId === orgId)),
  );
  const storeMembers = useStore(useShallow((state) => state.members));
  const user = useStore(useShallow((state) => state.user));

  const goals = propGoals || storeGoals;
  const members = propMembers || storeMembers;

  const myMember = members.find(
    (m) => m.orgId === orgId && m.userId === user?.id,
  );
  const visibleGoals = getVisibleGoals(goals, myMember);

  const activeGoals = visibleGoals.filter(g => g.status !== 'completed');
  const crushedGoals = visibleGoals.filter(g => g.status === 'completed');

  const [now] = useState(() => Date.now());
  const displayedActive = limit ? activeGoals.slice(0, limit) : activeGoals;

  if (activeGoals.length === 0 && crushedGoals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 glass-card border-dashed border-2 border-border/40 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          No active goals yet
        </h3>
        <p className="text-xs text-muted-foreground mt-1 mb-6 text-center max-w-50">
          Every big achievement starts with a single goal.
        </p>
        <CreateGoalModal orgId={orgId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {displayedActive.map((goal) => {
          const isDaily =
            goal.frequency === "daily" ||
            goal.frequency === "weekly" ||
            goal.frequency === "monthly";

          if (isDaily) {
            return (
              <ActiveDailyGoalItem key={goal.id} goal={goal} members={members} />
            );
          }

          return (
            <ActiveStandardGoalItem key={goal.id} goal={goal} members={members} now={now} />
          );
        })}
      </div>

      <CrushedGoalsSection crushedGoals={crushedGoals} />

      {limit && visibleGoals.length > limit && (
        <Link
          href={`/org/${orgId}/goals?filter=in_progress`}
          className="flex items-center justify-center gap-2 py-3 w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors glass-card border-border/40 group mt-2"
        >
          View All Active Goals
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
