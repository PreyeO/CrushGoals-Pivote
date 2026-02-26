"use client";

import { use, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { getOrgLeaderboard } from "@/lib/store-utils";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, Target, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

export default function OrgLeaderboardPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [period, setPeriod] = useState("all");

    const orgs = useStore(useShallow((state) => state.organizations));
    const members = useStore(useShallow((state) => state.members));

    const org = orgs.find(o => o.id === orgId);
    if (!org) return notFound();

    const leaderboard = getOrgLeaderboard(orgId, members);
    const top3 = leaderboard.slice(0, 3);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar currentOrgId={orgId} />
            <main className="lg:pl-[260px] transition-all duration-300">
                <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 animate-fade-in">
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-primary" />
                            Team Leaderboard
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
                    {top3.length >= 3 && (
                        <div className="flex items-end justify-center gap-4 sm:gap-6 mb-12">
                            {/* 2nd */}
                            <div className="glass-card p-5 text-center w-32 sm:w-40 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                                <div className="text-3xl mb-3">🥈</div>
                                <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-border/40">
                                    <AvatarFallback className="bg-primary/15 text-primary font-bold text-lg">{top3[1].name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="font-semibold text-[13px] truncate">{top3[1].name}</p>
                                <p className="text-xl font-extrabold text-primary mt-1">{top3[1].totalPoints}</p>
                                <p className="text-[9px] text-muted-foreground">points</p>
                            </div>

                            {/* 1st */}
                            <div className="glass-card p-6 text-center w-36 sm:w-44 border-primary/30 glow-primary animate-fade-in-up relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 gradient-primary rounded-full text-[9px] font-bold text-white uppercase tracking-wider">
                                    Champion
                                </div>
                                <div className="text-4xl mb-3 mt-1">🥇</div>
                                <Avatar className="w-14 h-14 mx-auto mb-2 border-2 border-primary/40 ring-2 ring-primary/20">
                                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">{top3[0].name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="font-bold text-[14px]">{top3[0].name}</p>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                    <Star className="w-4 h-4 fill-[oklch(0.85_0.16_80)] text-[oklch(0.85_0.16_80)]" />
                                    <span className="text-2xl font-extrabold text-gradient-primary">{top3[0].totalPoints}</span>
                                </div>
                                <p className="text-[9px] text-muted-foreground">points</p>
                            </div>

                            {/* 3rd */}
                            <div className="glass-card p-5 text-center w-32 sm:w-40 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                                <div className="text-3xl mb-3">🥉</div>
                                <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-border/40">
                                    <AvatarFallback className="bg-primary/15 text-primary font-bold text-lg">{top3[2].name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="font-semibold text-[13px] truncate">{top3[2].name}</p>
                                <p className="text-xl font-extrabold text-primary mt-1">{top3[2].totalPoints}</p>
                                <p className="text-[9px] text-muted-foreground">points</p>
                            </div>
                        </div>
                    )}

                    {/* Full Table */}
                    <div className="glass-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                        {/* Header */}
                        <div className="hidden sm:grid grid-cols-[50px_1fr_90px_110px_70px_90px] px-5 py-3 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.15em] border-b border-border/30">
                            <span>#</span>
                            <span>Member</span>
                            <span className="text-center">Goals</span>
                            <span className="text-center">Completion</span>
                            <span className="text-center">Streak</span>
                            <span className="text-right">Points</span>
                        </div>

                        {/* Rows */}
                        {leaderboard.map((entry, i) => (
                            <div
                                key={entry.memberId}
                                className={`grid grid-cols-[50px_1fr_90px_110px_70px_90px] px-5 py-3.5 items-center hover:bg-accent/30 transition-colors ${entry.rank <= 3 ? "bg-primary/[0.03]" : ""} ${i < leaderboard.length - 1 ? "border-b border-border/15" : ""}`}
                            >
                                <span className="text-base font-bold">
                                    {entry.rank <= 3 ? (
                                        <span>{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}</span>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">{entry.rank}</span>
                                    )}
                                </span>

                                <div className="flex items-center gap-2.5">
                                    <Avatar className="w-7 h-7">
                                        <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-bold">{entry.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-[13px]">{entry.name}</span>
                                </div>

                                <div className="text-center">
                                    <span className="text-[13px] font-semibold flex items-center justify-center gap-1">
                                        <Target className="w-3 h-3 text-primary" /> {entry.goalsCompleted}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 px-1">
                                    <Progress value={entry.completionRate} className="h-[5px] flex-1" />
                                    <span className="text-[11px] font-bold w-7 text-right">{entry.completionRate}%</span>
                                </div>

                                <div className="text-center">
                                    <span className="text-[13px] font-semibold flex items-center justify-center gap-1">
                                        <Flame className="w-3 h-3 text-[oklch(0.72_0.18_55)]" /> {entry.currentStreak}
                                    </span>
                                </div>

                                <div className="text-right">
                                    <span className="text-[13px] font-extrabold text-primary">{entry.totalPoints}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
