"use client";

import { use, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Sidebar } from "@/components/layout/sidebar";
import { OrgHeader } from "@/components/org/OrgHeader";
import { OrgStats } from "@/components/org/OrgStats";
import { ActiveGoalsList } from "@/components/org/ActiveGoalsList";
import { LeaderboardTable } from "@/components/org/LeaderboardTable";
import { MembersInvitesList } from "@/components/org/MembersInvitesList";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { notFound } from "next/navigation";
import { getTeamHealthScore, getOrgLeaderboard } from "@/lib/store-utils";
import type { Organization, OrgGoal, OrgMember } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Bell, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrgDashboardPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);
    const [showNudge, setShowNudge] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const {
        goals: allGoals,
        members: allMembers,
        organizations: allOrgs,
        fetchInitialData,
        isLoading
    } = useStore();

    const goals = allGoals.filter((g: OrgGoal) => g.orgId === orgId);
    const membersList = allMembers.filter((m: OrgMember) => m.orgId === orgId);
    const org = allOrgs.find((o: Organization) => o.id === orgId);

    useEffect(() => {
        setMounted(true);
        fetchInitialData(orgId);
    }, [orgId, fetchInitialData]);

    useEffect(() => {
        if (mounted && !isLoading && goals.length === 0) {
            setIsCreateModalOpen(true);
        }
    }, [mounted, isLoading, goals.length]);

    if (!mounted) return null;

    const health = getTeamHealthScore(orgId, goals, membersList);
    const leaderboard = getOrgLeaderboard(orgId, membersList);

    const activeGoals = goals.filter((g: OrgGoal) => g.status !== "completed");
    const completedGoals = goals.filter((g: OrgGoal) => g.status === "completed");
    const blockedGoals = goals.filter((g: OrgGoal) => g.status === "blocked");

    return (
        <div className="min-h-screen bg-background">
            <Sidebar currentOrgId={orgId} />
            <main className="lg:pl-[260px] transition-all duration-300">
                {isLoading ? (
                    <div className="min-h-[80vh] flex items-center justify-center">
                        <LoadingState fullScreen={false} message="Crunching numbers..." />
                    </div>
                ) : !org ? (
                    <div className="min-h-[80vh] flex items-center justify-center">
                        <p className="text-muted-foreground">Organization not found.</p>
                    </div>
                ) : (
                    <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <OrgHeader org={org} />
                        </div>

                        {/* Weekly Nudge / Retention Mechanism */}
                        {showNudge && goals.length > 0 && (
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-primary animate-bounce" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Weekly Check-in Time!</p>
                                        <p className="text-xs text-muted-foreground italic">"How's your goal going? Update your progress to keep the team aligned."</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" className="text-xs h-8" onClick={() => setShowNudge(false)}>Update Now</Button>
                                    <Button size="sm" variant="ghost" className="text-xs h-8" onClick={() => setShowNudge(false)}>Later</Button>
                                </div>
                            </div>
                        )}

                        <OrgStats
                            activeGoals={activeGoals.length}
                            completedGoals={completedGoals.length}
                            memberCount={membersList.length}
                            healthScore={health.overall}
                            healthTrend={health.trend}
                        />

                        <Tabs defaultValue="leaderboard" className="w-full space-y-6">
                            <div className="flex items-center justify-between border-b border-border/40 pb-1">
                                <TabsList className="bg-transparent h-auto p-0 gap-6">
                                    <TabsTrigger
                                        value="leaderboard"
                                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-bold flex items-center gap-2 transition-all"
                                    >
                                        <Trophy className="w-4 h-4" /> Team Standings
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="goals"
                                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-bold flex items-center gap-2 transition-all"
                                    >
                                        <Target className="w-4 h-4" /> Active Goals
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="members"
                                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-bold flex items-center gap-2 transition-all"
                                    >
                                        <Users className="w-4 h-4" /> Team & Invites
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="leaderboard" className="mt-0 animate-in fade-in duration-300">
                                <LeaderboardTable leaderboard={leaderboard} />
                            </TabsContent>

                            <TabsContent value="goals" className="mt-0 animate-in fade-in duration-300">
                                <div className="grid lg:grid-cols-5 gap-5">
                                    <div className="lg:col-span-span-5">
                                        <ActiveGoalsList
                                            orgId={orgId}
                                            goals={activeGoals}
                                            members={membersList}
                                            blockedCount={blockedGoals.length}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="members" className="mt-0 animate-in fade-in duration-300">
                                <MembersInvitesList orgId={orgId} />
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </main>
        </div>
    );
}
