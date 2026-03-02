import { createClient } from '@/lib/supabase';

const supabase = createClient();

export const teamService = {
    async getTeams(orgId: string) {
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .eq('org_id', orgId);

        if (error) throw error;
        return data;
    },

    async createTeam(orgId: string, name: string, description: string) {
        const { data, error } = await supabase
            .from('teams')
            .insert([{
                org_id: orgId,
                name,
                description
            }])
            .select()
            .single();

        if (error) {
            console.error("Team creation error:", error);
            if (error.code === '42501') {
                throw new Error("Permission denied. Only organization Owners or Admins can create teams.");
            }
            throw error;
        }
        return data;
    },

    async updateMemberTeam(memberId: string, teamId: string | null) {
        const { error } = await supabase
            .from('org_members')
            .update({ team_id: teamId })
            .eq('id', memberId);

        if (error) throw error;
    }
};
