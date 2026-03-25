"use client";

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Users, Plus, Mail, Search, ExternalLink } from "lucide-react";
import type { OrgRole, OrgMember } from "@/types";
import { InviteMemberModal } from "@/components/invite-member-modal";
import { OrgMembersList } from "@/components/org/OrgMembersList";
import { OrgInvitationsList } from "@/components/org/OrgInvitationsList";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { toast } from "sonner";



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
    
    // Filter invitations: only pending AND less than 7 days old
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const pendingInvites = invitations.filter(i => {
        const isPending = i.orgId === orgId && i.status === 'pending';
        const isRecent = new Date(i.createdAt) > sevenDaysAgo;
        return isPending && isRecent;
    });

    const filteredMembers = membersList.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.role.toLowerCase().includes(search.toLowerCase()) ||
            (m.email || "").toLowerCase().includes(search.toLowerCase()),
    );

    const filteredInvites = pendingInvites.filter((i) =>
        i.email.toLowerCase().includes(search.toLowerCase()),
    );



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
                    <OrgMembersList filteredMembers={filteredMembers} goals={goals} orgId={orgId} />
                </TabsContent>

                {/* Invitations Tab */}
                <TabsContent value="invitations" className="mt-0 animate-in fade-in duration-300">
                    <OrgInvitationsList filteredInvites={filteredInvites} orgId={orgId} isMemberOnly={isMemberOnly} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
