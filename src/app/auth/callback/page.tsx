'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient, handleSessionChange } from '@/lib/supabase-client';
import { tokenManager } from '@/lib/token-manager';
import { useOrganizationStore } from '@/store/organization-store';
import type { UserOrganizationsResponse, Organization } from '@/types/organization';

function CallbackHandler() {
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
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            window.location.href
          );
          if (exchangeError) throw exchangeError;
        }

        const { data: sessionData, error: getErr } = await supabase.auth.getSession();
        if (getErr) throw getErr;
        if (sessionData?.session) {
          handleSessionChange(sessionData.session);
        }

        // Fetch user's organizations and decide redirect
        try {
          const response = await tokenManager.makeAuthenticatedRequest<UserOrganizationsResponse>('/auth/me/organizations');
          const organizations = response?.organizations || [];

          // Hydrate org store and pick target organization
          const orgStore = useOrganizationStore.getState();
          orgStore.setOrganizations(organizations);

          let chosen: Organization | null = null;
          const adminOrOwner = organizations.filter(o => o.role === 'owner' || o.role === 'admin');
          if (adminOrOwner.length > 0) {
            chosen = adminOrOwner.find(o => o.is_default) || adminOrOwner[0];
          }

          if (chosen) {
            orgStore.selectOrganization(chosen.id);
            router.replace('/dashboard');
            return;
          }
        } catch (_) {
          // ignore and fallback below
        }

        // No admin/owner orgs → onboarding
        router.replace('/onboarding');
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-sm text-gray-600">Completing sign-in…</p></div>}>
      <CallbackHandler />
    </Suspense>
  );
}



