import { createClient } from '@supabase/supabase-js'

// Hardcoded for Vercel deployment stability (Option 2)
const SUPABASE_URL = 'https://eguilirfpysnkqcssind.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVndWlsaXJmcHlzbmtxY3NzaW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTE3MzAsImV4cCI6MjA4Njg4NzczMH0.zeu4yWWMR54DQvPJBaJ1VtqFtnQ1hr1-UbiHQoJJ618'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY

// Helper to ensure URL has protocol
const ensureProtocol = (url: string): string => {
    if (url.startsWith('http')) return url;
    return `https://${url}`;
};

const supabaseUrl = ensureProtocol(envUrl);
const supabaseKey = envKey;

export const supabase = createClient(supabaseUrl, supabaseKey)
