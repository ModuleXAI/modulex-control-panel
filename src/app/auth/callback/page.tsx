'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient, handleSessionChange } from '@/lib/supabase-client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setError('Supabase is not configured.');
          return;
        }

        const hasCode = typeof window !== 'undefined' && window.location.search.includes('code=');

        if (hasCode) {
          // PKCE code flow
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            window.location.href
          );
          if (exchangeError) throw exchangeError;
        } else {
          // Implicit flow (hash fragment). The client is configured with detectSessionInUrl: true
          // which will parse the fragment on client initialization.
        }

        // Get the current session and ensure our TokenManager is hydrated
        const { data: sessionData, error: getErr } = await supabase.auth.getSession();
        if (getErr) throw getErr;
        if (sessionData?.session) {
          handleSessionChange(sessionData.session);
        }

        const redirect = searchParams.get('redirect') || '/';
        router.replace(redirect);
      } catch (e: any) {
        setError(e?.message || 'Authentication callback failed');
      }
    };

    run();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">Completing sign-in…</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}


