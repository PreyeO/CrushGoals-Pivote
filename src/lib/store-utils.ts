import { Organization, OrgGoal, OrgMember, LeaderboardEntry, OrgHealthScore, DailyCheckIn } from "@/types";

export function getToday(): string {
  // Use local time for YYYY-MM-DD to avoid timezone shifts
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLast14Days(): string[] {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    days.push(`${year}-${month}-${day}`);
  }
  return days;
}

export function calculateStreak(checkedDates: Set<string>): number {
    if (checkedDates.size === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    // We iterate backwards from today.
    // If we want to support long streaks, we shouldn't hardcode 365. We check up to max possible streak.
    const maxPossible = Math.max(365, checkedDates.size + 1);

    for (let i = 0; i <= maxPossible; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        if (checkedDates.has(dateStr)) {
            streak++;
        } else {
            // Allow today to be unchecked if streak started yesterday
            if (i === 0) continue;
            break; // Streak broken
        }
    }
    return streak;
}

export function getUserStreak(userId: string, checkins: DailyCheckIn[]): number {
    const userCheckins = checkins.filter(c => c.userId === userId);
    const checkedDates = new Set(userCheckins.map(c => c.checkDate));
    return calculateStreak(checkedDates);
}

export function getOrgLeaderboard(orgId: string, members: OrgMember[]): LeaderboardEntry[] {
    const orgMembers = members.filter(m => m.orgId === orgId);
    return orgMembers
        .map((m, index) => {
            const goalsCompleted = m.goalsCompleted || 0;
            const completionRate = m.completionRate || 0;
            const currentStreak = m.currentStreak || 0;

            return {
                rank: index + 1,
                memberId: m.id,
                name: m.name || 'Unknown User',
                avatarUrl: m.avatarUrl || null,
                goalsCompleted,
                completionRate,
                currentStreak,
                totalPoints: goalsCompleted * 100 + completionRate * 2 + currentStreak * 10,
            };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function getOrgHealthScore(orgId: string, goals: OrgGoal[], members: OrgMember[]): OrgHealthScore {
    const orgGoals = goals.filter(g => g.orgId === orgId);
    const orgMembers = members.filter(m => m.orgId === orgId);

    const avgProgress = orgGoals.length > 0 ? orgGoals.reduce((sum, g) => sum + g.currentValue, 0) / orgGoals.length : 0;
    const avgCompletion = orgMembers.length > 0 ? orgMembers.reduce((sum, m) => sum + (m.completionRate || 0), 0) / orgMembers.length : 0;
    const onTimeGoals = orgGoals.filter((g) => g.status !== "blocked" && (g.currentValue >= 50)).length;
    const onTimeRate = orgGoals.length > 0 ? (onTimeGoals / orgGoals.length) * 100 : 0;

    const overall = Math.round((avgProgress * 0.4 + avgCompletion * 0.35 + onTimeRate * 0.25));

    return {
        overall,
        goalProgress: Math.round(avgProgress),
        memberEngagement: Math.round(avgCompletion),
        onTimeCompletion: Math.round(onTimeRate),
        trend: overall > 60 ? "up" : overall > 40 ? "stable" : "down",
    };
}

export function getGoalAssignees(goal: OrgGoal, members: OrgMember[]): OrgMember[] {
    return goal.assignedTo.map((id) => members.find((m) => m.id === id)).filter(Boolean) as OrgMember[];
}

export function sortGoals(goals: OrgGoal[]): OrgGoal[] {
    return [...goals].sort((a, b) => {
        // 1. Status Priority
        const priority: Record<string, number> = {
            blocked: 0,
            in_progress: 1,
            not_started: 2,
            completed: 3
        };

        if (priority[a.status] !== priority[b.status]) {
            return priority[a.status] - priority[b.status];
        }

        // 2. Recency (Newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

/**
 * Filter goals based on user role and assignment.
 * - Owners/Admins see all goals in the org.
 * - Members see only goals they are assigned to.
 */
export function getVisibleGoals(goals: OrgGoal[], myMember: OrgMember | undefined): OrgGoal[] {
    if (!myMember) return [];
    
    let filtered = goals;
    if (myMember.role !== 'owner' && myMember.role !== 'admin') {
        // Standard members only see goals they are explicitly assigned to
        filtered = goals.filter(g => g.assignedTo.includes(myMember.id));
    }

    return sortGoals(filtered);
}
