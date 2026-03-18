import { createClient as createServerClient } from '@/lib/supabase-server';

// Security check helper
export async function isSuperAdmin(): Promise<boolean> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // The designated super admin email
    const adminEmail = "ayibakep@gmail.com";
    return user.email === adminEmail;
}

export interface PlatformStats {
    totalUsers: number;
    totalOrgs: number;
    totalGoals: number;
    billing: {
        freeTrialUsers: number;
        proUsers: number;
        enterpriseUsers: number;
        mrr: number; // Monthly Recurring Revenue
    };
}

export const adminService = {
    async getPlatformStats(): Promise<PlatformStats> {
        const isAdmin = await isSuperAdmin();
        if (!isAdmin) {
            throw new Error("Unauthorized access to platform statistics");
        }

        const supabase = await createServerClient();

        // 1. Get User Count (from profiles table)
        const { count: userCount, error: userError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (userError) throw new Error("Failed to fetch user count: " + userError.message);

        // 2. Get Org Count
        const { count: orgCount, error: orgError } = await supabase
            .from('organizations')
            .select('*', { count: 'exact', head: true });

        if (orgError) throw new Error("Failed to fetch org count: " + orgError.message);

        // 3. Get Goals Count
        const { count: goalCount, error: goalError } = await supabase
            .from('goals')
            .select('*', { count: 'exact', head: true });

        if (goalError) throw new Error("Failed to fetch goals count: " + goalError.message);

        // 4. Mock Billing Data (since we haven't implemented Stripe yet)
        // In a real app, this would come from a Stripe integration or a subscriptions table
        const totalU = userCount || 0;
        const freeTrialCount = Math.floor(totalU * 0.8) > 0 ? Math.floor(totalU * 0.8) : totalU; // 80% on free trial
        const proCount = Math.floor(totalU * 0.15); // 15% on pro
        const enterpriseCount = totalU - freeTrialCount - proCount; // 5% on enterprise

        const mrr = (proCount * 12) + (enterpriseCount * 99); // $12/mo for pro, $99/mo for enterprise

        return {
            totalUsers: userCount || 0,
            totalOrgs: orgCount || 0,
            totalGoals: goalCount || 0,
            billing: {
                freeTrialUsers: freeTrialCount,
                proUsers: proCount,
                enterpriseUsers: enterpriseCount,
                mrr: mrr
            }
        };
    },

    async getPlatformUsers(searchTerm?: string) {
        const isAdmin = await isSuperAdmin();
        if (!isAdmin) {
            throw new Error("Unauthorized access to platform users");
        }

        const supabase = await createServerClient();

        // Fetch basic profiles
        // Note: Real 'email' and 'created_at' require the SQL migration from the Implementation Plan.
        let query = supabase
            .from('profiles')
            .select('id, full_name, avatar_url, email, created_at');

        if (searchTerm) {
            query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }

        const { data: profiles, error: userError } = await (query as any).order('full_name', { ascending: true });

        // If the query fails (likely due to missing columns), we'll do one final fallback 
        // to keep the dashboard functional while waiting for the migration.
        if (userError) {
            let fallbackQuery = supabase
                .from('profiles')
                .select('id, full_name, avatar_url');
            
            if (searchTerm) {
                fallbackQuery = fallbackQuery.ilike('full_name', `%${searchTerm}%`);
            }

            const { data: fallbackProfiles, error: fallbackError } = await fallbackQuery.order('full_name', { ascending: true });

            if (fallbackError) throw new Error("Database error: " + fallbackError.message);
            
            return (fallbackProfiles || []).map(profile => ({
                id: profile.id,
                name: profile.full_name || 'Unknown User',
                avatar_url: profile.avatar_url,
                email: `user_${profile.id.substring(0,6)}@example.com`, // Mock email
                created_at: null // Will show N/A until migration
            }));
        }

        return (profiles || []).map((profile: any) => ({
            id: profile.id,
            name: profile.full_name || 'Unknown User',
            avatar_url: profile.avatar_url,
            email: profile.email || `user_${profile.id.substring(0,6)}@example.com`
        }));
    },

    async getPlatformOrgs(searchTerm?: string) {
        const isAdmin = await isSuperAdmin();
        if (!isAdmin) {
            throw new Error("Unauthorized access to platform organizations");
        }

        const supabase = await createServerClient();

        // 1. Get all organizations
        let query = supabase
            .from('organizations')
            .select(`
                *,
                owner:profiles(id, full_name, avatar_url, email)
            `);

        if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
        }

        const { data: orgs, error: orgError } = await query.order('created_at', { ascending: false });

        if (orgError) throw new Error("Failed to fetch organizations: " + orgError.message);

        // 2. Get member counts for each org
        const { data: members, error: memberError } = await supabase
            .from('org_members')
            .select('org_id');

        if (memberError) throw new Error("Failed to fetch member counts: " + memberError.message);

        // 3. Get goal counts for each org
        const { data: goals, error: goalError } = await supabase
            .from('goals')
            .select('org_id');

        if (goalError) throw new Error("Failed to fetch goal counts: " + goalError.message);

        return orgs.map(org => ({
            ...org,
            memberCount: members.filter(m => m.org_id === org.id).length,
            goalCount: goals.filter(g => g.org_id === org.id).length
        }));
    },

    async getRecentActivity() {
        const isAdmin = await isSuperAdmin();
        if (!isAdmin) throw new Error("Unauthorized");

        const supabase = await createServerClient();

        // Fetch recent profiles
        const { data: recentProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, created_at')
            .order('id', { ascending: false })
            .limit(3);

        // Fetch recent orgs
        const { data: recentOrgs } = await supabase
            .from('organizations')
            .select('id, name, created_at, emoji')
            .order('created_at', { ascending: false })
            .limit(3);

        const activities: any[] = [];

        if (recentProfiles) {
            recentProfiles.forEach(p => {
                activities.push({
                    id: `profile-${p.id}`,
                    type: 'user',
                    title: 'New Member Joined',
                    description: `${p.full_name || 'A user'} created a profile`,
                    timestamp: (p as any).created_at || new Date().toISOString(),
                    icon: 'user'
                });
            });
        }

        if (recentOrgs) {
            recentOrgs.forEach(o => {
                activities.push({
                    id: `org-${o.id}`,
                    type: 'org',
                    title: 'New Organization',
                    description: `"${o.name}" was launched`,
                    timestamp: o.created_at,
                    icon: 'org'
                });
            });
        }

        return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
    }
};
