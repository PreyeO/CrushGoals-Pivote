"use client";

import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { OrgHeader } from "@/components/org/OrgHeader";
import { OrgStats } from "@/components/org/OrgStats";
import { ActiveGoalsList } from "@/components/org/ActiveGoalsList";
import { LeaderboardTable } from "@/components/org/LeaderboardTable";
import { notFound } from "next/navigation";
import { getTeamHealthScore, getOrgLeaderboard } from "@/lib/store-utils";
import type { Organization, OrgGoal, OrgMember } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Users, LayoutDashboard, ChevronRight } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TeamDashboardPage({ params }: { params: Promise<{ orgId: string; teamId: string }> }) {
    const { orgId, teamId } = use(params);
    const [mounted, setMounted] = useState(false);

    const {
        goals: allGoals,
        members: allMembers,
        organizations: allOrgs,
        teams: allTeams,
        fetchInitialData,
        isLoading
    } = useStore();

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
            fetchInitialData(orgId);
        }, 0);
        return () => clearTimeout(timer);
    }, [orgId, fetchInitialData]);

    if (!mounted) return null;
    if (isLoading) return <LoadingState message="Loading team board..." />;

    const org = allOrgs.find((o) => o.id === orgId);
    const team = allTeams.find((t) => t.id === teamId);

    if (!org) return notFound();
    if (!team) return notFound();

    // Filter goals and members for this SPECIFIC team
    const teamGoals = allGoals.filter((g: OrgGoal) => g.orgId === orgId && g.teamId === teamId);
    const teamMembersList = allMembers.filter((m: OrgMember) => m.orgId === orgId && m.teamId === teamId);

    const health = getTeamHealthScore(orgId, teamGoals, teamMembersList);
    const leaderboard = getOrgLeaderboard(orgId, teamMembersList);

    const activeGoals = teamGoals.filter((g: OrgGoal) => g.status !== "completed");
    const completedGoals = teamGoals.filter((g: OrgGoal) => g.status === "completed");
    const blockedGoals = teamGoals.filter((g: OrgGoal) => g.status === "blocked");

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar currentOrgId={orgId} />
            <main className="lg:pl-[260px] transition-all duration-300">
                <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto">
                    {/* Header with Breadcrumbs */}
                    <div className="mb-8">
                        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mb-4">
                            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                            <ChevronRight className="w-3 h-3" />
                            <Link href={`/org/${orgId}`} className="hover:text-primary transition-colors">{org.name}</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-foreground">Teams</span>
                        </nav>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shadow-inner border border-primary/20">
                                    {team.emoji || "👥"}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                        {team.name}
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-primary/30 text-primary bg-primary/5">Team</Badge>
                                    </h1>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{team.description}</p>
                                </div>
                            </div>
                            <Link href={`/org/${orgId}`}>
                                <Button variant="ghost" size="sm" className="text-xs font-bold gap-2 hover:bg-accent/60">
                                    <LayoutDashboard className="w-3.5 h-3.5" />
                                    Org Overview
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* New Sidebar-style Layout */}
                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Main Content (Goals/Leaderboard) */}
                        <div className="lg:col-span-8 space-y-6">
                            <Tabs defaultValue="goals" className="w-full">
                                <div className="flex items-center justify-between mb-6">
                                    <TabsList className="bg-accent/30 p-1 rounded-xl">
                                        <TabsTrigger value="goals" className="rounded-lg text-xs font-bold h-8 px-4">Goals</TabsTrigger>
                                        <TabsTrigger value="leaderboard" className="rounded-lg text-xs font-bold h-8 px-4">Standings</TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="goals" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                                    <ActiveGoalsList
                                        orgId={orgId}
                                        goals={activeGoals}
                                        members={teamMembersList}
                                        blockedCount={blockedGoals.length}
                                    />
                                </TabsContent>

                                <TabsContent value="leaderboard" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                                    <LeaderboardTable leaderboard={leaderboard} />
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar Column (Stats/Health) */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="glass-card p-6 border-primary/10 bg-primary/[0.02]">
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                                    <Trophy className="w-3.5 h-3.5 text-primary" />
                                    Team Performance
                                </h3>
                                <OrgStats
                                    activeGoals={activeGoals.length}
                                    completedGoals={completedGoals.length}
                                    memberCount={teamMembersList.length}
                                    healthScore={health.overall}
                                    healthTrend={health.trend}
                                    compact={true}
                                />
                            </div>

                            <div className="glass-card p-6 border-dashed border-border/60">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Quick Context</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-muted-foreground">Team Health</span>
                                        <span className="text-[11px] font-bold text-primary">{health.overall}/100</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-muted-foreground">Active Members</span>
                                        <span className="text-[11px] font-bold">{teamMembersList.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-muted-foreground">Target Completion</span>
                                        <span className="text-[11px] font-bold">{completedGoals.length} Done</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
