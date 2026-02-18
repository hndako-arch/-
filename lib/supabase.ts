import { createClient } from '@supabase/supabase-js'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Helper to ensure URL has protocol
const ensureProtocol = (url: string | undefined): string => {
    if (!url) return 'https://placeholder.supabase.co';
    if (url.startsWith('http')) return url;
    return `https://${url}`;
};

const supabaseUrl = ensureProtocol(envUrl);
const supabaseKey = envKey || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('Supabase URL is missing. Using placeholder.');
}

export const supabase = createClient(supabaseUrl, supabaseKey)
