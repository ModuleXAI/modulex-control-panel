import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { tokenManager } from '@/lib/token-manager';
import { isSupabaseProvider } from '@/lib/auth-provider';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseProvider()) return null;
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return null;
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  // Keep TokenManager cookies in sync with Supabase session
  supabase.auth.onAuthStateChange((_event, session) => {
    handleSessionChange(session);
  });

  return supabase;
}

export function handleSessionChange(session: Session | null) {
  if (!isSupabaseProvider()) return;
  if (session?.access_token && session.refresh_token) {
    tokenManager.setTokens(session.access_token, session.refresh_token);
  } else {
    // No session → logout
    tokenManager.logout();
  }
}


