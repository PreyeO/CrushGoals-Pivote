"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { cn } from "@/lib/utils";
import { CreateOrgModal } from "@/components/create-org-modal";
import { toast } from "sonner";

const DashboardMain = dynamic(
  () =>
    import("@/components/dashboard/DashboardMain").then(
      (mod) => mod.DashboardMain,
    ),
  { ssr: false },
);

export default function DashboardPage() {
  const { sidebarCollapsed, fetchInitialData, isLoading, user, organizations, members, pendingInvitations } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const payment = searchParams.get("payment");
    const tier = searchParams.get("tier");
    
    if (payment === "success") {
      toast.success(`Success! Your account has been upgraded to ${tier?.toUpperCase()}.`, {
        description: "You now have access to all premium features.",
        duration: 5000,
      });
      // Clear URL params
      router.replace("/dashboard");
    } else if (payment === "failed") {
      toast.error("Payment failed. Please try again or contact support.");
      router.replace("/dashboard");
    } else if (payment === "error") {
      toast.error("An error occurred during payment verification.");
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  useEffect(() => {
    let mounted = true;
    if (mounted && !isLoading && !user) {
         fetchInitialData();
    }
    return () => { mounted = false; };
  }, [fetchInitialData, isLoading, user]);

  useEffect(() => {
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

    if (!isOwnerOrAdmin && organizations.length > 0) {
      router.push(`/org/${organizations[0].id}`);
    }
  }, [isLoading, organizations.length, members, user, pendingInvitations, router]);

  if (isLoading || !user) {
      return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
            <Sidebar />
            <main className={cn(
                "transition-all duration-300 w-full h-full",
                sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
            )}> 
                <DashboardSkeleton />
            </main>
        </div>
      );
  }

  const isOwnerOrAdmin = members.some(
    (m) => m.userId === user?.id && (m.role === "owner" || m.role === "admin"),
  );

  if (organizations.length === 0) {
     return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full glass-card p-10 space-y-6 animate-fade-in-up">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2 text-3xl">
                    👋
                </div>
                <div>
                   <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome to CrushGoals</h1>
                   <p className="text-sm text-muted-foreground leading-relaxed text-balance">
                      You don't belong to any organizations yet. Create your first workspace to start tracking goals and collaborating with your team.
                   </p>
                </div>
                <div className="pt-2 flex flex-col gap-3">
                    <CreateOrgModal>
                         <button className="w-full h-12 gradient-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                             Create Organization
                         </button>
                    </CreateOrgModal>
                </div>
            </div>
        </div>
     );
  }

  if (!isOwnerOrAdmin) {
       return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
            <Sidebar />
            <main className={cn(
                "transition-all duration-300 w-full h-full",
                sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
            )}> 
                <DashboardSkeleton />
            </main>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Sidebar />
      <main className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
      )}>
        <DashboardMain />
      </main>
    </div>
  );
}
