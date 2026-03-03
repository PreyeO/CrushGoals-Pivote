"use client";

import { useEffect } from "react";
import { useStore, AppState } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { OrganizationGrid } from "./OrganizationGrid";
import { QuickActions } from "./QuickActions";
import { DashboardGoals } from "./DashboardGoals";
import { Organization, OrgMember } from "@/types";
import { useRouter } from "next/navigation";

export function DashboardMain() {
    const router = useRouter();
    const organizations = useStore(useShallow((state: AppState) => state.organizations));
    const members = useStore(useShallow((state: AppState) => state.members));
    const user = useStore(useShallow((state: AppState) => state.user));
    const isLoading = useStore((state: AppState) => state.isLoading);
    const fetchInitialData = useStore((state: AppState) => state.fetchInitialData);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const isOwnerOrAdmin = members.some(
        (m: OrgMember) => m.userId === user?.id && (m.role === "owner" || m.role === "admin"),
    );

    // Handle redirection if user only belongs to one organization
    // OR redirect to invitations if they have NO organizations
    useEffect(() => {
        if (isLoading) return;

        if (organizations.length === 1 && !isOwnerOrAdmin) {
            router.push(`/org/${organizations[0].id}`);
        } else if (organizations.length === 0) {
            // Check for pending invitations in the store
            const invitations = useStore.getState().invitations;
            if (invitations.length > 0) {
                router.push(`/invite/${invitations[0].token}`);
            }
        }
    }, [organizations, isOwnerOrAdmin, isLoading, router]);

    if (isLoading || (organizations.length === 1 && !isOwnerOrAdmin)) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse text-muted-foreground font-medium">
                    {organizations.length === 1 && !isOwnerOrAdmin
                        ? "Redirecting to your organization..."
                        : "Loading Dashboard..."}
                </div>
            </div>
        );
    }

    const totalGoals = organizations.reduce(
        (s: number, o: Organization) => s + (o.goalCount || 0),
        0,
    );
    const totalMembers = organizations.reduce(
        (s: number, o: Organization) => s + (o.memberCount || 0),
        0,
    );

    return (
        <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-6xl mx-auto">
            <DashboardHeader
                organizations={organizations}
                memberCount={totalMembers}
                goalCount={totalGoals}
                showCreateOrg={isOwnerOrAdmin}
            />

            <DashboardStats
                orgCount={organizations.length}
                memberCount={totalMembers}
                goalCount={totalGoals}
            />

            <DashboardGoals />

            <OrganizationGrid organizations={organizations} showCreateCard={isOwnerOrAdmin} />

            <QuickActions organizations={organizations} />
        </div>
    );
}
