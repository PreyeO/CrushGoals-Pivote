import { getSupabase } from '@/lib/supabase';
import { Organization } from '@/types';

export const orgService = {
    async getOrganizations() {
        const { data: { user } } = await getSupabase().auth.getUser();
        if (!user) return [];

        // Fetch organizations where the user is a member
        const { data: membershipData, error: membershipError } = await getSupabase()
            .from('org_members')
            .select('org_id')
            .eq('user_id', user.id);

        if (membershipError) throw membershipError;
        if (!membershipData || membershipData.length === 0) return [];

        const orgIds = membershipData.map((m: any) => m.org_id);

        // Fetch orgs with member and goal counts
        const { data, error } = await getSupabase()
            .from('organizations')
            .select(`
                *,
                memberCount:org_members(count),
                goalCount:goals(count)
            `)
            .in('id', orgIds);

        if (error) throw error;

        return data.map((org: any) => ({
            ...org,
            memberCount: org.memberCount?.[0]?.count || 0,
            goalCount: org.goalCount?.[0]?.count || 0,
            completionRate: 0, // We'll calculate this if needed
            ownerId: org.owner_id,
            createdAt: org.created_at || new Date().toISOString()
        }));
    },

    async createOrganization(data: { name: string; description: string; emoji: string }) {
        const { name, description, emoji } = data;
        console.log("Creating organization with data:", { name, description, emoji });

        const { data: { user } } = await getSupabase().auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // 1. Create the organization (Defensively)
        let org, orgError;
        try {
            const { data: result, error } = await getSupabase()
                .from('organizations')
                .insert([{
                    name: String(name),
                    description: String(description),
                    emoji: String(emoji),
                    owner_id: user.id
                }])
                .select()
                .single();
            org = result;
            orgError = error;
        } catch (err: any) {
            // If column doesn't exist (PGRST204), retry with basic fields
            if (err.code === '42703' || err.message?.includes('description') || err.message?.includes('emoji')) {
                const { data: result, error } = await getSupabase()
                    .from('organizations')
                    .insert([{
                        name: String(name),
                        owner_id: user.id
                    }])
                    .select()
                    .single();
                org = result;
                orgError = error;
            } else {
                throw err;
            }
        }

        if (orgError) throw orgError;

        // 2. Add the creator as the owner member
        const { error: memberError } = await getSupabase()
            .from('org_members')
            .insert([{
                org_id: org.id,
                user_id: user.id,
                role: 'owner'
            }]);

        if (memberError) throw memberError;

        return {
            ...org,
            memberCount: 1,
            goalCount: 0,
            completionRate: 0,
            ownerId: org.owner_id,
            createdAt: org.created_at || new Date().toISOString()
        };
    },

    async getMembers(orgId: string) {
        const { data, error } = await getSupabase()
            .from('org_members')
            .select('*, profiles(full_name, avatar_url)')
            .eq('org_id', orgId);

        if (error) throw error;
        return data;
    }
};
