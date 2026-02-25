"use client";

import { getOrganizations, currentUser } from "@/lib/mock-data";
import { Sidebar } from "@/components/sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Users, Target, ArrowRight, Sparkles } from "lucide-react";

export default function DashboardPage() {
    const orgs = getOrganizations();

    const totalGoals = orgs.reduce((s, o) => s + o.goalCount, 0);
    const totalMembers = orgs.reduce((s, o) => s + o.memberCount, 0);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className="lg:pl-[260px] transition-all duration-300">
                <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-6xl mx-auto">
                    {/* Header */}
                    <header className="mb-8 animate-fade-in">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Welcome back, {currentUser.name.split(" ")[0]}
                            </h1>
                            <span className="text-2xl">👋</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            You&apos;re managing {orgs.length} organizations with {totalMembers} members and {totalGoals} active goals.
                        </p>
                    </header>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8 stagger">
                        {[
                            { label: "Organizations", value: orgs.length, icon: "🏢" },
                            { label: "Team Members", value: totalMembers, icon: "👥" },
                            { label: "Active Goals", value: totalGoals, icon: "🎯" },
                        ].map((s) => (
                            <div key={s.label} className="glass-card p-5 text-center animate-fade-in-up">
                                <span className="text-2xl mb-2 block">{s.icon}</span>
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Org Cards */}
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Your Organizations</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
                        {orgs.map((org) => (
                            <Link href={`/org/${org.id}`} key={org.id} className="block">
                                <div className="glass-card-hover p-6 animate-fade-in-up group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-accent/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                            {org.emoji}
                                        </div>
                                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wider">
                                            {org.plan}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">{org.name}</h3>
                                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                                        {org.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-4">
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-3 h-3" /> {org.memberCount}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Target className="w-3 h-3" /> {org.goalCount} goals
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                                            <span className="text-muted-foreground">Goal Completion</span>
                                            <span className="font-bold text-primary">{org.completionRate}%</span>
                                        </div>
                                        <Progress value={org.completionRate} className="h-1.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Create Org */}
                        <div className="glass-card border-dashed !border-2 !border-border/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:!border-primary/30 transition-all animate-fade-in-up group">
                            <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors group-hover:scale-105 transition-transform">
                                <Plus className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-sm mb-1">Create Organization</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Set up a new team and start tracking goals together.
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 glass-card p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Quick Actions
                        </h2>
                        <div className="grid sm:grid-cols-3 gap-3">
                            {[
                                { label: `Go to ${orgs[0]?.name || "your org"}`, desc: "View dashboard and goals", href: `/org/${orgs[0]?.id || ""}` },
                                { label: "View Team Goals", desc: "Track progress and milestones", href: `/org/${orgs[0]?.id || ""}/goals` },
                                { label: "Team Leaderboard", desc: "See who's crushing it", href: `/org/${orgs[0]?.id || ""}/leaderboard` },
                            ].map((action) => (
                                <Link key={action.label} href={action.href}>
                                    <div className="p-4 rounded-xl bg-accent/30 hover:bg-accent/60 transition-colors group/action cursor-pointer">
                                        <p className="font-medium text-[13px] mb-0.5 group-hover/action:text-primary transition-colors">{action.label}</p>
                                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            {action.desc}
                                            <ArrowRight className="w-3 h-3 opacity-0 group-hover/action:opacity-100 transition-opacity" />
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
