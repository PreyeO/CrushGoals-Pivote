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
        free: number;
        pro: number;
        business: number;
        mrr: number;
    };
}

export interface GrowthPoint {
    date: string;
    users: number;
    orgs: number;
}

export interface RecentPayment {
    id: string;
    email: string;
    amount: number;
    currency: string;
    status: string;
    tier: string;
    created_at: string;
    userName?: string;
}

export const adminService = {
    async getPlatformStats(): Promise<PlatformStats> {
        const isAdmin = await isSuperAdmin();
        if (!isAdmin) {
            throw new Error("Unauthorized access to platform statistics");
        }

        const supabase = await createServerClient();

        try {
            // 1. Get User Count
            const { count: userCount, error: userError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            
            if (userError) console.error("Error fetching user count:", userError);

            // 2. Get Goal Count
            const { count: goalCount, error: goalError } = await supabase
                .from('goals')
                .select('*', { count: 'exact', head: true });
            
            if (goalError) console.error("Error fetching goal count:", goalError);

            // 3. Get Organization Plan Distribution
            const { data: orgPlans, error: orgError } = await supabase
                .from('organizations')
                .select('plan');
            
            if (orgError) console.error("Error fetching org plans:", orgError);

            const plans = {
                free: 0,
                pro: 0,
                business: 0
            };

            if (orgPlans) {
                orgPlans.forEach(org => {
                    const p = (org.plan || 'free').toLowerCase();
                    if (p === 'pro') plans.pro++;
                    else if (p === 'business') plans.business++;
                    else plans.free++;
                });
            }

            // 4. Calculate Actual MRR from Payments
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: recentPayments } = await supabase
                .from('payments')
                .select('amount')
                .eq('status', 'successful')
                .gte('created_at', thirtyDaysAgo.toISOString());

            const mrr = recentPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

            return {
                totalUsers: userCount || 0,
                totalOrgs: orgPlans?.length || 0,
                totalGoals: goalCount || 0,
                billing: {
                    free: plans.free,
                    pro: plans.pro,
                    business: plans.business,
                    mrr: mrr
                }
            };
        } catch (error) {
            console.error("Platform stats fetch failed:", error);
            return {
                totalUsers: 0,
                totalOrgs: 0,
                totalGoals: 0,
                billing: { free: 0, pro: 0, business: 0, mrr: 0 }
            };
        }
    },

    async getRecentPayments(limit = 10): Promise<RecentPayment[]> {
        const isAdmin = await isSuperAdmin();
        if (!isAdmin) throw new Error("Unauthorized");

        const supabase = await createServerClient();

        let { data: payments, error } = await supabase
            .from('payments')
            .select(`
                *,
                profiles:user_id(full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Error fetching payments with join:", error.message);
            // Fallback: try without the join
            const { data: fallbackPayments, error: fallbackError } = await supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (fallbackError) {
                console.error("Critical error fetching payments:", fallbackError.message);
                return [];
            }
            payments = fallbackPayments;
        }

        if (!payments || payments.length === 0) {
            console.log("No payments found in database.");
            return [];
        }

        return (payments || []).map((p) => ({
            id: p.id,
            email: p.email,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            tier: p.tier,
            created_at: p.created_at,
            userName: (p.profiles as any)?.full_name
        }));
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

        if (userError) {
            console.error("Error fetching users:", userError.message);
            // Fallback for missing columns
            let fallbackQuery = supabase.from('profiles').select('id, full_name, avatar_url');
            if (searchTerm) fallbackQuery = fallbackQuery.ilike('full_name', `%${searchTerm}%`);
            const { data: fallbackProfiles } = await fallbackQuery.order('full_name', { ascending: true });
            
            return (fallbackProfiles || []).map(p => ({
                id: p.id,
                name: p.full_name || 'Unknown User',
                avatar_url: p.avatar_url,
                email: 'N/A',
                orgCount: 0,
                goalCount: 0
            }));
        }

        // Fetch counts for all users in one go
        const [orgsResponse, goalsResponse] = await Promise.all([
            supabase.from('organizations').select('owner_id'),
            supabase.from('goals').select('created_by')
        ]);

        const orgs = orgsResponse.data || [];
        const goals = goalsResponse.data || [];

        return (profiles || []).map((profile: { id: string; full_name: string | null; avatar_url: string | null; email?: string | null }) => ({
            id: profile.id,
            name: profile.full_name || 'Unknown User',
            avatar_url: profile.avatar_url,
            email: profile.email || 'N/A',
            orgCount: orgs.filter(o => o.owner_id === profile.id).length,
            goalCount: goals.filter(g => g.created_by === profile.id).length
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

        if (orgError) {
            console.error("Error fetching organizations:", orgError.message, orgError.details);
            throw new Error("Failed to fetch organizations: " + orgError.message);
        }

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

    async getGrowthData(): Promise<GrowthPoint[]> {
        const isAdmin = await isSuperAdmin();
        if (!isAdmin) throw new Error("Unauthorized");

        const supabase = await createServerClient();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch users and orgs created in the last 30 days
        const [usersResponse, orgsResponse] = await Promise.all([
            supabase.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
            supabase.from('organizations').select('created_at').gte('created_at', thirtyDaysAgo.toISOString())
        ]);

        const users = usersResponse.data || [];
        const orgs = orgsResponse.data || [];

        // Generate points for each of the last 30 days
        const points: GrowthPoint[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Filter counts up to this day (cumulative)
            // But since we only have the last 30 days of data here, we'll just show the acquisition per day
            // or we could fetch total counts. Let's do daily acquisition for a clearer growth trend.
            const userCount = users.filter(u => u.created_at && u.created_at.startsWith(dateStr)).length;
            const orgCount = orgs.filter(o => o.created_at && o.created_at.startsWith(dateStr)).length;

            points.push({
                date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date),
                users: userCount,
                orgs: orgCount
            });
        }

        return points;
    }
};
