import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Warning: Missing Supabase Environment Variables. Client will be mocked for build/prerender.');
}

export const supabase: SupabaseClient = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : {
        auth: {
            getUser: async () => ({ data: { user: null }, error: null }),
            getSession: async () => ({ data: { session: null }, error: null }),
            signUp: async () => ({ data: { user: null }, error: null }),
            signInWithPassword: async () => ({ data: { user: null }, error: null }),
        },
        from: () => ({
            select: () => ({ data: [], error: null }),
            insert: () => ({ select: () => ({ data: [], error: null }) }),
            update: () => ({ select: () => ({ data: [], error: null }) }),
            delete: () => ({ select: () => ({ data: [], error: null }) }),
        })
    } as unknown as SupabaseClient;
