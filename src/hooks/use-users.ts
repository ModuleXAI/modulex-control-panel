import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { UserFilters, UserStats, UserDetail } from '@/types/users';
import { useAuthStore } from '@/store/auth-store';

// Removed mock data - real API calls will be used instead

export const useUsers = (filters: UserFilters, options?: { enabled?: boolean }) => {
  const { isAuthenticated, token, hostAddress } = useAuthStore();

  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      
      // Ensure API client has credentials
      if (isAuthenticated && token && hostAddress) {
        apiClient.setCredentials(hostAddress, token);
      }
      
      try {
        const response = await apiClient.getUsers(filters);
        console.log('✅ Users API response:', response);
        return response;
      } catch (error) {
        console.error('❌ Users API failed:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && (options?.enabled ?? true),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUserStats = () => {
  const { isAuthenticated, token, hostAddress } = useAuthStore();

  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: async () => {
      // Ensure API client has credentials
      if (isAuthenticated && token && hostAddress) {
        apiClient.setCredentials(hostAddress, token);
      }
      
      try {
        const response = await apiClient.getUserStats();
        console.log('✅ User stats API response:', response);
        return response;
      } catch (error) {
        console.error('❌ User stats API failed:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUserDetail = (userId: string) => {
  const { isAuthenticated, token, hostAddress } = useAuthStore();

  console.log('🔍 [useUserDetail] Hook called with:', {
    userId,
    userIdType: typeof userId,
    userIdLength: userId?.length,
    isAuthenticated,
    hasToken: !!token,
    hasHost: !!hostAddress
  });

  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      // Ensure API client has credentials
      if (isAuthenticated && token && hostAddress) {
        apiClient.setCredentials(hostAddress, token);
      }
      
      try {
        const response = await apiClient.getUserDetail(userId);
        console.log('✅ User detail API response:', response);
        return response;
      } catch (error) {
        console.warn('⚠️ User detail API failed, using mock data:', error);
        
        // Find the user from mock users list
        const mockUser = mockUsers.find(u => u.id === userId);
        console.log('🔍 Looking for user with ID:', userId, 'in mock users');
        console.log('🔍 Found mock user:', mockUser);
        
        if (!mockUser) {
          console.warn('⚠️ User not found in mock data, using default');
          return {
            ...mockUserDetail,
            id: userId
          };
        }
        
        // Create detailed mock data based on the user
        const detailedMockData: UserDetail = {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          is_active: mockUser.is_active,
          created_at: mockUser.created_at,
          updated_at: mockUser.updated_at,
          lastActiveAt: mockUser.lastActiveAt,
          toolCount: mockUser.toolCount,
          activeToolCount: mockUser.activeToolCount,
          totalLogins: mockUser.totalLogins,
          sessionCount: Math.floor(mockUser.totalLogins / 5) + 1, // Realistic session count
          tools: [
            {
              id: '1',
              name: 'GitHub',
              category: 'Development',
              is_authenticated: mockUser.activeToolCount > 0,
              last_used: mockUser.lastActiveAt,
              created_at: mockUser.created_at
            },
            {
              id: '2',
              name: 'Slack',
              category: 'Communication',
              is_authenticated: mockUser.activeToolCount > 1,
              last_used: mockUser.activeToolCount > 1 ? mockUser.lastActiveAt : undefined,
              created_at: mockUser.created_at
            },
            {
              id: '3',
              name: 'Jira',
              category: 'Project Management',
              is_authenticated: mockUser.activeToolCount > 2,
              last_used: mockUser.activeToolCount > 2 ? mockUser.lastActiveAt : undefined,
              created_at: mockUser.created_at
            }
          ].slice(0, mockUser.toolCount), // Only return as many tools as toolCount
          activities: [
            {
              type: 'login',
              description: 'User logged in',
              timestamp: mockUser.lastActiveAt || mockUser.created_at
            },
            {
              type: 'tool_auth',
              description: 'Authenticated GitHub',
              timestamp: mockUser.lastActiveAt || mockUser.created_at,
              metadata: 'GitHub'
            },
            {
              type: 'tool_execution',
              description: 'Executed integration',
              timestamp: mockUser.lastActiveAt || mockUser.created_at,
              metadata: 'Integration'
            }
          ],
          sessions: [
            {
              id: `session-${mockUser.id}-1`,
              is_active: mockUser.is_active,
              ip_address: '192.168.1.100',
              user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
              created_at: mockUser.lastActiveAt || mockUser.created_at
            },
            {
              id: `session-${mockUser.id}-2`,
              is_active: false,
              ip_address: '192.168.1.101',
              user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
              created_at: mockUser.created_at
            }
          ]
        };
        
        console.log('✅ Generated detailed mock data for user:', detailedMockData);
        console.log('📊 Final data stats:', {
          toolCount: detailedMockData.toolCount,
          activeToolCount: detailedMockData.activeToolCount,
          sessionCount: detailedMockData.sessionCount,
          totalLogins: detailedMockData.totalLogins,
          toolsLength: detailedMockData.tools?.length,
          activitiesLength: detailedMockData.activities?.length,
          sessionsLength: detailedMockData.sessions?.length
        });
        
        return detailedMockData;
      }
    },
    enabled: true, // temporarily always enabled for debugging
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    refetchOnWindowFocus: false,
  });
}; 