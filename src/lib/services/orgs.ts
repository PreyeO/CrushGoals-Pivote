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

        const orgIds = membershipData.map((m: { org_id: string }) => m.org_id);

        // Fetch orgs with member and goal counts and owner's tier
        const { data, error } = await getSupabase()
            .from('organizations')
            .select(`
                *,
                memberCount:org_members(count),
                goalCount:goals(count),
                owner:profiles!owner_id(subscription_tier)
            `)
            .in('id', orgIds);

        if (error) throw error;

        return (data || []).map((org: Record<string, any>) => ({
            ...org,
            plan: (org.owner as Record<string, any> | null)?.subscription_tier || "free",
            memberCount: (org.memberCount as any)?.[0]?.count || 0,
            goalCount: (org.goalCount as any)?.[0]?.count || 0,
            completionRate: 0,
            ownerId: org.owner_id,
            slackWebhookUrl: org.slack_webhook_url,
            slackSettings: org.slack_settings,
            lastSlackNudgeAt: org.last_slack_nudge_at,
            lastWeeklySummaryAt: org.last_weekly_summary_at,
            telegramBotToken: org.telegram_bot_token,
            telegramChatId: org.telegram_chat_id,
            connectCode: org.connect_code,
            telegramSettings: org.telegram_settings,
            lastTelegramNudgeAt: org.last_telegram_nudge_at,
            createdAt: org.created_at || new Date().toISOString()
        })) as Organization[];
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
                    owner_id: user.id,
                    connect_code: Math.random().toString(36).substring(2, 8).toUpperCase()
                }])
                .select()
                .single();
            org = result;
            orgError = error;
        } catch (err: unknown) {
            const error = err as { code?: string; message?: string };
            // If column doesn't exist (PGRST204), retry with basic fields
            if (error.code === '42703' || error.message?.includes('description') || error.message?.includes('emoji')) {
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

    async getMembers(orgIdOrIds: string | string[]) {
        let query = getSupabase()
            .from('org_members')
            .select('*, profiles(full_name, avatar_url, email)');

        if (Array.isArray(orgIdOrIds)) {
            query = query.in('org_id', orgIdOrIds);
        } else {
            query = query.eq('org_id', orgIdOrIds);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getMemberStatuses(orgIdOrIds: string | string[]) {
        let query = getSupabase().from('member_goal_status').select('*');

        if (Array.isArray(orgIdOrIds)) {
            query = query.in('org_id', orgIdOrIds);
        } else {
            query = query.eq('org_id', orgIdOrIds);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getMemberships(userId: string) {
        const { data, error } = await getSupabase()
            .from('org_members')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data ?? [];
    },

    async updateOrganization(orgId: string, data: Partial<Organization>) {
        const { name, description, emoji, slackWebhookUrl, slackSettings } = data;
        
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (emoji !== undefined) updateData.emoji = emoji;
        if (slackWebhookUrl !== undefined) updateData.slack_webhook_url = slackWebhookUrl;
        if (slackSettings !== undefined) updateData.slack_settings = slackSettings;
        if (data.lastSlackNudgeAt !== undefined) updateData.last_slack_nudge_at = data.lastSlackNudgeAt;
        if (data.lastWeeklySummaryAt !== undefined) updateData.last_weekly_summary_at = data.lastWeeklySummaryAt;
        if (data.telegramBotToken !== undefined) updateData.telegram_bot_token = data.telegramBotToken;
        if (data.telegramChatId !== undefined) updateData.telegram_chat_id = data.telegramChatId;
        if (data.connectCode !== undefined) updateData.connect_code = data.connectCode;
        if (data.telegramSettings !== undefined) updateData.telegram_settings = data.telegramSettings;
        if (data.lastTelegramNudgeAt !== undefined) updateData.last_telegram_nudge_at = data.lastTelegramNudgeAt;

        const { data: result, error } = await getSupabase()
            .from('organizations')
            .update(updateData)
            .eq('id', orgId)
            .select()
            .single();

        if (error) throw error;
        
        return {
            ...result,
            ownerId: result.owner_id,
            slackWebhookUrl: result.slack_webhook_url,
            slackSettings: result.slack_settings,
            lastSlackNudgeAt: result.last_slack_nudge_at,
            lastWeeklySummaryAt: result.last_weekly_summary_at,
            telegramBotToken: result.telegram_bot_token,
            telegramChatId: result.telegram_chat_id,
            connectCode: result.connect_code,
            telegramSettings: result.telegram_settings,
            lastTelegramNudgeAt: result.last_telegram_nudge_at,
            createdAt: result.created_at || new Date().toISOString()
        };
    },

    async deleteOrganization(orgId: string) {
        const { data: { user } } = await getSupabase().auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Verify the user is the owner
        const { data: membership } = await getSupabase()
            .from('org_members')
            .select('role')
            .eq('org_id', orgId)
            .eq('user_id', user.id)
            .single();

        if (!membership || membership.role !== 'owner') {
            throw new Error("Only the organization owner can delete it.");
        }

        // Delete in order: invitations, member_goal_status, daily_check_ins, goals, org_members, org
        await getSupabase().from('invitations').delete().eq('org_id', orgId);
        await getSupabase().from('member_goal_status').delete().eq('org_id', orgId);
        
        // Get goal IDs for this org to delete check-ins
        const { data: goals } = await getSupabase()
            .from('goals')
            .select('id')
            .eq('org_id', orgId);
        
        if (goals && goals.length > 0) {
            const goalIds = goals.map((g: { id: string }) => g.id);
            await getSupabase().from('daily_check_ins').delete().in('goal_id', goalIds);
        }
        
        await getSupabase().from('goals').delete().eq('org_id', orgId);
        await getSupabase().from('org_members').delete().eq('org_id', orgId);
        
        const { error } = await getSupabase()
            .from('organizations')
            .delete()
            .eq('id', orgId);

        if (error) throw error;
    },

    async removeMember(memberId: string) {
        const { data: { user } } = await getSupabase().auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // 1. Get the member being removed to find their org
        const { data: targetMember, error: targetError } = await getSupabase()
            .from('org_members')
            .select('org_id, user_id, role')
            .eq('id', memberId)
            .single();

        if (targetError || !targetMember) throw new Error("Member not found");

        // 2. Verify the requester is an admin/owner of that org OR it's the member themselves (leaving)
        const { data: requesterMember, error: reqError } = await getSupabase()
            .from('org_members')
            .select('role')
            .eq('org_id', targetMember.org_id)
            .eq('user_id', user.id)
            .single();

        if (reqError || !requesterMember) throw new Error("Unauthorized");

        const isSelf = targetMember.user_id === user.id;
        const isAdmin = requesterMember.role === 'admin' || requesterMember.role === 'owner';

        if (!isSelf && !isAdmin) throw new Error("Insufficent permissions to remove member");
        if (targetMember.role === 'owner') throw new Error("Cannot remove the organization owner");

        // 3. Delete the member
        const { error: deleteError } = await getSupabase()
            .from('org_members')
            .delete()
            .eq('id', memberId);

        if (deleteError) throw deleteError;
    }
};
