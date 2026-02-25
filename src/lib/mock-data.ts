import {
    Organization,
    OrgMember,
    OrgGoal,
    OrgInvite,
    ActivityItem,
    LeaderboardEntry,
    TeamHealthScore,
    GoalComment,
    Milestone,
    KeyResult,
} from "@/types";

// ──────────────────────────────────────
// Current User (simulated logged-in user)
// ──────────────────────────────────────
export const currentUser = {
    id: "user-1",
    name: "Preye Omusuku",
    email: "preye@crushgoals.app",
    avatarUrl: null,
};

// ──────────────────────────────────────
// Organizations
// ──────────────────────────────────────
export const organizations: Organization[] = [
    {
        id: "org-1",
        name: "LetsCr8t Studio",
        description: "Creative agency building digital products and brands",
        emoji: "🚀",
        createdAt: "2025-11-01T10:00:00Z",
        ownerId: "user-1",
        memberCount: 6,
        goalCount: 8,
        completionRate: 67,
        plan: "team",
    },
    {
        id: "org-2",
        name: "Grace Community Church",
        description: "Youth ministry leadership team goal tracking",
        emoji: "⛪",
        createdAt: "2025-12-15T10:00:00Z",
        ownerId: "user-1",
        memberCount: 4,
        goalCount: 5,
        completionRate: 45,
        plan: "free",
    },
];

// ──────────────────────────────────────
// Members
// ──────────────────────────────────────
export const members: OrgMember[] = [
    // LetsCr8t Studio members
    { id: "member-1", orgId: "org-1", userId: "user-1", name: "Preye Omusuku", email: "preye@crushgoals.app", avatarUrl: null, role: "owner", joinedAt: "2025-11-01T10:00:00Z", goalsAssigned: 5, goalsCompleted: 3, completionRate: 82, currentStreak: 12 },
    { id: "member-2", orgId: "org-1", userId: "user-2", name: "Ada Okafor", email: "ada@letscr8t.com", avatarUrl: null, role: "admin", joinedAt: "2025-11-03T10:00:00Z", goalsAssigned: 4, goalsCompleted: 3, completionRate: 91, currentStreak: 8 },
    { id: "member-3", orgId: "org-1", userId: "user-3", name: "Tunde Balogun", email: "tunde@letscr8t.com", avatarUrl: null, role: "member", joinedAt: "2025-11-05T10:00:00Z", goalsAssigned: 3, goalsCompleted: 1, completionRate: 55, currentStreak: 3 },
    { id: "member-4", orgId: "org-1", userId: "user-4", name: "Chioma Eze", email: "chioma@letscr8t.com", avatarUrl: null, role: "member", joinedAt: "2025-11-10T10:00:00Z", goalsAssigned: 4, goalsCompleted: 2, completionRate: 72, currentStreak: 5 },
    { id: "member-5", orgId: "org-1", userId: "user-5", name: "James Adeyemi", email: "james@letscr8t.com", avatarUrl: null, role: "member", joinedAt: "2025-12-01T10:00:00Z", goalsAssigned: 3, goalsCompleted: 2, completionRate: 68, currentStreak: 7 },
    { id: "member-6", orgId: "org-1", userId: "user-6", name: "Sarah Nwosu", email: "sarah@letscr8t.com", avatarUrl: null, role: "member", joinedAt: "2026-01-15T10:00:00Z", goalsAssigned: 2, goalsCompleted: 1, completionRate: 60, currentStreak: 2 },

    // Grace Community Church members
    { id: "member-7", orgId: "org-2", userId: "user-1", name: "Preye Omusuku", email: "preye@crushgoals.app", avatarUrl: null, role: "owner", joinedAt: "2025-12-15T10:00:00Z", goalsAssigned: 3, goalsCompleted: 1, completionRate: 50, currentStreak: 4 },
    { id: "member-8", orgId: "org-2", userId: "user-7", name: "David Obi", email: "david@grace.org", avatarUrl: null, role: "admin", joinedAt: "2025-12-16T10:00:00Z", goalsAssigned: 3, goalsCompleted: 2, completionRate: 73, currentStreak: 6 },
    { id: "member-9", orgId: "org-2", userId: "user-8", name: "Ruth Akpan", email: "ruth@grace.org", avatarUrl: null, role: "member", joinedAt: "2026-01-05T10:00:00Z", goalsAssigned: 2, goalsCompleted: 0, completionRate: 30, currentStreak: 1 },
    { id: "member-10", orgId: "org-2", userId: "user-9", name: "Michael Etim", email: "michael@grace.org", avatarUrl: null, role: "member", joinedAt: "2026-01-10T10:00:00Z", goalsAssigned: 2, goalsCompleted: 1, completionRate: 55, currentStreak: 3 },
];

// ──────────────────────────────────────
// Goals
// ──────────────────────────────────────
export const goals: OrgGoal[] = [
    // LetsCr8t Studio goals
    {
        id: "goal-1", orgId: "org-1", title: "Launch CrushGoals V2", description: "Ship the team pivot of CrushGoals by end of Q1", category: "Product", emoji: "🚀", framework: "okr",
        status: "in_progress", priority: "high", progress: 65, targetValue: "Full launch", currentValue: "Beta ready",
        startDate: "2026-01-15", deadline: "2026-03-31", createdBy: "user-1", assignedTo: ["member-1", "member-2", "member-3"],
        milestones: [
            { id: "ms-1", title: "Design mockups complete", completed: true, dueDate: "2026-02-01", completedAt: "2026-01-28" },
            { id: "ms-2", title: "Frontend MVP built", completed: true, dueDate: "2026-02-15", completedAt: "2026-02-12" },
            { id: "ms-3", title: "Beta testing with 10 teams", completed: false, dueDate: "2026-03-01" },
            { id: "ms-4", title: "Public launch", completed: false, dueDate: "2026-03-31" },
        ],
        keyResults: [
            { id: "kr-1", title: "10 beta teams onboarded", targetValue: 10, currentValue: 4, unit: "teams" },
            { id: "kr-2", title: "NPS score above 40", targetValue: 40, currentValue: 35, unit: "score" },
            { id: "kr-3", title: "Core features shipped", targetValue: 8, currentValue: 5, unit: "features" },
        ],
        comments: [
            { id: "c-1", goalId: "goal-1", userId: "user-2", userName: "Ada Okafor", userAvatar: null, content: "Frontend is looking great! Just need to polish the leaderboard.", createdAt: "2026-02-20T14:00:00Z" },
            { id: "c-2", goalId: "goal-1", userId: "user-1", userName: "Preye Omusuku", userAvatar: null, content: "Agreed. Let's push for beta by next week.", createdAt: "2026-02-21T09:00:00Z" },
        ],
        createdAt: "2026-01-15T10:00:00Z", updatedAt: "2026-02-24T10:00:00Z",
    },
    {
        id: "goal-2", orgId: "org-1", title: "Acquire 50 Paying Customers", description: "Hit 50 MRR customers through outbound and content marketing", category: "Growth", emoji: "📈", framework: "smart",
        status: "in_progress", priority: "high", progress: 28, targetValue: "50 customers", currentValue: "14 customers",
        startDate: "2026-01-01", deadline: "2026-06-30", createdBy: "user-1", assignedTo: ["member-1", "member-4", "member-5"],
        milestones: [
            { id: "ms-5", title: "Launch landing page", completed: true, dueDate: "2026-01-15", completedAt: "2026-01-12" },
            { id: "ms-6", title: "First 10 customers", completed: true, dueDate: "2026-02-28", completedAt: "2026-02-20" },
            { id: "ms-7", title: "25 customers milestone", completed: false, dueDate: "2026-04-30" },
            { id: "ms-8", title: "50 customers target", completed: false, dueDate: "2026-06-30" },
        ],
        comments: [],
        createdAt: "2026-01-01T10:00:00Z", updatedAt: "2026-02-22T10:00:00Z",
    },
    {
        id: "goal-3", orgId: "org-1", title: "Publish 20 Blog Posts", description: "Create SEO-optimized content to drive organic traffic", category: "Marketing", emoji: "✍️", framework: "simple",
        status: "in_progress", priority: "medium", progress: 40, targetValue: "20 posts", currentValue: "8 posts",
        startDate: "2026-01-01", deadline: "2026-06-30", createdBy: "user-2", assignedTo: ["member-4", "member-6"],
        milestones: [
            { id: "ms-9", title: "Content calendar created", completed: true, dueDate: "2026-01-10", completedAt: "2026-01-08" },
            { id: "ms-10", title: "10 posts published", completed: false, dueDate: "2026-03-31" },
        ],
        comments: [
            { id: "c-3", goalId: "goal-3", userId: "user-4", userName: "Chioma Eze", userAvatar: null, content: "Just published the latest post on team productivity!", createdAt: "2026-02-22T11:00:00Z" },
        ],
        createdAt: "2026-01-01T10:00:00Z", updatedAt: "2026-02-22T11:00:00Z",
    },
    {
        id: "goal-4", orgId: "org-1", title: "Reduce Bug Backlog to Zero", description: "Clear all critical and high-priority bugs", category: "Engineering", emoji: "🐛", framework: "simple",
        status: "blocked", priority: "high", progress: 70, targetValue: "0 bugs", currentValue: "6 bugs remaining",
        startDate: "2026-02-01", deadline: "2026-03-15", createdBy: "user-3", assignedTo: ["member-3", "member-5"],
        milestones: [
            { id: "ms-11", title: "Critical bugs fixed", completed: true, dueDate: "2026-02-15", completedAt: "2026-02-14" },
            { id: "ms-12", title: "High-priority bugs fixed", completed: false, dueDate: "2026-03-01" },
        ],
        comments: [
            { id: "c-4", goalId: "goal-4", userId: "user-3", userName: "Tunde Balogun", userAvatar: null, content: "Blocked on API response from third-party service. Reached out to support.", createdAt: "2026-02-23T16:00:00Z" },
        ],
        createdAt: "2026-02-01T10:00:00Z", updatedAt: "2026-02-23T16:00:00Z",
    },
    {
        id: "goal-5", orgId: "org-1", title: "Team Knowledge Base", description: "Document all internal processes and onboarding guides", category: "Operations", emoji: "📚", framework: "simple",
        status: "in_progress", priority: "low", progress: 25, targetValue: "15 docs", currentValue: "4 docs",
        startDate: "2026-01-15", deadline: "2026-04-30", createdBy: "user-2", assignedTo: ["member-2", "member-6"],
        milestones: [], comments: [],
        createdAt: "2026-01-15T10:00:00Z", updatedAt: "2026-02-18T10:00:00Z",
    },
    {
        id: "goal-6", orgId: "org-1", title: "Redesign Brand Identity", description: "Fresh logo, colors, typography for 2026", category: "Design", emoji: "🎨", framework: "smart",
        status: "completed", priority: "medium", progress: 100, targetValue: "Complete rebrand", currentValue: "Complete",
        startDate: "2025-12-01", deadline: "2026-01-31", createdBy: "user-1", assignedTo: ["member-4"],
        milestones: [
            { id: "ms-13", title: "Mood board & research", completed: true, dueDate: "2025-12-15", completedAt: "2025-12-14" },
            { id: "ms-14", title: "Logo concepts", completed: true, dueDate: "2026-01-05", completedAt: "2026-01-03" },
            { id: "ms-15", title: "Brand guide finalized", completed: true, dueDate: "2026-01-31", completedAt: "2026-01-28" },
        ],
        comments: [],
        createdAt: "2025-12-01T10:00:00Z", updatedAt: "2026-01-28T10:00:00Z",
    },
    {
        id: "goal-7", orgId: "org-1", title: "Onboard 3 Freelancers", description: "Hire and onboard contract designers and developers", category: "HR", emoji: "👥", framework: "simple",
        status: "not_started", priority: "medium", progress: 0, targetValue: "3 freelancers", currentValue: "0",
        startDate: "2026-03-01", deadline: "2026-04-15", createdBy: "user-1", assignedTo: ["member-1", "member-2"],
        milestones: [], comments: [],
        createdAt: "2026-02-20T10:00:00Z", updatedAt: "2026-02-20T10:00:00Z",
    },
    {
        id: "goal-8", orgId: "org-1", title: "Client Satisfaction Survey", description: "Get NPS from all active clients", category: "Operations", emoji: "⭐", framework: "simple",
        status: "in_progress", priority: "low", progress: 50, targetValue: "10 responses", currentValue: "5 responses",
        startDate: "2026-02-01", deadline: "2026-03-01", createdBy: "user-2", assignedTo: ["member-5"],
        milestones: [], comments: [],
        createdAt: "2026-02-01T10:00:00Z", updatedAt: "2026-02-20T10:00:00Z",
    },

    // Grace Community Church goals
    {
        id: "goal-9", orgId: "org-2", title: "Plan Easter Outreach", description: "Coordinate Easter service and community event", category: "Events", emoji: "🎉", framework: "simple",
        status: "in_progress", priority: "high", progress: 40, targetValue: "200 attendees", currentValue: "Venue booked",
        startDate: "2026-01-15", deadline: "2026-04-05", createdBy: "user-1", assignedTo: ["member-7", "member-8"],
        milestones: [
            { id: "ms-16", title: "Venue secured", completed: true, dueDate: "2026-02-01", completedAt: "2026-01-28" },
            { id: "ms-17", title: "Flyers designed & printed", completed: false, dueDate: "2026-03-01" },
            { id: "ms-18", title: "Volunteers confirmed", completed: false, dueDate: "2026-03-15" },
        ],
        comments: [],
        createdAt: "2026-01-15T10:00:00Z", updatedAt: "2026-02-20T10:00:00Z",
    },
    {
        id: "goal-10", orgId: "org-2", title: "Youth Bible Study Series", description: "Complete 12-week study on the book of James", category: "Discipleship", emoji: "📖", framework: "simple",
        status: "in_progress", priority: "medium", progress: 58, targetValue: "12 sessions", currentValue: "7 sessions done",
        startDate: "2026-01-05", deadline: "2026-03-29", createdBy: "user-7", assignedTo: ["member-8", "member-9", "member-10"],
        milestones: [], comments: [],
        createdAt: "2026-01-05T10:00:00Z", updatedAt: "2026-02-22T10:00:00Z",
    },
];

// ──────────────────────────────────────
// Invites
// ──────────────────────────────────────
export const invites: OrgInvite[] = [
    { id: "inv-1", orgId: "org-1", email: "newdev@gmail.com", role: "member", status: "pending", invitedBy: "user-1", createdAt: "2026-02-22T10:00:00Z" },
    { id: "inv-2", orgId: "org-2", email: "volunteer@grace.org", role: "member", status: "pending", invitedBy: "user-1", createdAt: "2026-02-20T10:00:00Z" },
];

// ──────────────────────────────────────
// Activity Feed
// ──────────────────────────────────────
export const activities: ActivityItem[] = [
    { id: "act-1", orgId: "org-1", userId: "user-2", userName: "Ada Okafor", userAvatar: null, type: "milestone_hit", message: "completed milestone 'Frontend MVP built' on Launch CrushGoals V2", createdAt: "2026-02-24T14:30:00Z" },
    { id: "act-2", orgId: "org-1", userId: "user-4", userName: "Chioma Eze", userAvatar: null, type: "comment", message: "commented on Publish 20 Blog Posts", createdAt: "2026-02-24T11:00:00Z" },
    { id: "act-3", orgId: "org-1", userId: "user-3", userName: "Tunde Balogun", userAvatar: null, type: "status_change", message: "marked Reduce Bug Backlog to Zero as 'Blocked'", createdAt: "2026-02-23T16:00:00Z" },
    { id: "act-4", orgId: "org-1", userId: "user-1", userName: "Preye Omusuku", userAvatar: null, type: "goal_created", message: "created goal 'Onboard 3 Freelancers'", createdAt: "2026-02-20T10:00:00Z" },
    { id: "act-5", orgId: "org-1", userId: "user-4", userName: "Chioma Eze", userAvatar: null, type: "goal_completed", message: "completed goal 'Redesign Brand Identity' 🎉", createdAt: "2026-01-28T15:00:00Z" },
    { id: "act-6", orgId: "org-1", userId: "user-6", userName: "Sarah Nwosu", userAvatar: null, type: "member_joined", message: "joined LetsCr8t Studio", createdAt: "2026-01-15T10:00:00Z" },
    { id: "act-7", orgId: "org-1", userId: "user-5", userName: "James Adeyemi", userAvatar: null, type: "goal_assigned", message: "was assigned to 'Acquire 50 Paying Customers'", createdAt: "2026-01-10T10:00:00Z" },

    { id: "act-8", orgId: "org-2", userId: "user-7", userName: "David Obi", userAvatar: null, type: "milestone_hit", message: "completed milestone 'Venue secured' for Easter Outreach", createdAt: "2026-01-28T12:00:00Z" },
    { id: "act-9", orgId: "org-2", userId: "user-8", userName: "Ruth Akpan", userAvatar: null, type: "member_joined", message: "joined Grace Community Church", createdAt: "2026-01-05T10:00:00Z" },
];

// ──────────────────────────────────────
// Helper functions (simulate async API)
// ──────────────────────────────────────
export function getOrganizations(): Organization[] {
    return organizations.filter((o) => {
        return members.some((m) => m.orgId === o.id && m.userId === currentUser.id);
    });
}

export function getOrganization(orgId: string): Organization | undefined {
    return organizations.find((o) => o.id === orgId);
}

export function getOrgMembers(orgId: string): OrgMember[] {
    return members.filter((m) => m.orgId === orgId);
}

export function getOrgGoals(orgId: string): OrgGoal[] {
    return goals.filter((g) => g.orgId === orgId);
}

export function getGoal(goalId: string): OrgGoal | undefined {
    return goals.find((g) => g.id === goalId);
}

export function getOrgActivities(orgId: string): ActivityItem[] {
    return activities
        .filter((a) => a.orgId === orgId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrgInvites(orgId: string): OrgInvite[] {
    return invites.filter((i) => i.orgId === orgId && i.status === "pending");
}

export function getOrgLeaderboard(orgId: string): LeaderboardEntry[] {
    const orgMembers = getOrgMembers(orgId);
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

export function getTeamHealthScore(orgId: string): TeamHealthScore {
    const orgGoals = getOrgGoals(orgId);
    const orgMembers = getOrgMembers(orgId);

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

export function getMemberById(memberId: string): OrgMember | undefined {
    return members.find((m) => m.id === memberId);
}

export function getGoalAssignees(goal: OrgGoal): OrgMember[] {
    return goal.assignedTo.map((id) => members.find((m) => m.id === id)).filter(Boolean) as OrgMember[];
}
