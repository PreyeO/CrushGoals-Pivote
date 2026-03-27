"use client";

import { use, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Plus, Search } from "lucide-react";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { GoalCard } from "@/components/org/GoalCard";
import type { OrgGoal } from "@/types";
import { getVisibleGoals } from "@/lib/store-utils";

export default function OrgGoalsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center animate-pulse text-muted-foreground uppercase tracking-widest font-black">
          Loading Goals...
        </div>
      }
    >
      <OrgGoalsContent params={params} />
    </Suspense>
  );
}

function OrgGoalsContent({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";

  const [filter, setFilter] = useState<string>(initialFilter);

  const goals = useStore(
    useShallow((state) =>
      state.goals.filter((g: OrgGoal) => g.orgId === orgId),
    ),
  );
  const members = useStore(useShallow((state) => state.members));
  const user = useStore(useShallow((state) => state.user));
  const myMember = members.find(
    (m) => m.orgId === orgId && m.userId === user?.id,
  );

  const visibleGoals = getVisibleGoals(goals, myMember);
  const filtered =
    filter === "all"
      ? visibleGoals
      : visibleGoals.filter((g: OrgGoal) => g.status === filter);

  const counts: Record<string, number> = {
    all: visibleGoals.length,
    in_progress: visibleGoals.filter((g: OrgGoal) => g.status === "in_progress")
      .length,
    completed: visibleGoals.filter((g: OrgGoal) => g.status === "completed")
      .length,
    blocked: visibleGoals.filter((g: OrgGoal) => g.status === "blocked").length,
    not_started: visibleGoals.filter((g: OrgGoal) => g.status === "not_started")
      .length,
  };

  return (
    <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Goals
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {visibleGoals.length} goals · {counts.completed} completed ·{" "}
            {counts.blocked > 0 ? `${counts.blocked} blocked` : "no blockers"}
          </p>
        </div>
        <CreateGoalModal orgId={orgId}>
          <Button className="gradient-primary text-white border-0 hover:opacity-90 gap-2 h-9 text-[13px] font-semibold self-start">
            <Plus className="w-4 h-4" /> New Goal
          </Button>
        </CreateGoalModal>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-accent/40 p-1 h-auto">
          {[
            { value: "all", label: "All" },
            { value: "in_progress", label: "Active" },
            { value: "blocked", label: "Blocked" },
            { value: "completed", label: "Done" },
            { value: "not_started", label: "Not Started" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-[12px] px-3 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            >
              {tab.label}{" "}
              <span className="ml-1 text-[10px] opacity-60">
                {counts[tab.value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Goals */}
      <div className="space-y-4 stagger">
        {filtered.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
        {filtered.length === 0 && (
          <div className="glass-card p-16 text-center">
            <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No goals match this filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
