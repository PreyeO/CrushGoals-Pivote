import { createClient } from '@/lib/supabase';
import { OrgGoal, GoalStatus } from '@/types';

const supabase = createClient();

export const goalService = {
    async getGoals(orgIdOrIds: string | string[]) {
        let query = supabase.from('goals').select('*');

        if (Array.isArray(orgIdOrIds)) {
            query = query.in('org_id', orgIdOrIds);
        } else {
            query = query.eq('org_id', orgIdOrIds);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getGoalsForUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // First find orgs user is in
        const { data: memberOf } = await supabase
            .from('org_members')
            .select('org_id')
            .eq('user_id', user.id);

        if (!memberOf || memberOf.length === 0) return [];
        const orgIds = memberOf.map(m => m.org_id);

        return this.getGoals(orgIds);
    },

    async createGoal(goal: Omit<OrgGoal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'comments'>) {
        const { data, error } = await supabase
            .from('goals')
            .insert([{
                org_id: goal.orgId,
                title: goal.title,
                description: goal.description,
                emoji: goal.emoji,
                target_value: goal.targetValue,
                target_number: goal.targetNumber,
                unit: goal.unit,
                current_value: 0,
                start_date: goal.startDate || new Date().toISOString(),
                deadline: goal.deadline,
                category: goal.category,
                status: 'not_started',
                priority: goal.priority,
                assigned_to: goal.assignedTo,
                created_by: goal.createdBy
            }])
            .select()
            .single();

        if (error) {
            console.error("Goal creation error:", error);
            if (error.code === '42501') {
                throw new Error("Permission denied. You don't have permission to create goals in this organization.");
            }
            throw error;
        }
        return data;
    },

    async updateProgress(goalId: string, progress: number, note?: string) {
        // Update goal progress
        const { error: goalError } = await supabase
            .from('goals')
            .update({ current_value: progress, updated_at: new Date().toISOString() })
            .eq('id', goalId);

        if (goalError) {
            console.error("Goal progress update error:", goalError);
            if (goalError.code === '42501') {
                throw new Error("Permission denied. You don't have permission to update this goal's progress.");
            }
            throw goalError;
        }

        // If a note is provided, add it to progress_updates
        if (note) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('progress_updates').insert([{
                    goal_id: goalId,
                    user_id: user.id,
                    content: note,
                    progress_value: progress
                }]);
            }
        }
    },

    async updateStatus(goalId: string, status: GoalStatus) {
        const { error } = await supabase
            .from('goals')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', goalId);
        if (error) throw error;
    },

    async deleteGoal(goalId: string, orgId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Delete attempt by:", user?.id, "for goal:", goalId, "in org:", orgId);

        // Verify membership role first
        const { data: member } = await supabase
            .from('org_members')
            .select('role')
            .eq('org_id', orgId)
            .eq('user_id', user?.id)
            .single();

        console.log("Member role in DB:", member?.role);

        // 1. Delete associated progress updates first
        const { error: updatesError } = await supabase
            .from('progress_updates')
            .delete()
            .eq('goal_id', goalId);

        if (updatesError) {
            console.error("Error deleting updates:", updatesError);
        }

        // 2. Delete the goal itself
        const { data, error } = await supabase
            .from('goals')
            .delete()
            .eq('id', goalId)
            .select();

        if (error) {
            console.error("Goal deletion error:", error);
            throw error;
        }

        if (!data || data.length === 0) {
            // Check if goal exists but was just blocked by RLS
            const { data: exists } = await supabase.from('goals').select('id').eq('id', goalId).single();
            if (exists) {
                throw new Error(`Permission denied. You are a ${member?.role || 'unknown'} in this org, but the database RLS policy is blocking this deletion. This usually means only the goal creator can delete it.`);
            } else {
                throw new Error("Goal not found or already deleted.");
            }
        }
    }
};
