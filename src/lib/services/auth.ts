import { createClient } from '@/lib/supabase';

const supabase = createClient();

export const authService = {
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) return null;
        if (!user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        return {
            ...user,
            profile
        };
    },

    async signOut() {
        await supabase.auth.signOut();
    }
};
