import { createClient } from '@/lib/supabase';
import { Organization } from '@/types';

const supabase = createClient();

export const orgService = {
    async getOrganizations() {
        // Fetch orgs with member and goal counts
        const { data, error } = await supabase
            .from('organizations')
            .select(`
                *,
                memberCount:org_members(count),
                goalCount:goals(count)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((org: any) => ({
            ...org,
            memberCount: org.memberCount?.[0]?.count || 0,
            goalCount: org.goalCount?.[0]?.count || 0,
            completionRate: 0, // We'll calculate this if needed
            ownerId: org.owner_id,
            createdAt: org.created_at
        }));
    },

    async createOrganization(name: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // 1. Create the organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert([{ name, owner_id: user.id }])
            .select()
            .single();

        if (orgError) throw orgError;

        // 2. Add the creator as the owner member
        const { error: memberError } = await supabase
            .from('org_members')
            .insert([{
                org_id: org.id,
                user_id: user.id,
                role: 'owner'
            }]);

        if (memberError) throw memberError;

        return org;
    },

    async getMembers(orgId: string) {
        const { data, error } = await supabase
            .from('org_members')
            .select('*, profiles(full_name, avatar_url)')
            .eq('org_id', orgId);

        if (error) throw error;
        return data;
    }
};
