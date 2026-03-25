"use client";

import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import Link from "next/link";
import { OrgHeader } from "@/components/org/OrgHeader";
import { OrgStats } from "@/components/org/OrgStats";
import { OrgPulse } from "@/components/org/OrgPulse";
import { ActiveGoalsList } from "@/components/org/ActiveGoalsList";
import { LeaderboardTable } from "@/components/org/LeaderboardTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { notFound } from "next/navigation";
import { getOrgHealthScore, getOrgLeaderboard } from "@/lib/store-utils";
import type { OrgGoal, OrgMember, Organization } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Target,
} from "lucide-react";

export default function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);
  const [mounted, setMounted] = useState(false);
  const [now] = useState(() => Date.now());

  const goals = useStore(
    useShallow((state) =>
      state.goals.filter((g: OrgGoal) => g.orgId === orgId),
    ),
  );
  const membersList = useStore(
    useShallow((state) =>
      state.members.filter((m: OrgMember) => m.orgId === orgId),
    ),
  );
  const org = useStore(
    useShallow((state) =>
      state.organizations.find((o: Organization) => o.id === orgId),
    ),
  );
  const isLoading = useStore((state) => state.isLoading);
  const user = useStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
    // Data fetching removed here; handled by parent OrgLayout to prevent flickers
  }, [orgId]);

  if (!mounted || (isLoading && !org)) return <LoadingState />;
  if (!org) return notFound();

  const health = getOrgHealthScore(orgId, goals, membersList);
  const leaderboard = getOrgLeaderboard(orgId, membersList);

  const activeGoalsCount = goals.filter(
    (g: OrgGoal) => g.status !== "completed",
  ).length;
  const completedGoalsCount = goals.filter(
    (g: OrgGoal) => g.status === "completed",
  ).length;

  // Role gating: only admins/owners see Pulse
  const myMember = membersList.find((m) => m.userId === user?.id);
  const isAdminOrOwner = myMember?.role === "owner" || myMember?.role === "admin";



  return (
    <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <OrgHeader org={org} />
      </div>

      <OrgStats
        activeGoals={activeGoalsCount}
        completedGoals={completedGoalsCount}
        memberCount={membersList.length}
        healthScore={health.overall}
        healthTrend={health.trend}
      />

      {isAdminOrOwner && (
        <OrgPulse
          orgId={orgId}
          membersList={membersList}
          goals={goals}
          now={now}
        />
      )}

      <Tabs defaultValue="leaderboard" className="w-full space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-1">
          <TabsList className="bg-transparent h-auto p-0 gap-6">
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-bold flex items-center gap-2 transition-all"
            >
              <Trophy className="w-4 h-4" /> Standings
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-bold flex items-center gap-2 transition-all"
            >
              <Target className="w-4 h-4" /> Active Goals
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="leaderboard"
          className="mt-0 animate-in fade-in duration-300"
        >
          <LeaderboardTable leaderboard={leaderboard} />
        </TabsContent>

        <TabsContent
          value="goals"
          className="mt-0 animate-in fade-in duration-300"
        >
          <ActiveGoalsList orgId={orgId} limit={3} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
