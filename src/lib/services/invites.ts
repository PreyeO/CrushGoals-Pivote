import { getSupabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { sendInvitationEmailAction } from '@/app/actions/email';



export const inviteService = {
    async createInvitation(orgId: string, email: string, role: string = 'member') {
        const { data: { user } } = await getSupabase().auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const token = uuidv4();
        const { data, error } = await getSupabase()
            .from('invitations')
            .insert([{
                org_id: orgId,
                email,
                role,
                token,
                invited_by: user.id,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) {
            console.error("Invitation error:", error);
            if (error.code === '42501') {
                throw new Error("Permission denied. You must be an Admin or Owner to invite members.");
            }
            throw error;
        }

        // Generate a shareable link
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const inviteLink = `${baseUrl}/invite/${token}`;

        // Send email via Server Action (to keep secrets on the server)
        try {
            // Fetch organization details for the email context
            const { data: orgData } = await getSupabase()
                .from('organizations')
                .select('name')
                .eq('id', orgId)
                .single();

            // Fetch inviter's profile for the host name
            const { data: userData } = await getSupabase()
                .from('profiles')
                .select('full_name, name')
                .eq('id', user.id)
                .single();

            const hostName = userData?.full_name || userData?.name || 'A team member';

            const result = await sendInvitationEmailAction({
                to: email,
                orgName: orgData?.name || 'your organization',
                inviteLink,
                hostName,
            });

            if (!result.success) {
                console.error("Invitation email failed to send:", result.error);
                // Return descriptive error for user
                return { ...data, inviteLink, emailError: result.error };
            }
        } catch (emailErr: any) {
            console.error("Failed to execute invitation email action:", emailErr);
            return { ...data, inviteLink, emailError: emailErr.message || "Email service unavailable" };
        }

        return { ...data, inviteLink };
    },

    async getInvitations(orgId: string) {
        const { data, error } = await getSupabase()
            .from('invitations')
            .select('*')
            .eq('org_id', orgId)
            .eq('status', 'pending');

        if (error) throw error;
        return data;
    },

    async cancelInvitation(inviteId: string) {
        const { error } = await getSupabase()
            .from('invitations')
            .update({ status: 'canceled' })
            .eq('id', inviteId);

        if (error) throw error;
    },

    async getInvitationByToken(token: string) {
        const { data, error } = await getSupabase()
            .from('invitations')
            .select('*, organizations(*)')
            .eq('token', token)
            .eq('status', 'pending')
            .single();

        if (error) throw error;
        return data;
    },

    async acceptInvitation(token: string) {
        const { data: { user } } = await getSupabase().auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // 1. Get invitation
        const invite = await this.getInvitationByToken(token);
        if (!invite) throw new Error("Invalid or expired invitation");

        // 2. Add as member
        const { error: memberError } = await getSupabase()
            .from('org_members')
            .insert([{
                org_id: invite.org_id,
                user_id: user.id,
                role: invite.role,
                joined_at: new Date().toISOString()
            }]);

        if (memberError) {
            // Handle unique constraint (already a member)
            if (memberError.code === '23505') {
                // Technically they are already in, so we can treat as success
                // but we should still update the invite status
            } else {
                throw memberError;
            }
        }

        // 3. Update invite status
        const { error: inviteError } = await getSupabase()
            .from('invitations')
            .update({ status: 'accepted' })
            .eq('token', token);

        if (inviteError) throw inviteError;

        return invite.org_id;
    },

    async getPendingForEmail(email: string) {
        const { data, error } = await getSupabase()
            .from('invitations')
            .select('*')
            .eq('email', email)
            .eq('status', 'pending');

        if (error) throw error;
        return data ?? [];
    }
};
