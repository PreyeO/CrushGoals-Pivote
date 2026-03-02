"use client";

import { Sidebar } from "@/components/layout/sidebar";
import dynamic from "next/dynamic";

const DashboardMain = dynamic(
  () => import("@/components/dashboard/DashboardMain").then((mod) => mod.DashboardMain),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Sidebar />
      <main className="lg:pl-65 transition-all duration-300">
        <DashboardMain />
      </main>
    </div>
  );
}
