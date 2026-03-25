"use client";
import { Users, Building2, Target, DollarSign, Activity } from "lucide-react";
import type { PlatformStats, RecentPayment, GrowthPoint } from "@/lib/services/admin";
import { AdminPageHeader } from "./shared/AdminPageHeader";
import { StatusCard } from "./shared/StatusCard";
import { GrowthChart } from "./dashboard/GrowthChart";
import { PlanDistribution } from "./dashboard/PlanDistribution";
import { PaymentsTable } from "./dashboard/PaymentsTable";
import { SystemStatus } from "./dashboard/SystemStatus";

interface AdminDashboardProps {
  stats: PlatformStats;
  payments: RecentPayment[];
  growth: GrowthPoint[];
}

export function AdminDashboard({
  stats,
  payments,
  growth,
}: AdminDashboardProps) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageHeader 
        title="Super Admin Dashboard"
        description="Platform-wide analytics and performance metrics."
        icon={Activity}
      />

      {/* Primary Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger">
        <StatusCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend="+12% this month"
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatusCard
          title="Organizations"
          value={stats.totalOrgs}
          icon={Building2}
          trend="+5% this month"
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatusCard
          title="Active Goals"
          value={stats.totalGoals}
          icon={Target}
          trend="+18% this month"
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatusCard
          title="Real-time MRR"
          value={`$${stats.billing.mrr.toLocaleString()}`}
          icon={DollarSign}
          trend="Last 30 days"
          color="text-purple-500"
          bg="bg-purple-500/10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <GrowthChart data={growth} />
        <PlanDistribution stats={stats} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PaymentsTable payments={payments} />
        <SystemStatus />
      </div>
    </div>
  );
}
