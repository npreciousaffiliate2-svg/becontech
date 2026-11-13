/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://fkurdkmokuvifgzrdlvm.supabase.co';
const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('[CampusOne] Supabase anonymous key is not configured. Live database sync will operate in offline/fallback mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
