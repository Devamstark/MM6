
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase keys missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
} else {
    console.log('Supabase client initialized with URL:', supabaseUrl);
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
