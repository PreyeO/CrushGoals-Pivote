"use client";

import { use, useState, useEffect } from "react";
import { getOrgLeaderboard } from "@/lib/store-utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { LeaderboardPodium } from "@/components/org/LeaderboardPodium";
import { LeaderboardTable } from "@/components/org/LeaderboardTable";

import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

export default function OrgLeaderboardPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [period, setPeriod] = useState("all");
    const [mounted, setMounted] = useState(false);

    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const isLoading = useStore((state) => state.isLoading);
    const orgs = useStore(useShallow((state) => state.organizations));
    const members = useStore(useShallow((state) => state.members));

    useEffect(() => {
        setMounted(true);
        fetchInitialData(orgId);
    }, [orgId, fetchInitialData]);

    const org = orgs.find(o => o.id === orgId);

    if (!mounted || (isLoading && !org)) return <div className="p-8 flex items-center justify-center min-h-[50vh] animate-pulse text-muted-foreground">Loading Leaderboard...</div>;
    if (!org) return notFound();

    const leaderboard = getOrgLeaderboard(orgId, members);
    const top3 = leaderboard.slice(0, 3);

    return (
        <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 animate-fade-in">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Leaderboard
                </h1>
                <p className="text-[13px] text-muted-foreground mt-1">
                    See who&apos;s crushing it in {org.name}
                </p>
            </div>

            {/* Period */}
            <Tabs value={period} onValueChange={setPeriod} className="mb-8">
                <TabsList className="bg-accent/40 p-1 h-auto">
                    <TabsTrigger value="week" className="text-[12px] px-3 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">This Week</TabsTrigger>
                    <TabsTrigger value="month" className="text-[12px] px-3 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">This Month</TabsTrigger>
                    <TabsTrigger value="all" className="text-[12px] px-3 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">All Time</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Podium */}
            <LeaderboardPodium top3={top3} />

            {/* Full Table */}
            <LeaderboardTable leaderboard={leaderboard} />
        </div>
    );
}
