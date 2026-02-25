import { Organization, OrgGoal, OrgMember, LeaderboardEntry, TeamHealthScore } from "@/types";

export function getOrgLeaderboard(orgId: string, members: OrgMember[]): LeaderboardEntry[] {
    const orgMembers = members.filter(m => m.orgId === orgId);
    return orgMembers
        .map((m, index) => ({
            rank: index + 1,
            memberId: m.id,
            name: m.name,
            avatarUrl: m.avatarUrl,
            goalsCompleted: m.goalsCompleted,
            completionRate: m.completionRate,
            currentStreak: m.currentStreak,
            totalPoints: m.goalsCompleted * 100 + m.completionRate * 2 + m.currentStreak * 10,
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function getTeamHealthScore(orgId: string, goals: OrgGoal[], members: OrgMember[]): TeamHealthScore {
    const orgGoals = goals.filter(g => g.orgId === orgId);
    const orgMembers = members.filter(m => m.orgId === orgId);

    const avgProgress = orgGoals.length > 0 ? orgGoals.reduce((sum, g) => sum + g.progress, 0) / orgGoals.length : 0;
    const avgCompletion = orgMembers.length > 0 ? orgMembers.reduce((sum, m) => sum + m.completionRate, 0) / orgMembers.length : 0;
    const onTimeGoals = orgGoals.filter((g) => g.status !== "blocked" && g.progress >= 50).length;
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
