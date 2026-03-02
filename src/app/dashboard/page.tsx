"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { DashboardMain } from "@/components/dashboard/DashboardMain";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Sidebar />
      <main className="lg:pl-[260px] transition-all duration-300">
        <DashboardMain />
      </main>
    </div>
  );
}
