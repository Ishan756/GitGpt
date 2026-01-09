import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are missing! Database calls will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
