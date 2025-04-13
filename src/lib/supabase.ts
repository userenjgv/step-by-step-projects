
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing. Please check your .env file or provide them in the environment.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;
