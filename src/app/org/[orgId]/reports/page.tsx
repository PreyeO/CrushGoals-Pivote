"use client";

import { use, useState } from "react";
import { useStore } from "@/lib/store";
import { notFound } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { reportService } from "@/lib/services/reportService";
import { toast } from "sonner";
import { ReportStatCards } from "@/components/org/ReportStatCards";
import { ReportMonthlyChart } from "@/components/org/ReportMonthlyChart";
import { ReportTopBlockers } from "@/components/org/ReportTopBlockers";
import { ReportMemberTable } from "@/components/org/ReportMemberTable";
import { ReportsHeader } from "@/components/org/ReportsHeader";
import { useReportsData } from "@/hooks/useReportsData";

export default function OrgReportsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);
  const [isExporting, setIsExporting] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<
    "month" | "quarter" | "year" | "all"
  >("month");

  const isLoading = useStore((state) => state.isLoading);
  const org = useStore(
    useShallow((state) => state.organizations.find((o) => o.id === orgId)),
  );
  const allGoals = useStore(
    useShallow((state) => state.goals.filter((g) => g.orgId === orgId)),
  );
  const members = useStore(
    useShallow((state) => state.members.filter((m) => m.orgId === orgId)),
  );

  const {
    goals,
    completedGoals,
    blockedGoals,
    monthlyData,
    memberStats,
    topBlockers,
    avgProgress,
  } = useReportsData({ allGoals, members, filterPeriod });

  const handleDownloadCSV = () => {
    if (!goals.length) {
      toast.error("No data available to export for this period.");
      return;
    }

    try {
      setIsExporting(true);
      const csv = reportService.generateCSV(goals);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `crushgoals_report_${org?.name.toLowerCase().replace(/\s+/g, "_")}_${filterPeriod}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV report downloaded successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to generate CSV report.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && !org)
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh] animate-pulse">
        Loading Reports...
      </div>
    );
  if (!org) return notFound();

  return (
    <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto">
      <ReportsHeader
        org={org}
        filterPeriod={filterPeriod}
        setFilterPeriod={setFilterPeriod}
        onExportCSV={handleDownloadCSV}
        isExporting={isExporting}
      />

      <ReportStatCards
        avgProgress={avgProgress}
        completedGoalsCount={completedGoals.length}
        blockedGoalsCount={blockedGoals.length}
        monthlyVelocity={monthlyData[5].count}
      />

      <div className="grid lg:grid-cols-3 gap-6 animate-fade-in-up">
        <ReportMonthlyChart monthlyData={monthlyData} />
        <ReportTopBlockers
          topBlockers={topBlockers}
          totalBlocked={blockedGoals.length}
        />
        <ReportMemberTable memberStats={memberStats} />
      </div>
    </div>
  );
}
