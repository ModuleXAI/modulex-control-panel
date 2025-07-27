import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Organization, OrganizationState } from '@/types/organization';
import { tokenManager } from '@/lib/token-manager';
import Cookies from 'js-cookie';

interface OrganizationStore extends OrganizationState {
  setOrganizations: (organizations: Organization[]) => void;
  selectOrganization: (organizationId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUserOrganizations: () => Promise<void>;
  clearOrganizations: () => void;
  getSelectedOrganizationId: () => string | null;
  hydrate: () => void;
}

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set, get) => ({
      organizations: [],
      selectedOrganizationId: null,
      selectedOrganization: null,
      isLoading: false,
      error: null,

      hydrate: () => {
        // Restore from both localStorage and cookies
        const cookieOrgId = Cookies.get('selected-organization-id');
        const currentState = get();
        
        console.log('🏢 Organization store hydrating:', {
          cookieOrgId,
          currentSelected: currentState.selectedOrganizationId,
          hasOrganizations: currentState.organizations.length > 0
        });
        
        // If we have a cookie org ID but no current selection, restore it
        if (cookieOrgId && !currentState.selectedOrganizationId && currentState.organizations.length > 0) {
          const organization = currentState.organizations.find(org => org.id === cookieOrgId);
          if (organization) {
            console.log('✅ Restoring organization from cookie:', organization.name);
            set({
              selectedOrganizationId: cookieOrgId,
              selectedOrganization: organization,
            });
          }
        }
      },

      setOrganizations: (organizations) => {
        const currentState = get();
        let selectedOrg = currentState.selectedOrganization;
        let selectedId = currentState.selectedOrganizationId;

        // Check cookie first
        const cookieOrgId = Cookies.get('selected-organization-id');
        
        console.log('🏢 Setting organizations:', {
          count: organizations.length,
          cookieOrgId,
          currentSelectedId: selectedId
        });

        // Priority: Cookie > Current selection > Default org > First org
        if (cookieOrgId && organizations.find(org => org.id === cookieOrgId)) {
          selectedOrg = organizations.find(org => org.id === cookieOrgId) || null;
          selectedId = cookieOrgId;
          console.log('✅ Using organization from cookie:', selectedOrg?.name);
        } else if (!selectedId && organizations.length > 0) {
          const defaultOrg = organizations.find(org => org.is_default) || organizations[0];
          selectedOrg = defaultOrg;
          selectedId = defaultOrg.id;
          console.log('✅ Auto-selecting default organization:', selectedOrg.name);
        } else if (selectedId) {
          // Update selected organization if it exists in new list
          selectedOrg = organizations.find(org => org.id === selectedId) || null;
          if (!selectedOrg && organizations.length > 0) {
            selectedOrg = organizations[0];
            selectedId = organizations[0].id;
          }
        }

        // Save to cookie if we have a selection
        if (selectedId) {
          Cookies.set('selected-organization-id', selectedId, {
            expires: 30, // 30 days
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
          });
        }

        set({
          organizations,
          selectedOrganization: selectedOrg,
          selectedOrganizationId: selectedId,
        });
      },

      selectOrganization: (organizationId) => {
        const { organizations } = get();
        const organization = organizations.find(org => org.id === organizationId);
        
        // Save to cookie
        Cookies.set('selected-organization-id', organizationId, {
          expires: 30, // 30 days
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production'
        });
        
        set({
          selectedOrganizationId: organizationId,
          selectedOrganization: organization || null,
        });

        console.log('🏢 Organization selected:', organization?.name);

        // Clear organization-dependent query cache
        if (typeof window !== 'undefined') {
          try {
            // Dynamically import and clear query cache for organization-dependent queries
            import('@tanstack/react-query').then(({ useQueryClient }) => {
              // Get query client instance from context if available
              const queryClient = (window as any).__REACT_QUERY_CLIENT__;
              if (queryClient) {
                // Clear organization-dependent queries
                queryClient.invalidateQueries({ queryKey: ['tools'] });
                queryClient.invalidateQueries({ queryKey: ['integrations'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                queryClient.invalidateQueries({ queryKey: ['analytics'] });
                queryClient.invalidateQueries({ queryKey: ['users'] });
                queryClient.invalidateQueries({ queryKey: ['logs'] });
                console.log('🗑️ Cleared organization-dependent query cache');
              }
            });
          } catch (error) {
            console.warn('Could not clear query cache:', error);
          }
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),

      fetchUserOrganizations: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await tokenManager.makeAuthenticatedRequest<any>(
            '/auth/me/organizations'
          );

          if (response.success) {
            get().setOrganizations(response.organizations);
            console.log('✅ Organizations fetched:', response.organizations.length);
          } else {
            throw new Error('Failed to fetch organizations');
          }
        } catch (error) {
          console.error('❌ Failed to fetch organizations:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch organizations' });
        } finally {
          set({ isLoading: false });
        }
      },

      clearOrganizations: () => {
        // Clear cookie
        Cookies.remove('selected-organization-id');
        
        set({
          organizations: [],
          selectedOrganizationId: null,
          selectedOrganization: null,
          error: null,
        });

        // Clear all query cache when clearing organizations (logout)
        if (typeof window !== 'undefined') {
          try {
            const queryClient = (window as any).__REACT_QUERY_CLIENT__;
            if (queryClient) {
              queryClient.clear();
              console.log('🗑️ Cleared all query cache on logout');
            }
          } catch (error) {
            console.warn('Could not clear query cache on logout:', error);
          }
        }
      },

      getSelectedOrganizationId: () => {
        return get().selectedOrganizationId;
      },
    }),
    {
      name: 'organization-store',
      partialize: (state) => ({
        organizations: state.organizations,
        selectedOrganizationId: state.selectedOrganizationId,
        selectedOrganization: state.selectedOrganization,
      }),
    }
  )
);

// Hydrate organization state on app start
if (typeof window !== 'undefined') {
  useOrganizationStore.getState().hydrate();
} 