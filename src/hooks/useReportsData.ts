import { useMemo } from "react";
import { OrgGoal, OrgMember } from "@/types";

interface UseReportsDataProps {
  allGoals: OrgGoal[];
  members: OrgMember[];
  filterPeriod: "month" | "quarter" | "year" | "all";
}

export function useReportsData({
  allGoals,
  members,
  filterPeriod,
}: UseReportsDataProps) {
  const goals = useMemo(() => {
    if (filterPeriod === "all") return allGoals;

    const now = new Date();
    const start = new Date();
    if (filterPeriod === "month") {
      start.setMonth(now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
    } else if (filterPeriod === "quarter") {
      start.setMonth(now.getMonth() - 3);
    } else if (filterPeriod === "year") {
      start.setFullYear(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
    }

    return allGoals.filter(
      (g) => new Date(g.createdAt) >= start || new Date(g.updatedAt) >= start,
    );
  }, [allGoals, filterPeriod]);

  const stats = useMemo(() => {
    const completedGoals = goals.filter((g) => g.status === "completed");
    const blockedGoals = goals.filter((g) => g.status === "blocked");
    const activeGoals = goals.filter((g) => g.status !== "completed");

    // Monthly Trend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const monthlyData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const count = completedGoals.filter((g) => {
        const compDate = new Date(g.updatedAt);
        return compDate.getMonth() === month && compDate.getFullYear() === year;
      }).length;
      return { name: monthNames[month], count };
    });

    // Member Breakdown
    const memberStats = members.map((member) => {
      const mGoals = goals.filter((g) => g.assignedTo?.includes(member.id));
      const done = mGoals.filter((g) => g.status === "completed").length;
      const blockedCount = mGoals.filter((g) => g.status === "blocked").length;
      const total = mGoals.length;
      const rate = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        name: member.name || "Unknown",
        total,
        done,
        blocked: blockedCount,
        rate,
        status: rate > 70 ? "🟢" : rate > 30 ? "⚠️" : "🔴",
      };
    }).sort((a, b) => b.rate - a.rate);

    // Top Blockers
    const blockerReasons: Record<string, number> = {};
    blockedGoals.forEach((g) => {
      const reason = g.reason || "No reason provided";
      blockerReasons[reason] = (blockerReasons[reason] || 0) + 1;
    });
    const topBlockers = Object.entries(blockerReasons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const avgProgress = goals.length > 0
      ? Math.round(goals.reduce((acc, curr) => acc + (curr.progress || 0), 0) / goals.length)
      : 0;

    return {
      goals,
      completedGoals,
      blockedGoals,
      activeGoals,
      monthlyData,
      memberStats,
      topBlockers,
      avgProgress,
    };
  }, [goals, members]);

  return stats;
}
