import { createClient } from '@/lib/supabase';
import { OrgGoal, GoalStatus } from '@/types';

const supabase = createClient();

export const goalService = {
    async getGoals(orgId: string) {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('org_id', orgId);

        if (error) throw error;
        return data;
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
                current_value: 0,
                deadline: goal.deadline,
                category: goal.category,
                status: 'not_started',
                priority: goal.priority
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
    }
};
