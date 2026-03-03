import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // During build or if keys are missing, return a dummy client to avoid crashing.
    if (!url || !key) {
        if (typeof window === 'undefined') {
            console.warn('Supabase environment variables are missing. This is normal during build if not provided.');
        }
        return {} as any;
    }

    return createBrowserClient(url, key)
}

// Lazy loader to prevent build-time crashes
export const getSupabase = () => createClient();
