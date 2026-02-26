import { create } from 'zustand';
import {
    Organization,
    OrgGoal,
    OrgMember,
    ActivityItem,
    GoalStatus,
} from '@/types';
import { goalService } from './services/goals';
import { orgService } from './services/orgs';

interface AppState {
    organizations: Organization[];
    goals: OrgGoal[];
    members: OrgMember[];
    activities: ActivityItem[];
    user: { id: string; name: string; email: string; avatarUrl: string | null } | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchInitialData: (orgId?: string) => Promise<void>;
    signOut: () => Promise<void>;
    addOrganization: (name: string) => Promise<void>;
    addGoal: (goal: Omit<OrgGoal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'comments'>) => Promise<void>;
    updateGoalProgress: (goalId: string, progress: number, note?: string) => Promise<void>;
    updateGoalStatus: (goalId: string, status: GoalStatus) => Promise<void>;
}

import { authService } from './services/auth';

export const useStore = create<AppState>((set, get) => ({
    organizations: [],
    goals: [],
    members: [],
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

            if (orgId) {
                goals = await goalService.getGoals(orgId);
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
                        goalsAssigned: memberGoals.length,
                        goalsCompleted: completed,
                        completionRate,
                        currentStreak: 0 // TODO: Implement streak logic
                    };
                }) as any;
            }

            set({
                organizations: orgs as any,
                goals: goals as any,
                members: members as any,
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    addOrganization: async (name) => {
        set({ isLoading: true });
        try {
            const newOrg = await orgService.createOrganization(name);
            set((state) => ({
                organizations: [newOrg as any, ...state.organizations],
                isLoading: false
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
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
