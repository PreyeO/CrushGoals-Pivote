"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { cn } from "@/lib/utils";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { WelcomeSkeleton } from "@/components/dashboard/WelcomeSkeleton";

const DashboardMain = dynamic(
  () =>
    import("@/components/dashboard/DashboardMain").then(
      (mod) => mod.DashboardMain,
    ),
  { ssr: false },
);

export default function DashboardPage() {
  const {
    sidebarCollapsed,
    fetchInitialData,
    isLoading,
    user,
    organizations,
    members,
    pendingInvitations,
  } = useStore();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    if (mounted && !isLoading && !user) {
      fetchInitialData();
    }
    return () => {
      mounted = false;
    };
  }, [fetchInitialData, isLoading, user]);

  useEffect(() => {
    // If there's a plan param, let the SearchParamHandler handle the redirect
    if (isLoading || !user) return;

    const isOwnerOrAdmin = members.some(
      (m) =>
        m.userId === user?.id && (m.role === "owner" || m.role === "admin"),
    );

    if (organizations.length === 0) {
      if (pendingInvitations.length === 1) {
        router.push(`/invite/${pendingInvitations[0].token}`);
      } else if (pendingInvitations.length > 1) {
        router.push("/invitations");
      } else if (user?.email === "ayibakep@gmail.com") {
        router.push("/admin");
      }
      return;
    }

    // Default redirection if no plan param is present
    // We can't easily check searchParams here without breaking the Suspense rule for the whole page,
    // so we let the landing-to-billing flow take precedence if plan exists.
    if (!isOwnerOrAdmin && organizations.length > 0) {
      // Small delay or check to ensure we don't conflict with SearchParamHandler
      // In practice, if a plan exists, SearchParamHandler's push will happen.
      router.push(`/org/${organizations[0].id}`);
    }
  }, [
    isLoading,
    organizations,
    members,
    user,
    pendingInvitations,
    router,
  ]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
        <Sidebar />
        <main
          className={cn(
            "transition-all duration-300 w-full h-full",
            sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]",
          )}
        >
          {organizations.length === 0 ? <WelcomeSkeleton /> : <DashboardSkeleton />}
        </main>
      </div>
    );
  }

  const isOwnerOrAdmin = members.some(
    (m) => m.userId === user?.id && (m.role === "owner" || m.role === "admin"),
  );

  // If the user has no org but HAS pending invitations, the useEffect above
  // is about to redirect them to the invite page. Render a skeleton instead
  // of EmptyDashboard so invited users never see the "Create Organization" modal.
  if (organizations.length === 0) {
    if (pendingInvitations.length > 0) {
      return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
          <Sidebar />
          <main
            className={cn(
              "transition-all duration-300 w-full h-full",
              sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]",
            )}
          >
            <WelcomeSkeleton />
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
        <Sidebar />
        <main
          className={cn(
            "transition-all duration-300 w-full h-full",
            sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]",
          )}
        >
          <EmptyDashboard />
        </main>
      </div>
    );
  }

  if (!isOwnerOrAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
        <Sidebar />
        <main
          className={cn(
            "transition-all duration-300 w-full h-full",
            sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]",
          )}
        >
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Sidebar />
      <main
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]",
        )}
      >
        <DashboardMain />
      </main>
    </div>
  );
}
