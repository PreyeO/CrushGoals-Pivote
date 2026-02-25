"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { OrganizationGrid } from "@/components/dashboard/OrganizationGrid";
import { QuickActions } from "@/components/dashboard/QuickActions";
import type { Organization } from "@/types";

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const orgs = useStore(useShallow((state) => state.organizations));

    if (!mounted) return null;

    const totalGoals = orgs.reduce((s: number, o: Organization) => s + (o.goalCount || 0), 0);
    const totalMembers = orgs.reduce((s: number, o: Organization) => s + (o.memberCount || 0), 0);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className="lg:pl-[260px] transition-all duration-300">
                <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-6xl mx-auto">
                    <DashboardHeader
                        orgCount={orgs.length}
                        memberCount={totalMembers}
                        goalCount={totalGoals}
                    />

                    <DashboardStats
                        orgCount={orgs.length}
                        memberCount={totalMembers}
                        goalCount={totalGoals}
                    />

                    <OrganizationGrid organizations={orgs} />

                    <QuickActions organizations={orgs} />
                </div>
            </main>
        </div>
    );
}
