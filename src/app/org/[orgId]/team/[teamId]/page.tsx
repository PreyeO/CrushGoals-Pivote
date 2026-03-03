"use client";

import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Users, ChevronRight } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import Link from "next/link";
import { getTeamHealthScore } from "@/lib/store-utils";
import { OrgStats } from "@/components/org/OrgStats";
import { ActiveGoalsList } from "@/components/org/ActiveGoalsList";
import type { Team, OrgGoal, OrgMember, Organization } from "@/types";

export default function TeamDashboardPage({
    params
}: {
    params: Promise<{ orgId: string; teamId: string }>
}) {
    const { orgId, teamId } = use(params);
    const [mounted, setMounted] = useState(false);

    const allOrgs = useStore(useShallow((state) => state.organizations));
    const allTeams = useStore(useShallow((state) => state.teams));
    const allGoals = useStore(useShallow((state) => state.goals));
    const allMembers = useStore(useShallow((state) => state.members));
    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const isLoading = useStore((state) => state.isLoading);

    useEffect(() => {
        setMounted(true);
        fetchInitialData(orgId);
    }, [orgId, fetchInitialData]);

    const org = allOrgs.find((o: Organization) => o.id === orgId);
    const team = allTeams.find((t: Team) => t.id === teamId);

    if (!mounted || (isLoading && !org)) return <LoadingState />;
    if (!org || !team) return <div>Team not found</div>;

    const teamGoals = allGoals.filter((g: OrgGoal) => g.teamId === teamId);
    const teamMembers = allMembers.filter((m: OrgMember) => teamGoals.some(g => g.assignedTo.includes(m.id)));
    const health = getTeamHealthScore(orgId, teamGoals, teamMembers);

    const activeGoals = teamGoals.filter(g => g.status !== 'completed');
    const completedGoals = teamGoals.filter(g => g.status === 'completed');

    return (
        <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto space-y-6 animation-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-lg glow-primary-sm shrink-0">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href={`/org/${orgId}`} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                                {org.name}
                            </Link>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="outline" className="text-[9px] h-4 uppercase tracking-tighter bg-primary/5 text-primary border-primary/20">Team Space</Badge>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight">{team.name}</h1>
                        <p className="text-[13px] text-muted-foreground line-clamp-1">{team.description}</p>
                    </div>
                </div>
            </div>

            <OrgStats
                activeGoals={activeGoals.length}
                completedGoals={completedGoals.length}
                memberCount={teamMembers.length}
                healthScore={health.overall}
                healthTrend={health.trend}
            />

            <Tabs defaultValue="goals" className="w-full space-y-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-1">
                    <TabsList className="bg-transparent h-auto p-0 gap-6">
                        <TabsTrigger
                            value="goals"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-bold flex items-center gap-2 transition-all"
                        >
                            <Target className="w-4 h-4" /> Team Goals
                        </TabsTrigger>
                        <TabsTrigger
                            value="members"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-bold flex items-center gap-2 transition-all"
                        >
                            <Users className="w-4 h-4" /> Members
                            <Badge className="ml-1 h-4 min-w-[1.25rem] px-1 bg-primary/10 text-primary border-none text-[9px] font-black">{teamMembers.length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="goals" className="mt-0 animate-in fade-in duration-300">
                    <ActiveGoalsList
                        orgId={orgId}
                        goals={teamGoals}
                        members={teamMembers}
                    />
                </TabsContent>

                <TabsContent value="members" className="mt-0 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="glass-card p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                    {member.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{member.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
