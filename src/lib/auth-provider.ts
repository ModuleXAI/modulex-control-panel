export type AuthProvider = 'default' | 'supabase';

export function getAuthProvider(): AuthProvider {
  const value = (
    process.env.NEXT_PUBLIC_AUTH_PROVIDER ||
    'default'
  ).toLowerCase();
  return value === 'supabase' ? 'supabase' : 'default';
}

export function isSupabaseProvider(): boolean {
  return getAuthProvider() === 'supabase';
}


