import { create } from 'zustand';
import {
    Organization,
    Team,
    OrgGoal,
    OrgMember,
    OrgRole,
    OrgInvite,
    ActivityItem,
    GoalStatus,
} from '@/types';
import { goalService } from './services/goals';
import { orgService } from './services/orgs';
import { teamService } from './services/teams';
import { inviteService } from './services/invites';
import { createClient } from './supabase';

const supabase = createClient();

export interface AppState {
    organizations: Organization[];
    goals: OrgGoal[];
    members: OrgMember[];
    teams: Team[];
    invitations: OrgInvite[];
    activities: ActivityItem[];
    user: { id: string; name: string; email: string; avatarUrl: string | null } | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchInitialData: (orgId?: string) => Promise<void>;
    signOut: () => Promise<void>;
    addOrganization: (data: { name: string; description: string; emoji: string }) => Promise<string>;
    addTeam: (orgId: string, name: string, description: string) => Promise<void>;
    sendInvitation: (orgId: string, email: string, role: OrgRole) => Promise<string>;
    cancelInvitation: (inviteId: string) => Promise<void>;
    addGoal: (goal: Omit<OrgGoal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'comments'>) => Promise<void>;
    updateGoalProgress: (goalId: string, progress: number, note?: string) => Promise<void>;
    updateGoalStatus: (goalId: string, status: GoalStatus) => Promise<void>;
    deleteGoal: (goalId: string, orgId: string) => Promise<void>;
}

import { authService } from './services/auth';

const cleanOrgData = (org: any) => {
    let name = org.name;
    let description = org.description;
    let emoji = org.emoji;

    // Handle data corrupted by the previous JSON stringification bug
    if (typeof name === 'string' && name.startsWith('{')) {
        try {
            const parsed = JSON.parse(name);
            name = parsed.name || name;
            description = parsed.description || description;
            emoji = parsed.emoji || emoji;
        } catch (e) {
            console.warn("Failed to parse corrupted org name:", name);
        }
    }
    return { ...org, name, description, emoji };
};

const cleanGoalData = (goal: any): OrgGoal => {
    const targetNumber = goal.target_number;
    const currentValue = goal.current_value || 0;

    // Calculate progress: if it's a metric goal with a target number, 
    // calculate actual percentage. Otherwise use currentValue as percentage.
    let progress = currentValue;
    if (targetNumber && targetNumber > 0) {
        progress = Math.min(100, Math.round((currentValue / targetNumber) * 100));
    }

    return {
        id: goal.id,
        orgId: goal.org_id,
        teamId: goal.team_id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        emoji: goal.emoji,
        status: goal.status,
        priority: goal.priority,
        targetValue: goal.target_value,
        targetNumber: targetNumber,
        unit: goal.unit,
        currentValue: currentValue,
        startDate: goal.start_date || goal.created_at,
        deadline: goal.deadline,
        createdBy: goal.created_by,
        assignedTo: goal.assigned_to || [],
        progress: progress,
        comments: [],
        createdAt: goal.created_at,
        updatedAt: goal.updated_at,
    };
};

const cleanTeamData = (team: any): Team => ({
    id: team.id,
    orgId: team.org_id,
    name: team.name,
    description: team.description,
    emoji: team.emoji,
    createdAt: team.created_at,
});

const syncMemberStats = (goals: OrgGoal[], members: OrgMember[], orgId: string): OrgMember[] => {
    return members.map(m => {
        if (m.orgId !== orgId) return m;

        const memberGoals = goals.filter(g => g.assignedTo.includes(m.id));
        const completed = memberGoals.filter(g => g.status === 'completed').length;
        const completionRate = memberGoals.length > 0
            ? Math.round((completed / memberGoals.length) * 100)
            : 0;

        return {
            ...m,
            goalsAssigned: memberGoals.length,
            goalsCompleted: completed,
            completionRate
        };
    }) as OrgMember[];
};

export const useStore = create<AppState>((set, get) => ({
    organizations: [],
    goals: [],
    members: [],
    teams: [],
    invitations: [],
    activities: [],
    user: null,
    isLoading: false,
    error: null,

    fetchInitialData: async (orgId) => {
        set({ isLoading: true, error: null });
        try {
            // 1. Fetch User
            const authUser = await authService.getCurrentUser();
            if (authUser) {
                set({
                    user: {
                        id: authUser.id,
                        email: authUser.email || '',
                        name: authUser.profile?.full_name || authUser.email?.split('@')[0] || 'User',
                        avatarUrl: authUser.profile?.avatar_url || null
                    }
                });
            }

            // 2. Fetch Data
            const orgs = await orgService.getOrganizations();
            let goals: OrgGoal[] = [];
            let members: OrgMember[] = [];
            let teams: Team[] = [];
            let invitations: OrgInvite[] = [];

            if (orgId) {
                // ... (existing org-specific fetch)
                const [rawGoals, rawTeams, rawMembers, rawInvites] = await Promise.all([
                    goalService.getGoals(orgId),
                    teamService.getTeams(orgId),
                    orgService.getMembers(orgId),
                    inviteService.getInvitations(orgId)
                ]);

                goals = rawGoals.map(cleanGoalData);
                teams = rawTeams.map(cleanTeamData);
                invitations = rawInvites.map((i: any) => ({
                    id: i.id,
                    orgId: i.org_id,
                    email: i.email,
                    role: i.role,
                    status: i.status,
                    invitedBy: i.invited_by,
                    createdAt: i.created_at,
                    token: i.token
                } as any));

                members = rawMembers.map((m: any) => {
                    const memberGoals = goals.filter(g => g.assignedTo.includes(m.id));
                    const completed = memberGoals.filter(g => g.status === 'completed').length;
                    const completionRate = memberGoals.length > 0
                        ? Math.round((completed / memberGoals.length) * 100)
                        : 0;

                    return {
                        ...m,
                        id: m.id,
                        orgId: m.org_id,
                        userId: m.user_id,
                        role: m.role,
                        joinedAt: m.joined_at,
                        name: m.profiles?.full_name || 'Unknown User',
                        avatarUrl: m.profiles?.avatar_url,
                        email: m.email || '', // Email should come from org_members if available or be empty
                        goalsAssigned: memberGoals.length,
                        goalsCompleted: completed,
                        completionRate,
                        currentStreak: 0
                    } as OrgMember;
                }) as any;
            } else if (authUser) {
                // Dashboard view: Fetch all goals and user's own memberships to determine roles
                const { data: userMemberships } = await supabase
                    .from('org_members')
                    .select('*')
                    .eq('user_id', authUser.id);

                if (userMemberships) {
                    members = userMemberships.map((m: any) => ({
                        id: m.id,
                        orgId: m.org_id,
                        userId: m.user_id,
                        role: m.role,
                        joinedAt: m.joined_at,
                        name: get().user?.name || 'User',
                        email: get().user?.email || '',
                    } as any));
                }

                // Fetch ALL goals across user's organizations for the dashboard view
                const rawGoals = await goalService.getGoalsForUser();
                goals = rawGoals.map(cleanGoalData);

                // Fetch invitations for the user (to handle empty dashboard redirection)
                const { data: rawInvites } = await supabase
                    .from('invitations')
                    .select('*')
                    .eq('email', authUser.email)
                    .eq('status', 'pending');

                if (rawInvites) {
                    invitations = rawInvites.map((i: any) => ({
                        id: i.id,
                        orgId: i.org_id,
                        email: i.email,
                        role: i.role,
                        status: i.status,
                        token: i.token,
                        createdAt: i.created_at
                    } as any));
                }
            }

            // Sync goalCount for organizations based on actual goals fetched
            const finalOrgs = orgs.map(cleanOrgData).map(org => {
                // If we have goals for this org, use that count as it's more reliable than the aggregate
                const orgGoals = goals.filter(g => g.orgId === org.id);
                if (orgGoals.length > 0 || (orgId && org.id === orgId)) {
                    return { ...org, goalCount: orgGoals.length };
                }
                return org;
            });

            set({
                organizations: finalOrgs as any,
                goals: goals as any,
                members: members as any,
                teams: teams as any,
                invitations: invitations as any,
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    addOrganization: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const newOrg = await orgService.createOrganization(data);
            const cleanedOrg = cleanOrgData(newOrg);
            set((state) => ({
                organizations: [cleanedOrg as any, ...state.organizations],
                isLoading: false
            }));
            return cleanedOrg.id;
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },

    addTeam: async (orgId, name, description) => {
        set({ isLoading: true });
        try {
            const newTeam = await teamService.createTeam(orgId, name, description);
            const cleanedTeam = cleanTeamData(newTeam);
            set((state) => ({
                teams: [...state.teams, cleanedTeam],
                isLoading: false
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    sendInvitation: async (orgId, email, role) => {
        set({ isLoading: true });
        try {
            const inviteResp = await inviteService.createInvitation(orgId, email, role);
            const newInvite: OrgInvite = {
                id: inviteResp.id,
                orgId: inviteResp.org_id,
                email: inviteResp.email,
                role: inviteResp.role as any,
                status: inviteResp.status,
                token: inviteResp.token,
                invitedBy: inviteResp.invited_by,
                createdAt: inviteResp.created_at,
            };
            set((state) => ({
                invitations: [newInvite, ...state.invitations],
                isLoading: false
            }));
            return inviteResp.inviteLink;
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },

    cancelInvitation: async (inviteId) => {
        try {
            await inviteService.cancelInvitation(inviteId);
            set((state) => ({
                invitations: state.invitations.filter(i => i.id !== inviteId)
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    addGoal: async (goalData) => {
        set({ isLoading: true });
        try {
            const newGoal = await goalService.createGoal(goalData);
            const cleanedGoal = cleanGoalData(newGoal);
            set((state) => {
                const newGoals = [cleanedGoal, ...state.goals];
                return {
                    goals: newGoals,
                    members: syncMemberStats(newGoals, state.members, goalData.orgId),
                    organizations: state.organizations.map(o =>
                        o.id === goalData.orgId ? { ...o, goalCount: (o.goalCount || 0) + 1 } : o
                    ),
                    isLoading: false
                };
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    updateGoalProgress: async (goalId, currentValue, note) => {
        try {
            await goalService.updateProgress(goalId, currentValue, note);
            set((state) => {
                const newGoals = state.goals.map((g) => {
                    if (g.id !== goalId) return g;

                    // Recalculate progress percentage
                    let progress = currentValue;
                    if (g.targetNumber && g.targetNumber > 0) {
                        progress = Math.min(100, Math.round((currentValue / g.targetNumber) * 100));
                    }

                    return { ...g, currentValue, progress, updatedAt: new Date().toISOString() };
                });

                const updatedGoal = newGoals.find(g => g.id === goalId);
                if (!updatedGoal) return { goals: newGoals };

                return {
                    goals: newGoals,
                    members: syncMemberStats(newGoals, state.members, updatedGoal.orgId)
                };
            });
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    updateGoalStatus: async (goalId, status) => {
        try {
            await goalService.updateStatus(goalId, status);
            set((state) => {
                const newGoals = state.goals.map((g) =>
                    g.id === goalId ? { ...g, status, updatedAt: new Date().toISOString() } : g
                );

                const updatedGoal = newGoals.find(g => g.id === goalId);
                if (!updatedGoal) return { goals: newGoals };

                return {
                    goals: newGoals,
                    members: syncMemberStats(newGoals, state.members, updatedGoal.orgId)
                };
            });
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    deleteGoal: async (goalId, orgId) => {
        const goalToDelete = get().goals.find(g => g.id === goalId);
        if (!goalToDelete) return;

        try {
            await goalService.deleteGoal(goalId, orgId);
            set((state) => {
                const newGoals = state.goals.filter(g => g.id !== goalId);
                return {
                    goals: newGoals,
                    members: syncMemberStats(newGoals, state.members, orgId),
                    organizations: state.organizations.map(o =>
                        o.id === orgId ? { ...o, goalCount: Math.max(0, (o.goalCount || 0) - 1) } : o
                    )
                };
            });
        } catch (err: any) {
            set({ error: err.message });
            throw err;
        }
    },

    signOut: async () => {
        await authService.signOut();
        set({ user: null, organizations: [], goals: [], members: [] });
    }
}));
