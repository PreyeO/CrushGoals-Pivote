"use client";

import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { LoadingState } from "@/components/ui/LoadingState";
import { notFound } from "next/navigation";

export default function OrgLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ orgId: string }>;
}) {
    const { orgId } = use(params);
    const [mounted, setMounted] = useState(false);

    const {
        organizations: allOrgs,
        fetchInitialData,
        isLoading
    } = useStore();

    const org = allOrgs.find((o) => o.id === orgId);

    useEffect(() => {
        setMounted(true);
        fetchInitialData(orgId);
    }, [orgId, fetchInitialData]);

    if (!mounted) return null;

    // Only show "Not Found" if we're done loading and the org really doesn't exist
    if (!isLoading && !org && allOrgs.length > 0) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar currentOrgId={orgId} />
            <main className="lg:pl-[260px] transition-all duration-300">
                {isLoading && !org ? (
                    <div className="min-h-[80vh] flex items-center justify-center">
                        <LoadingState fullScreen={false} message="Loading organization..." />
                    </div>
                ) : (
                    children
                )}
            </main>
        </div>
    );
}
