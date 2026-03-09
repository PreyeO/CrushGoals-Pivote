"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";

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

  // Fetch data on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Redirect logic after data is loaded
  useEffect(() => {
    if (isLoading) return; // Wait for data to load

    if (organizations.length === 0) {
      router.push("/");
      return;
    }

    // Check if user is owner/admin of any organization
    const isOwnerOrAdmin = members.some(
      (m) =>
        m.userId === user?.id && (m.role === "owner" || m.role === "admin"),
    );

    // If user has orgs but is not owner/admin of any, redirect to first org
    if (!isOwnerOrAdmin && organizations.length > 0) {
      router.push(`/org/${organizations[0].id}`);
    }
  }, [isLoading, organizations.length, members, user?.id, router]);

  // Don't render if loading or redirecting
  const isOwnerOrAdmin = members.some(
    (m) => m.userId === user?.id && (m.role === "owner" || m.role === "admin"),
  );

  if (isLoading || organizations.length === 0 || !isOwnerOrAdmin) {
    return null;
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
