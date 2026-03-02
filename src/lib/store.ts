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
                goals = await goalService.getGoals(orgId);
                teams = await teamService.getTeams(orgId);
                const rawInvites = await inviteService.getInvitations(orgId);
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

                const rawMembers = await orgService.getMembers(orgId);
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
                        email: m.profiles?.email,
                        goalsAssigned: memberGoals.length,
                        goalsCompleted: completed,
                        completionRate,
                        currentStreak: 0
                    };
                }) as any;
            } else if (authUser) {
                // Dashboard view: Fetch user's own memberships to determine roles
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
            }

            set({
                organizations: orgs.map(cleanOrgData) as any,
                goals: goals.map(g => ({ ...g, progress: g.currentValue || 0 })) as any,
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
            set((state) => ({
                teams: [...state.teams, newTeam as any],
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
            set((state) => ({
                goals: [newGoal as any, ...state.goals],
                isLoading: false
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    updateGoalProgress: async (goalId, progress, note) => {
        try {
            await goalService.updateProgress(goalId, progress, note);
            set((state) => ({
                goals: state.goals.map((g) =>
                    g.id === goalId ? { ...g, current_value: progress, updatedAt: new Date().toISOString() } : g
                ),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    updateGoalStatus: async (goalId, status) => {
        try {
            await goalService.updateStatus(goalId, status);
            set((state) => ({
                goals: state.goals.map((g) =>
                    g.id === goalId ? { ...g, status, updatedAt: new Date().toISOString() } : g
                ),
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    signOut: async () => {
        await authService.signOut();
        set({ user: null, organizations: [], goals: [], members: [] });
    }
}));
