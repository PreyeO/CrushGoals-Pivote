"use client";

import { currentUser } from "@/lib/mock-data";
import { Organization } from "@/types";

interface DashboardHeaderProps {
    orgCount: number;
    memberCount: number;
    goalCount: number;
}

export function DashboardHeader({ orgCount, memberCount, goalCount }: DashboardHeaderProps) {
    return (
        <header className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Welcome back, {currentUser.name.split(" ")[0]}
                </h1>
                <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm text-muted-foreground">
                You&apos;re managing {orgCount} organizations with {memberCount} members and {goalCount} active goals.
            </p>
        </header>
    );
}
