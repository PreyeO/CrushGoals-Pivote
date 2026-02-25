"use client";

import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Sidebar } from "@/components/layout/sidebar";
import { OrgHeader } from "@/components/org/OrgHeader";
import { OrgStats } from "@/components/org/OrgStats";
import { ActiveGoalsList } from "@/components/org/ActiveGoalsList";
import { TeamHealth } from "@/components/org/TeamHealth";
import { TopPerformers } from "@/components/org/TopPerformers";
import { ActivityFeed } from "@/components/org/ActivityFeed";
import { notFound } from "next/navigation";
import { getTeamHealthScore, getOrgLeaderboard } from "@/lib/store-utils";
import type { Organization, OrgGoal, OrgMember, ActivityItem } from "@/types";

export default function OrgDashboardPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const goals = useStore(useShallow((state) => state.goals.filter((g: OrgGoal) => g.orgId === orgId)));
    const membersList = useStore(useShallow((state) => state.members.filter((m: OrgMember) => m.orgId === orgId)));
    const activities = useStore(useShallow((state) => state.activities.filter((a: ActivityItem) => a.orgId === orgId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())));
    const org = useStore((state) => state.organizations.find((o: Organization) => o.id === orgId));

    if (!mounted) return null;
    if (!org) return notFound();

    const health = getTeamHealthScore(orgId, goals, membersList);
    const leaderboard = getOrgLeaderboard(orgId, membersList).slice(0, 3);

    const activeGoals = goals.filter((g: OrgGoal) => g.status !== "completed");
    const completedGoals = goals.filter((g: OrgGoal) => g.status === "completed");
    const blockedGoals = goals.filter((g: OrgGoal) => g.status === "blocked");

    return (
        <div className="min-h-screen bg-background">
            <Sidebar currentOrgId={orgId} />
            <main className="lg:pl-[260px] transition-all duration-300">
                <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto">
                    <OrgHeader org={org} />

                    <OrgStats
                        activeGoals={activeGoals.length}
                        completedGoals={completedGoals.length}
                        memberCount={membersList.length}
                        healthScore={health.overall}
                        healthTrend={health.trend}
                    />

                    <div className="grid lg:grid-cols-5 gap-5">
                        <div className="lg:col-span-3 space-y-5">
                            <ActiveGoalsList
                                orgId={orgId}
                                goals={activeGoals.slice(0, 5)}
                                members={membersList}
                                blockedCount={blockedGoals.length}
                            />
                        </div>

                        <div className="lg:col-span-2 space-y-5">
                            <TeamHealth health={health} />
                            <TopPerformers orgId={orgId} leaderboard={leaderboard} />
                            <ActivityFeed activities={activities.slice(0, 5)} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
