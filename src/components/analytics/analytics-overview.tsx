'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Package, 
  Activity,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  UserCheck,
  Clock,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { useAnalyticsOverview } from '@/hooks/use-analytics';
import { AnalyticsCardSkeleton, AnalyticsChartSkeleton, AnalyticsErrorState } from './analytics-skeleton';

interface AnalyticsOverviewProps {
  dateRange: string;
}

// Mock data - will be replaced with API calls
const mockUserGrowthData = [
  { date: 'Mon', users: 120, newUsers: 15 },
  { date: 'Tue', users: 132, newUsers: 12 },
  { date: 'Wed', users: 145, newUsers: 13 },
  { date: 'Thu', users: 158, newUsers: 13 },
  { date: 'Fri', users: 175, newUsers: 17 },
  { date: 'Sat', users: 190, newUsers: 15 },
  { date: 'Sun', users: 210, newUsers: 20 },
];

const mockToolUsageData = [
  { name: 'GitHub', value: 35, color: '#6366f1' },
  { name: 'Slack', value: 25, color: '#8b5cf6' },
  { name: 'Jira', value: 20, color: '#ec4899' },
  { name: 'AWS', value: 15, color: '#f59e0b' },
  { name: 'Others', value: 5, color: '#6b7280' },
];

const mockApiPerformanceData = [
  { time: '00:00', avgResponseTime: 120, requests: 450 },
  { time: '04:00', avgResponseTime: 115, requests: 320 },
  { time: '08:00', avgResponseTime: 135, requests: 780 },
  { time: '12:00', avgResponseTime: 145, requests: 920 },
  { time: '16:00', avgResponseTime: 130, requests: 850 },
  { time: '20:00', avgResponseTime: 125, requests: 680 },
  { time: '23:59', avgResponseTime: 118, requests: 520 },
];

// Helper functions for calculations
const calculateGrowthPercentage = (userGrowthData: any[]) => {
  if (userGrowthData.length < 2) return 0;
  const latest = userGrowthData[userGrowthData.length - 1];
  const previous = userGrowthData[userGrowthData.length - 2];
  return ((latest.users - previous.users) / previous.users * 100);
};

const calculateAvgResponseTime = (performanceData: any[]) => {
  if (performanceData.length === 0) return 128;
  const avgResponseTime = performanceData.reduce((sum, item) => sum + item.response_time, 0) / performanceData.length;
  return Math.round(avgResponseTime);
};

export default function AnalyticsOverview({ dateRange }: AnalyticsOverviewProps) {
  const { data, isLoading, error, refetch } = useAnalyticsOverview(dateRange);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading state for key metrics */}
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsChartSkeleton />
          <AnalyticsChartSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AnalyticsErrorState
        title="Failed to load overview data"
        message="Unable to fetch analytics overview. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  // Use API data if available, otherwise fall back to mock data
  const overview = data?.overview || {};
  const totalUsers = overview.total_users || 210;
  const userGrowth = overview.user_growth?.length > 0 ? calculateGrowthPercentage(overview.user_growth) : 15.2;
  const totalTools = overview.total_tools || 45;
  const activeTools = overview.active_tools || 38;
  const avgResponseTime = overview.system_performance?.length > 0 ? 
    calculateAvgResponseTime(overview.system_performance) : 128;
  const responseTimeChange = -5.3; // Calculate from historical data if available
  const systemUptime = overview.system_health === 'optimal' ? 99.9 : 
                       overview.system_health === 'good' ? 99.5 :
                       overview.system_health === 'warning' ? 95.0 : 85.0;
  const securityScore = 95; // This should come from security analytics

  // Prepare chart data from API response
  const userGrowthData = overview.user_growth?.length > 0 ? overview.user_growth : mockUserGrowthData;
  const toolUsageData = overview.tool_usage?.length > 0 ? overview.tool_usage : mockToolUsageData;
  const apiPerformanceData = overview.system_performance?.length > 0 ? 
    overview.system_performance.map((item: any) => ({
      time: item.time,
      avgResponseTime: item.response_time,
      requests: Math.floor(Math.random() * 500) + 300 // Mock request count if not available
    })) : mockApiPerformanceData;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-blue-50 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {totalUsers.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{userGrowth}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              vs previous period
            </p>
          </CardContent>
        </Card>

        {/* Active Tools */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Tools
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-purple-50 group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {activeTools}/{totalTools}
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {((activeTools/totalTools) * 100).toFixed(0)}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tool utilization rate
            </p>
          </CardContent>
        </Card>

        {/* API Performance */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Response Time
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-green-50 group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {avgResponseTime}ms
              </div>
              <div className="flex items-center gap-1">
                <ArrowDownRight className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {Math.abs(responseTimeChange)}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Performance improved
            </p>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                System Health
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-emerald-50 group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {systemUptime}%
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                Healthy
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Security score: {securityScore}/100
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">User Growth</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{userGrowth}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="users" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="newUsers" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tool Usage Distribution */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Tool Usage Distribution</CardTitle>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                Top 5
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={toolUsageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {toolUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* API Performance Chart */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">API Performance Over Time</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                <span className="text-sm text-gray-600">Response Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
                <span className="text-sm text-gray-600">Request Count</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={apiPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="avgResponseTime" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Avg Response Time (ms)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="requests" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Request Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 