"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Users, Plus, Mail, Shield, ShieldCheck, Crown, Clock,
    Target, Flame, Search, ChevronRight, Trash2, Copy, ExternalLink
} from "lucide-react";
import type { OrgRole, OrgMember } from "@/types";
import { InviteMemberModal } from "@/components/invite-member-modal";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const roleStyles: Record<OrgRole, { label: string; class: string; icon: React.ElementType }> = {
    owner: { label: "Owner", class: "bg-[oklch(0.60_0.16_80_/_0.15)] text-[oklch(0.78_0.14_80)]", icon: Crown },
    admin: { label: "Admin", class: "bg-[oklch(0.55_0.20_250_/_0.15)] text-[oklch(0.70_0.18_250)]", icon: ShieldCheck },
    member: { label: "Member", class: "bg-muted/60 text-muted-foreground", icon: Shield },
};

export default function OrgMembersPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [mounted, setMounted] = useState(false);
    const [search, setSearch] = useState("");

    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const isLoading = useStore((state) => state.isLoading);
    const members = useStore(useShallow((state) => state.members));
    const invitations = useStore(useShallow((state) => state.invitations));
    const user = useStore(useShallow((state) => state.user));
    const goals = useStore(useShallow((state) => state.goals));
    const cancelInvitation = useStore((state) => state.cancelInvitation);

    useEffect(() => {
        setMounted(true);
        fetchInitialData(orgId);
    }, [orgId, fetchInitialData]);

    if (!mounted || (isLoading && members.length === 0)) return (
        <div className="p-8 flex items-center justify-center min-h-[50vh] animate-pulse">
            Loading Members...
        </div>
    );

    const membersList = members.filter(m => m.orgId === orgId);
    const myMember = membersList.find(m => m.userId === user?.id);
    const isMemberOnly = myMember?.role === "member";
    const pendingInvites = invitations.filter(i => i.orgId === orgId && i.status === 'pending');

    const filteredMembers = membersList.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.role.toLowerCase().includes(search.toLowerCase()) ||
            (m.email || "").toLowerCase().includes(search.toLowerCase()),
    );

    const filteredInvites = pendingInvites.filter((i) =>
        i.email.toLowerCase().includes(search.toLowerCase()),
    );

    const handleCopyInviteLink = (invite: any) => {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/invite/${invite.token}`;
        navigator.clipboard.writeText(link);
        toast.success("Invitation link copied!");
    };

    const handleCancelInvite = async (id: string) => {
        try {
            await cancelInvitation(id);
            toast.success("Invitation canceled");
        } catch {
            toast.error("Failed to cancel invitation");
        }
    };

    return (
        <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto">
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
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 h-9 w-48 bg-accent/20 border-border/40 text-[13px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {!isMemberOnly && (
                        <InviteMemberModal orgId={orgId}>
                            <Button className="gradient-primary text-white border-0 hover:opacity-90 gap-2 h-9 text-[13px] font-semibold">
                                <Plus className="w-4 h-4" /> Invite
                            </Button>
                        </InviteMemberModal>
                    )}
                </div>
            </div>

            {/* Tabs: Members / Invitations */}
            <Tabs defaultValue="members" className="w-full">
                <TabsList className="bg-accent/40 p-1 h-auto mb-6">
                    <TabsTrigger
                        value="members"
                        className="text-[12px] px-4 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary gap-2"
                    >
                        <Users className="w-3.5 h-3.5" />
                        Members
                        <span className="text-[10px] opacity-60 ml-0.5">{filteredMembers.length}</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="invitations"
                        className="text-[12px] px-4 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary gap-2"
                    >
                        <Mail className="w-3.5 h-3.5" />
                        Invitations
                        {pendingInvites.length > 0 && (
                            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                                {filteredInvites.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Members Tab */}
                <TabsContent value="members" className="mt-0 animate-in fade-in duration-300">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                        {filteredMembers.map((member) => {
                            const r = roleStyles[member.role];
                            const memberGoals = goals.filter(
                                (g) => g.orgId === orgId && g.assignedTo.includes(member.id)
                            );
                            const behindGoals = memberGoals.filter(g => {
                                if (g.status === "completed") return false;
                                const now = Date.now();
                                const start = new Date(g.startDate || g.createdAt).getTime();
                                const end = new Date(g.deadline).getTime();
                                const totalTime = end - start;
                                const elapsed = now - start;
                                const expected = totalTime > 0 ? Math.round((elapsed / totalTime) * 100) : 0;
                                return g.progress < expected - 15;
                            });
                            const blockedGoals = memberGoals.filter(g => g.status === "blocked");

                            return (
                                <Link
                                    key={member.id}
                                    href={`/org/${orgId}/members/${member.id}`}
                                    className="block"
                                >
                                    <div className="glass-card-hover p-5 animate-fade-in-up group cursor-pointer relative overflow-hidden">
                                        {/* Subtle status indicators */}
                                        {blockedGoals.length > 0 && (
                                            <div className="absolute top-0 right-0 px-2 py-0.5 bg-destructive text-white text-[9px] font-bold uppercase tracking-wider rounded-bl-lg">
                                                {blockedGoals.length} Blocked
                                            </div>
                                        )}
                                        {behindGoals.length > 0 && blockedGoals.length === 0 && (
                                            <div className="absolute top-0 right-0 px-2 py-0.5 bg-yellow-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-bl-lg">
                                                {behindGoals.length} Behind
                                            </div>
                                        )}

                                        {/* Profile */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <Avatar className="w-11 h-11 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                                                <AvatarFallback className="bg-primary/15 text-primary font-bold text-sm">
                                                    {member.name.split(" ").map((n) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-[13px] truncate group-hover:text-primary transition-colors">{member.name}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{member.email || "No email"}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
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
                                </Link>
                            );
                        })}
                    </div>
                    {filteredMembers.length === 0 && (
                        <div className="glass-card p-12 text-center">
                            <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No members match your search.</p>
                        </div>
                    )}
                </TabsContent>

                {/* Invitations Tab */}
                <TabsContent value="invitations" className="mt-0 animate-in fade-in duration-300">
                    {filteredInvites.length > 0 ? (
                        <div className="space-y-3">
                            {filteredInvites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className="glass-card p-4 border-dashed border-border/60 flex items-center justify-between group bg-accent/5 hover:border-primary/30 transition-all animate-in slide-in-from-left-4 duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-dashed border-border/60">
                                            <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm leading-none mb-1">{invite.email}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] h-4 uppercase tracking-widest font-black py-0 px-1.5 border-primary/20 bg-primary/5 text-primary"
                                                >
                                                    {invite.role}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground italic">
                                                    Awaiting acceptance...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCopyInviteLink(invite)}
                                            className="h-8 text-[11px] font-bold gap-2 border-border/60 hover:bg-accent/60"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy Link
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleCancelInvite(invite.id)}
                                            className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center border-dashed">
                            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-sm font-bold text-foreground mb-1">No pending invitations</h3>
                            <p className="text-xs text-muted-foreground mb-6">
                                Invite team members to start collaborating on goals.
                            </p>
                            {!isMemberOnly && (
                                <InviteMemberModal orgId={orgId}>
                                    <Button className="gradient-primary text-white border-0 gap-2 h-9 text-[13px] font-semibold">
                                        <Plus className="w-4 h-4" /> Invite Member
                                    </Button>
                                </InviteMemberModal>
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
