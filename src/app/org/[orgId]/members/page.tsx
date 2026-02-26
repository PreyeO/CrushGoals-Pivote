"use client";

import { use } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Plus, Mail, Shield, ShieldCheck, Crown, Clock, Target, Flame } from "lucide-react";
import { notFound } from "next/navigation";
import type { OrgRole } from "@/types";
import { InviteMemberModal } from "@/components/invite-member-modal";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

const roleStyles: Record<OrgRole, { label: string; class: string; icon: React.ElementType }> = {
    owner: { label: "Owner", class: "bg-[oklch(0.60_0.16_80_/_0.15)] text-[oklch(0.78_0.14_80)]", icon: Crown },
    admin: { label: "Admin", class: "bg-[oklch(0.55_0.20_250_/_0.15)] text-[oklch(0.70_0.18_250)]", icon: ShieldCheck },
    member: { label: "Member", class: "bg-muted/60 text-muted-foreground", icon: Shield },
};

export default function OrgMembersPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const orgs = useStore(useShallow((state) => state.organizations));
    const members = useStore(useShallow((state) => state.members));
    const user = useStore(useShallow((state) => state.user));

    const org = orgs.find(o => o.id === orgId);
    if (!org) return notFound();

    const membersList = members.filter(m => m.orgId === orgId);
    const myMember = membersList.find(m => m.userId === user?.id);
    const isMemberOnly = myMember?.role === "member";

    const pendingInvites = []; // TODO: Implement real invites fetch if needed

    return (
        <div className="min-h-screen bg-background">
            <Sidebar currentOrgId={orgId} />
            <main className="lg:pl-[260px] transition-all duration-300">
                <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Members
                            </h1>
                            <p className="text-[13px] text-muted-foreground mt-1">
                                {membersList.length} members · {pendingInvites.length} pending invite{pendingInvites.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                        {!isMemberOnly && (
                            <InviteMemberModal orgId={orgId}>
                                <Button className="gradient-primary text-white border-0 hover:opacity-90 gap-2 h-9 text-[13px] font-semibold self-start">
                                    <Plus className="w-4 h-4" /> Invite Member
                                </Button>
                            </InviteMemberModal>
                        )}
                    </div>

                    {/* Pending Invites */}
                    {pendingInvites.length > 0 && (
                        <div className="mb-8 animate-fade-in-up">
                            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] mb-3">Pending Invites</p>
                            <div className="space-y-2">
                                {pendingInvites.map((inv) => (
                                    <div key={inv.id} className="glass-card p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-medium">{inv.email}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge className="bg-[oklch(0.60_0.16_80_/_0.12)] text-[oklch(0.78_0.14_80)] text-[9px] gap-1">
                                                        <Clock className="w-2.5 h-2.5" /> Pending
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground">as {inv.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-[11px] text-primary hover:text-primary h-7">Resend</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Members Grid */}
                    <div>
                        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] mb-3">Team Members</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                            {membersList.map((member) => {
                                const r = roleStyles[member.role];
                                return (
                                    <div key={member.id} className="glass-card-hover p-5 animate-fade-in-up group">
                                        {/* Profile */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <Avatar className="w-11 h-11 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                                                <AvatarFallback className="bg-primary/15 text-primary font-bold text-sm">
                                                    {member.name.split(" ").map((n) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-[13px] truncate">{member.name}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                                            </div>
                                        </div>

                                        <Badge className={`${r.class} text-[9px] gap-1 mb-4`}>
                                            <r.icon className="w-2.5 h-2.5" /> {r.label}
                                        </Badge>

                                        {/* Stats */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-muted-foreground flex items-center gap-1.5">
                                                    <Target className="w-3 h-3" /> Goals
                                                </span>
                                                <span className="font-bold">{member.goalsCompleted}<span className="text-muted-foreground font-normal">/{member.goalsAssigned}</span></span>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between text-[11px] mb-1.5">
                                                    <span className="text-muted-foreground">Completion</span>
                                                    <span className="font-bold text-primary">{member.completionRate}%</span>
                                                </div>
                                                <Progress value={member.completionRate} className="h-[5px]" />
                                            </div>
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-muted-foreground flex items-center gap-1.5">
                                                    <Flame className="w-3 h-3 text-[oklch(0.72_0.18_55)]" /> Streak
                                                </span>
                                                <span className="font-bold">{member.currentStreak} days</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-border/20 text-[9px] text-muted-foreground/50">
                                            Joined {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
