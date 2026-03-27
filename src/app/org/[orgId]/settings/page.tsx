"use client";

import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, LogOut } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BillingSettings } from "@/components/org/BillingSettings";
import { OrganizationGeneralSettings } from "@/components/org/OrganizationGeneralSettings";
import { OrganizationDangerZone } from "@/components/org/OrganizationDangerZone";

export default function OrgSettingsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const org = useStore(useShallow((state) => state.organizations.find((o) => o.id === orgId)));


    if (!org) return notFound();

    return (
        <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto">
            <header className="mb-8 animate-fade-in">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-primary" />
                    Organization Settings
                </h1>
                <p className="text-[13px] text-muted-foreground mt-1">
                    Manage your organization's workspace and preferences.
                </p>
            </header>

            <div className="space-y-8 animate-fade-in-up">
                {/* Profile Section */}
                <OrganizationGeneralSettings org={org} orgId={orgId} />

                {/* Subscription & Billing Section */}
                <Suspense fallback={<div className="h-64 animate-pulse bg-accent/20 rounded-3xl" />}>
                   <BillingSettings org={org} />
                </Suspense>

                {/* Danger Zone */}
                <OrganizationDangerZone org={org} orgId={orgId} />

                {/* Account & Session */}
                <section className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-muted-foreground" />
                        <h2 className="text-sm font-bold uppercase tracking-wider">Account & Session</h2>
                    </div>
                    <Separator className="opacity-10" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-[13px] font-semibold">Sign Out</p>
                            <p className="text-[11px] text-muted-foreground">Sign out of your current session. You will need to log in again to access your organizations.</p>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => useStore.getState().signOut()}
                            className="h-10 px-6 text-sm font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all gap-2"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
}
