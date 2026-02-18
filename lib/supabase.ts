import { createClient } from '@supabase/supabase-js'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseUrl = (envUrl && envUrl.startsWith('http')) ? envUrl : 'https://placeholder.supabase.co'
const supabaseKey = envKey || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
