import { OrgGoal, OrgMember } from "@/types";

export interface WeeklySummary {
  orgId: string;
  startDate: string;
  endDate: string;
  crushedCount: number;
  activeCount: number;
  blockedCount: number;
  avgProgress: number;
  topPerformers: {
    name: string;
    completed: number;
    rate: number;
  }[];
  blockedReasons: string[];
  staleGoalCount: number;
}

export const reportService = {
  getWeeklySummary(orgId: string, goals: OrgGoal[], members: OrgMember[]): WeeklySummary {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // 1. Basic Counts
    const weeklyGoals = goals.filter(g => g.orgId === orgId);
    const crushedThisWeek = weeklyGoals.filter(g => 
      g.status === 'completed' && new Date(g.updatedAt) >= sevenDaysAgo
    );
    const activeGoals = weeklyGoals.filter(g => g.status !== 'completed');
    const blockedGoals = weeklyGoals.filter(g => g.status === 'blocked');
    
    // 2. Progress
    const avgProgress = weeklyGoals.length > 0
      ? Math.round(weeklyGoals.reduce((acc, curr) => acc + (curr.progress || 0), 0) / weeklyGoals.length)
      : 0;

    // 3. Top Performers
    const topPerformers = members.map(m => {
      const mGoals = weeklyGoals.filter(g => g.assignedTo?.includes(m.id));
      const done = mGoals.filter(g => g.status === 'completed' && new Date(g.updatedAt) >= sevenDaysAgo).length;
      const total = mGoals.length;
      const rate = total > 0 ? Math.round((done / total) * 100) : 0;
      return { name: m.name, completed: done, rate };
    })
    .filter(p => p.completed > 0)
    .sort((a, b) => b.completed - a.completed || b.rate - a.rate)
    .slice(0, 3);

    // 4. Blocked Reasons
    const blockedReasons = Array.from(new Set(
      blockedGoals.map(g => g.reason || "Unknown reason").filter(Boolean)
    )).slice(0, 3);

    // 5. Stale Goals (Active but no update in 3 days)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const staleGoalCount = activeGoals.filter(g => 
      new Date(g.updatedAt) < threeDaysAgo && g.status !== 'blocked'
    ).length;

    return {
      orgId,
      startDate: sevenDaysAgo.toISOString(),
      endDate: now.toISOString(),
      crushedCount: crushedThisWeek.length,
      activeCount: activeGoals.length,
      blockedCount: blockedGoals.length,
      avgProgress,
      topPerformers,
      blockedReasons,
      staleGoalCount
    };
  },

  generateCSV(goals: OrgGoal[]): string {
    const headers = ["Title", "Status", "Priority", "Progress", "Created At", "Updated At", "Deadline"];
    const rows = goals.map(g => [
      `"${g.title.replace(/"/g, '""')}"`,
      g.status,
      g.priority,
      `${g.progress}%`,
      new Date(g.createdAt).toLocaleDateString(),
      new Date(g.updatedAt).toLocaleDateString(),
      new Date(g.deadline).toLocaleDateString(),
    ]);

    return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  }
};
