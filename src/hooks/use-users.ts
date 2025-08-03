import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { UserFilters, UserStats, UserDetail } from '@/types/users';
import { useAuthStore } from '@/store/auth-store';

// Mock data for development
const mockUsers = [
  {
    id: '51b04dcb-e8e6-4350-9848-a7c9c937dfc3',
    email: 'john.doe@example.com',
    username: 'John Doe',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    lastActiveAt: '2024-01-20T15:30:00Z',
    toolCount: 5,
    activeToolCount: 3,
    totalLogins: 42
  },
  {
    id: 'a8f3b2c1-d4e5-4f6a-9b8c-7d6e5f4a3b2c',
    email: 'jane.smith@example.com',
    username: 'Jane Smith',
    is_active: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
    lastActiveAt: '2024-01-20T12:00:00Z',
    toolCount: 8,
    activeToolCount: 7,
    totalLogins: 67
  },
  {
    id: 'e7f8a9b0-c1d2-4e3f-8a9b-0c1d2e3f4a5b',
    email: 'bob.wilson@example.com',
    username: 'Bob Wilson',
    is_active: false,
    created_at: '2023-12-20T14:00:00Z',
    updated_at: '2023-12-20T14:00:00Z',
    lastActiveAt: '2024-01-05T09:00:00Z',
    toolCount: 3,
    activeToolCount: 0,
    totalLogins: 15
  },
  {
    id: 'b4c5d6e7-f8a9-4b0c-9d8e-7f6a5b4c3d2e',
    email: 'alice.johnson@example.com',
    username: 'Alice Johnson',
    is_active: true,
    created_at: '2024-01-18T11:00:00Z',
    updated_at: '2024-01-18T11:00:00Z',
    lastActiveAt: '2024-01-20T16:45:00Z',
    toolCount: 12,
    activeToolCount: 10,
    totalLogins: 89
  },
  {
    id: 'f9a8b7c6-d5e4-4f3a-8b9c-0d1e2f3a4b5c',
    email: 'charlie.brown@example.com',
    username: 'Charlie Brown',
    is_active: true,
    created_at: '2024-01-12T09:30:00Z',
    updated_at: '2024-01-12T09:30:00Z',
    toolCount: 6,
    activeToolCount: 4,
    totalLogins: 34
  }
];

const mockUserDetail: UserDetail = {
  id: '51b04dcb-e8e6-4350-9848-a7c9c937dfc3',
  email: 'john.doe@example.com',
  username: 'John Doe',
  is_active: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  lastActiveAt: '2024-01-20T15:30:00Z',
  toolCount: 5,
  activeToolCount: 3,
  totalLogins: 42,
  sessionCount: 8,
  tools: [
    {
      id: '1',
      name: 'GitHub',
      category: 'Development',
      is_authenticated: true,
      last_used: '2024-01-20T15:00:00Z',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Slack',
      category: 'Communication',
      is_authenticated: true,
      last_used: '2024-01-20T14:00:00Z',
      created_at: '2024-01-15T11:00:00Z'
    },
    {
      id: '3',
      name: 'Jira',
      category: 'Project Management',
      is_authenticated: false,
      created_at: '2024-01-16T09:00:00Z'
    }
  ],
  activities: [
    {
      type: 'login',
      description: 'User logged in',
      timestamp: '2024-01-20T15:30:00Z'
    },
    {
      type: 'tool_auth',
      description: 'Authenticated GitHub',
      timestamp: '2024-01-20T15:00:00Z',
      metadata: 'GitHub'
    },
    {
      type: 'tool_execution',
      description: 'Executed Slack integration',
      timestamp: '2024-01-20T14:00:00Z',
      metadata: 'Slack'
    }
  ],
  sessions: [
    {
      id: 'session-1',
      is_active: true,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      created_at: '2024-01-20T15:30:00Z'
    },
    {
      id: 'session-2',
      is_active: false,
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
      created_at: '2024-01-19T10:00:00Z'
    }
  ]
};

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
        console.warn('⚠️ Users API failed, using mock data:', error);
        // Return mock data with proper structure
        return {
          users: mockUsers,
          total: mockUsers.length,
          totalPages: 1,
          currentPage: 1
        };
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
      
      // Always return mock data for now to test the flow
      const users = mockUsers;
      console.log('📊 [useUserStats] Using mock users:', users);
      
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.is_active === true).length;
      const inactiveUsers = totalUsers - activeUsers;
      const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
      
      console.log('📊 [useUserStats] Calculated basic stats:', {
        totalUsers,
        activeUsers,
        inactiveUsers,
        activePercentage
      });
      
      // Calculate new users today
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const newUsersToday = users.filter(u => {
        const createdDate = new Date(u.created_at);
        return createdDate >= todayStart;
      }).length;
      
      console.log('📊 [useUserStats] New users calculation:', {
        today: today.toISOString(),
        todayStart: todayStart.toISOString(),
        newUsersToday
      });
      
      const calculatedStats = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsersToday,
        activePercentage,
        newUsersChange: 0
      };
      
      console.log('📊 [useUserStats] FINAL CALCULATED STATS:', calculatedStats);
      console.log('📊 [useUserStats] Returning stats object:', JSON.stringify(calculatedStats, null, 2));
      
      return calculatedStats;
    },
    enabled: true, // temporarily always enabled for debugging
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