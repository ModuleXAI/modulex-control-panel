'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus,
  UserCheck,
  Clock,
  TrendingUp,
  Globe,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useUserAnalytics } from '@/hooks/use-analytics';
import { AnalyticsCardSkeleton, AnalyticsChartSkeleton, AnalyticsTableSkeleton, AnalyticsErrorState } from './analytics-skeleton';

interface UserAnalyticsProps {
  dateRange: string;
}

// Mock data for user analytics
const mockNewUsersData = [
  { date: '01', newUsers: 12, totalUsers: 120 },
  { date: '02', newUsers: 15, totalUsers: 135 },
  { date: '03', newUsers: 8, totalUsers: 143 },
  { date: '04', newUsers: 20, totalUsers: 163 },
  { date: '05', newUsers: 18, totalUsers: 181 },
  { date: '06', newUsers: 25, totalUsers: 206 },
  { date: '07', newUsers: 22, totalUsers: 228 },
];

const mockUserActivityData = [
  { hour: '00:00', activeUsers: 45 },
  { hour: '04:00', activeUsers: 32 },
  { hour: '08:00', activeUsers: 78 },
  { hour: '12:00', activeUsers: 125 },
  { hour: '16:00', activeUsers: 98 },
  { hour: '20:00', activeUsers: 86 },
  { hour: '23:59', activeUsers: 52 },
];

const mockUsersByRegion = [
  { region: 'North America', users: 85, percentage: 40.5 },
  { region: 'Europe', users: 65, percentage: 31.0 },
  { region: 'Asia', users: 45, percentage: 21.4 },
  { region: 'Others', users: 15, percentage: 7.1 },
];

const mockTopUsers = [
  { name: 'John Doe', email: 'john@example.com', toolsUsed: 12, lastActive: '2 hours ago' },
  { name: 'Jane Smith', email: 'jane@example.com', toolsUsed: 10, lastActive: '5 hours ago' },
  { name: 'Mike Johnson', email: 'mike@example.com', toolsUsed: 8, lastActive: '1 day ago' },
  { name: 'Sarah Williams', email: 'sarah@example.com', toolsUsed: 7, lastActive: '2 days ago' },
];

export default function UserAnalytics({ dateRange }: UserAnalyticsProps) {
  const { data, isLoading, error, refetch } = useUserAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading state for user metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <AnalyticsCardSkeleton key={i} />
          ))}
        </div>
        
        {/* Loading state for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsChartSkeleton />
          <AnalyticsChartSkeleton />
        </div>
        
        {/* Loading state for tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsTableSkeleton />
          <AnalyticsTableSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AnalyticsErrorState
        title="Failed to load user analytics"
        message="Unable to fetch user analytics data. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  // Use API data if available, otherwise fall back to mock data
  const userAnalytics = data?.user_analytics || {};
  
  // Extract metrics from API response
  const newUsers = userAnalytics.new_users?.value || 125;
  const newUsersChange = userAnalytics.new_users?.change || 23;
  const newUsersChangeType = userAnalytics.new_users?.change_type || 'increase';
  
  const activeUsers = userAnalytics.active_users?.value || 189;
  const activeUsersChange = userAnalytics.active_users?.change || 15;
  const activeUsersChangeType = userAnalytics.active_users?.change_type || 'increase';
  
  const avgSessionTime = userAnalytics.avg_session_time?.value || 24;
  const avgSessionTimeChange = userAnalytics.avg_session_time?.change || 5;
  const avgSessionTimeChangeType = userAnalytics.avg_session_time?.change_type || 'increase';
  
  const totalUsers = userAnalytics.total_users || 342;
  
  // Chart data from API
  const userGrowthData = userAnalytics.user_growth?.length > 0 ? userAnalytics.user_growth : mockNewUsersData;
  const topUsersData = userAnalytics.top_users?.length > 0 ? userAnalytics.top_users : mockTopUsers;

  return (
    <div className="space-y-6">
      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                New Users
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-blue-50 group-hover:scale-110 transition-transform">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">{newUsers}</div>
              <div className="flex items-center gap-1">
                {newUsersChangeType === 'increase' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${newUsersChangeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                  {newUsersChangeType === 'increase' ? '+' : ''}{newUsersChange}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This {dateRange === '24h' ? 'day' : 'period'}
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Users
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-purple-50 group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">{activeUsers}</div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {((activeUsers / totalUsers) * 100).toFixed(1)}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Of total users
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Session Time
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-green-50 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">{avgSessionTime}m</div>
              <div className="flex items-center gap-1">
                {avgSessionTimeChangeType === 'increase' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${avgSessionTimeChangeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                  {avgSessionTimeChangeType === 'increase' ? '+' : ''}{avgSessionTimeChange}m
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Per session
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tool Authentications
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-amber-50 group-hover:scale-110 transition-transform">
                <UserCheck className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">{totalUsers}</div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">+15%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Users Trend */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">User Growth Trend</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                Growing
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalUsers" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorNewUsers)" 
                  name="Total Users"
                />
                <Bar dataKey="newUsers" fill="#10b981" name="New Users" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Activity Heatmap */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">User Activity Pattern</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                Today
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockUserActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="activeUsers" 
                  fill="#10b981" 
                  name="Active Users"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution and Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Distribution */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Users by Region</CardTitle>
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUsersByRegion.map((region) => (
                <div key={region.region} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{region.region}</span>
                    <span className="text-sm text-gray-600">{region.users} users</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Active Users */}
        <Card className="col-span-2 border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Most Active Users</CardTitle>
              <Button variant="outline" size="sm" className="hover:bg-gray-50">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTopUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.toolsUsed} tools</p>
                    <p className="text-xs text-gray-500">{user.lastActive}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 