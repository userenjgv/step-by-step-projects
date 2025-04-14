
import { createClient } from '@supabase/supabase-js';
import { Storage } from '@capacitor/storage';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing. Please check your .env file or set them in your environment.');
}

// Custom storage implementation for Capacitor
const capacitorStorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      const { value } = await Storage.get({ key });
      return value;
    } catch (error) {
      console.error('Error getting item from Capacitor Storage:', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await Storage.set({ key, value });
    } catch (error) {
      console.error('Error setting item in Capacitor Storage:', error);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await Storage.remove({ key });
    } catch (error) {
      console.error('Error removing item from Capacitor Storage:', error);
    }
  }
};

// Configure storage for native mobile apps as well as web
const supabaseOptions = {
  auth: {
    storage: capacitorStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
};

// Create a single supabase client for the entire application with fallback empty strings
const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  supabaseOptions
);

export default supabase;
