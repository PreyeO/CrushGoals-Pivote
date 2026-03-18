"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const { sidebarCollapsed, fetchInitialData, isLoading, user } = useStore();

    useEffect(() => {
        let mounted = true;
        if (mounted && !isLoading && !user) {
            fetchInitialData();
        }
        return () => { mounted = false; };
    }, [fetchInitialData, isLoading, user]);

    // Give it a skeleton or just render children while loading
    // Since the server already verified the user is an admin, it's safe to just fetch in background
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
            <Sidebar />
            <main className={cn(
                "transition-all duration-300 w-full h-full flex-1",
                sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
            )}>
                {children}
            </main>
        </div>
    );
}
