import { getSupabase } from '@/lib/supabase';

export const authService = {
    async getCurrentUser() {
        const { data: { user }, error } = await getSupabase().auth.getUser();
        if (error) return null;
        if (!user) return null;

        const { data: profile } = await getSupabase()
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

        return {
            ...user,
            profile
        };
    },

    async signOut() {
        await getSupabase().auth.signOut();
    }
};
