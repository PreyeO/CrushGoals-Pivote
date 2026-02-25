import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    Organization,
    OrgGoal,
    OrgMember,
    ActivityItem,
    GoalStatus,
    GoalComment
} from '@/types';
import {
    organizations as initialOrgs,
    goals as initialGoals,
    members as initialMembers,
    activities as initialActivities,
    currentUser
} from './mock-data';

interface AppState {
    organizations: Organization[];
    goals: OrgGoal[];
    members: OrgMember[];
    activities: ActivityItem[];

    // Actions
    addOrganization: (org: Omit<Organization, 'id' | 'createdAt' | 'ownerId' | 'memberCount' | 'goalCount' | 'completionRate' | 'plan'>) => void;
    addGoal: (goal: Omit<OrgGoal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'comments'>) => void;
    updateGoalProgress: (goalId: string, progress: number) => void;
    updateGoalStatus: (goalId: string, status: GoalStatus) => void;
    addComment: (goalId: string, content: string) => void;
    toggleMilestone: (goalId: string, milestoneId: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            organizations: initialOrgs,
            goals: initialGoals,
            members: initialMembers,
            activities: initialActivities,

            addOrganization: (orgData) => set((state) => {
                const newOrg: Organization = {
                    ...orgData,
                    id: `org-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    ownerId: currentUser.id,
                    memberCount: 1,
                    goalCount: 0,
                    completionRate: 0,
                    plan: 'free',
                };

                // Also add the owner as the first member
                const newMember: OrgMember = {
                    id: `member-${Date.now()}`,
                    orgId: newOrg.id,
                    userId: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                    avatarUrl: currentUser.avatarUrl,
                    role: 'owner',
                    joinedAt: new Date().toISOString(),
                    goalsAssigned: 0,
                    goalsCompleted: 0,
                    completionRate: 0,
                    currentStreak: 0,
                };

                return {
                    organizations: [newOrg, ...state.organizations],
                    members: [...state.members, newMember]
                };
            }),

            addGoal: (goalData) => set((state) => {
                const newGoal: OrgGoal = {
                    ...goalData,
                    id: `goal-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    progress: 0,
                    comments: [],
                };

                const newActivity: ActivityItem = {
                    id: `act-${Date.now()}`,
                    orgId: newGoal.orgId,
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userAvatar: currentUser.avatarUrl,
                    type: 'goal_created',
                    message: `created goal '${newGoal.title}'`,
                    createdAt: new Date().toISOString(),
                };

                return {
                    goals: [newGoal, ...state.goals],
                    activities: [newActivity, ...state.activities]
                };
            }),

            updateGoalProgress: (goalId, progress) => set((state) => ({
                goals: state.goals.map((g) =>
                    g.id === goalId ? { ...g, progress, updatedAt: new Date().toISOString() } : g
                )
            })),

            updateGoalStatus: (goalId, status) => set((state) => ({
                goals: state.goals.map((g) =>
                    g.id === goalId ? { ...g, status, updatedAt: new Date().toISOString() } : g
                )
            })),

            addComment: (goalId, content) => set((state) => {
                const goal = state.goals.find(g => g.id === goalId);
                if (!goal) return state;

                const newComment: GoalComment = {
                    id: `c-${Date.now()}`,
                    goalId,
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userAvatar: currentUser.avatarUrl,
                    content,
                    createdAt: new Date().toISOString(),
                };

                return {
                    goals: state.goals.map(g =>
                        g.id === goalId ? { ...g, comments: [...g.comments, newComment] } : g
                    )
                };
            }),

            toggleMilestone: (goalId, milestoneId) => set((state) => {
                const goal = state.goals.find(g => g.id === goalId);
                if (!goal) return state;

                const newMilestones = goal.milestones.map(ms =>
                    ms.id === milestoneId ? {
                        ...ms,
                        completed: !ms.completed,
                        completedAt: !ms.completed ? new Date().toISOString() : undefined
                    } : ms
                );

                // Calculate new progress based on milestones if not manually set
                const completedCount = newMilestones.filter(ms => ms.completed).length;
                const progress = Math.round((completedCount / newMilestones.length) * 100);

                return {
                    goals: state.goals.map(g =>
                        g.id === goalId ? { ...g, milestones: newMilestones, progress, updatedAt: new Date().toISOString() } : g
                    )
                };
            }),
        }),
        {
            name: 'crushgoals-storage',
        }
    )
);
