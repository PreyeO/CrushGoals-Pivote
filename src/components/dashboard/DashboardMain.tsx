"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { OrganizationGrid } from "./OrganizationGrid";
import { QuickActions } from "./QuickActions";
import { DashboardGoals } from "./DashboardGoals";
import { Organization } from "@/types";
import { useRouter } from "next/navigation";

export function DashboardMain() {
    const router = useRouter();
    const { organizations: orgs, members, fetchInitialData, isLoading, user } = useStore();

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const isOwnerOrAdmin = members.some(m => m.userId === user?.id && (m.role === 'owner' || m.role === 'admin'));

    // Handle redirection if user only belongs to one organization
    // Only redirect if NOT an owner or admin (invitees/members only)
    useEffect(() => {
        if (!isLoading && orgs.length === 1 && !isOwnerOrAdmin) {
            router.push(`/org/${orgs[0].id}`);
        }
    }, [orgs, isOwnerOrAdmin, isLoading, router]);

    if (isLoading || (orgs.length === 1 && !isOwnerOrAdmin)) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse text-muted-foreground font-medium">
                    {orgs.length === 1 && !isOwnerOrAdmin ? "Redirecting to your organization..." : "Loading Dashboard..."}
                </div>
            </div>
        );
    }

    const totalGoals = orgs.reduce((s: number, o: Organization) => s + (o.goalCount || 0), 0);
    const totalMembers = orgs.reduce((s: number, o: Organization) => s + (o.memberCount || 0), 0);

    return (
        <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-6xl mx-auto">
            <DashboardHeader
                organizations={orgs}
                memberCount={totalMembers}
                goalCount={totalGoals}
                showCreateOrg={isOwnerOrAdmin}
            />

            <DashboardStats
                orgCount={orgs.length}
                memberCount={totalMembers}
                goalCount={totalGoals}
            />

            <DashboardGoals />

            <OrganizationGrid
                organizations={orgs}
                showCreateCard={isOwnerOrAdmin}
            />

            <QuickActions organizations={orgs} />
        </div>
    );
}
