"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

const DashboardMain = dynamic(
  () =>
    import("@/components/dashboard/DashboardMain").then(
      (mod) => mod.DashboardMain,
    ),
  { ssr: false },
);

export default function DashboardPage() {
  const organizations = useStore((state) => state.organizations);
  const members = useStore((state) => state.members);
  const user = useStore((state) => state.user);
  const isLoading = useStore((state) => state.isLoading);
  const fetchInitialData = useStore((state) => state.fetchInitialData);
  const router = useRouter();

  // Fetch data on mount if not already loaded or loading
  useEffect(() => {
    // Note: To avoid double fetching, we can check if we already have the user and orgs
    // but fetchInitialData internally triggers loading state. We only want to run this once.
    let mounted = true;
    if (mounted && !isLoading && !user) {
         fetchInitialData();
    }
    return () => { mounted = false; };
  }, [fetchInitialData, isLoading, user]);

  // Redirect logic after data is loaded
  useEffect(() => {
    if (isLoading || !user) return; // Wait for data to load
    
    // Check if user is owner/admin of any organization
    const isOwnerOrAdmin = members.some(
      (m) =>
        m.userId === user?.id && (m.role === "owner" || m.role === "admin"),
    );

    // Only redirect if absolutely no orgs exist but user is loaded and not admin anywhere
    if (organizations.length === 0) {
      router.push("/");
      return;
    }

    // If user has orgs but is not owner/admin of any, redirect to first org
    if (!isOwnerOrAdmin && organizations.length > 0) {
      router.push(`/org/${organizations[0].id}`);
    }
  }, [isLoading, organizations.length, members, user, router]);

  // Make sure we at least show a loading state instead of null when resolving
  if (isLoading || !user) {
      return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
            <Sidebar />
            <main className="lg:pl-[260px] transition-all duration-300 w-full h-full"> 
                <DashboardSkeleton />
            </main>
        </div>
      );
  }

  const isOwnerOrAdmin = members.some(
    (m) => m.userId === user?.id && (m.role === "owner" || m.role === "admin"),
  );

  // If user has loaded, and we are preparing to redirect, still render the layout skeleton to prevent flashes of nothing.
  if (organizations.length === 0 || !isOwnerOrAdmin) {
       return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
            <Sidebar />
            <main className="lg:pl-[260px] transition-all duration-300 w-full h-full"> 
                <DashboardSkeleton />
            </main>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Sidebar />
      <main className="lg:pl-65 transition-all duration-300">
        <DashboardMain />
      </main>
    </div>
  );
}
