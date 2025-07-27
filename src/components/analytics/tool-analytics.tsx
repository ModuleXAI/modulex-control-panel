'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  TrendingUp,
  Users,
  Activity,
  Download,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useToolAnalytics } from '@/hooks/use-analytics';
import { AnalyticsCardSkeleton, AnalyticsChartSkeleton, AnalyticsTableSkeleton, AnalyticsErrorState } from './analytics-skeleton';

interface ToolAnalyticsProps {
  dateRange: string;
}

// Mock data
const mockToolAdoptionData = [
  { month: 'Jan', installations: 12, uninstallations: 2 },
  { month: 'Feb', installations: 18, uninstallations: 3 },
  { month: 'Mar', installations: 25, uninstallations: 1 },
  { month: 'Apr', installations: 22, uninstallations: 4 },
  { month: 'May', installations: 30, uninstallations: 2 },
  { month: 'Jun', installations: 35, uninstallations: 3 },
];

const mockToolUsageByCategory = [
  { category: 'Development', usage: 450, percentage: 35, color: '#3b82f6' },
  { category: 'Communication', usage: 320, percentage: 25, color: '#8b5cf6' },
  { category: 'Project Management', usage: 280, percentage: 22, color: '#ec4899' },
  { category: 'Analytics', usage: 150, percentage: 12, color: '#f59e0b' },
  { category: 'Security', usage: 80, percentage: 6, color: '#10b981' },
];

const mockTopTools = [
  { name: 'GitHub', users: 185, usage: 1250, successRate: 98.5, trend: 'up' },
  { name: 'Slack', users: 172, usage: 980, successRate: 99.2, trend: 'up' },
  { name: 'Jira', users: 156, usage: 820, successRate: 97.8, trend: 'stable' },
  { name: 'AWS', users: 142, usage: 650, successRate: 96.5, trend: 'up' },
  { name: 'Datadog', users: 98, usage: 420, successRate: 99.8, trend: 'down' },
];

const mockToolPerformance = [
  { time: '00:00', avgExecutionTime: 250, successRate: 98 },
  { time: '04:00', avgExecutionTime: 220, successRate: 99 },
  { time: '08:00', avgExecutionTime: 280, successRate: 97 },
  { time: '12:00', avgExecutionTime: 320, successRate: 96 },
  { time: '16:00', avgExecutionTime: 290, successRate: 97 },
  { time: '20:00', avgExecutionTime: 260, successRate: 98 },
];

export default function ToolAnalytics({ dateRange }: ToolAnalyticsProps) {
  const { data, isLoading, error, refetch } = useToolAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading state for tool metrics */}
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
        title="Failed to load tool analytics"
        message="Unable to fetch tool analytics data. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  // Use API data if available, otherwise fall back to mock data
  const toolAnalytics = data?.tool_analytics || {};
  
  // Extract metrics from API response
  const totalInstallations = toolAnalytics.total_installations?.value || 142;
  const totalInstallationsChange = toolAnalytics.total_installations?.change || 28;
  const totalInstallationsChangeType = toolAnalytics.total_installations?.change_type || 'increase';
  
  const toolExecutions = toolAnalytics.tool_executions?.value || 4200;
  const toolExecutionsChange = toolAnalytics.tool_executions?.change || 15;
  const toolExecutionsChangeType = toolAnalytics.tool_executions?.change_type || 'increase';
  
  const successRate = toolAnalytics.success_rate?.value || 97.8;
  const successRateChange = toolAnalytics.success_rate?.change || 0.5;
  const successRateChangeType = toolAnalytics.success_rate?.change_type || 'increase';
  
  const avgExecutionTime = toolAnalytics.avg_execution_time?.value || 275;
  const avgExecutionTimeChange = toolAnalytics.avg_execution_time?.change || -12;
  const avgExecutionTimeChangeType = toolAnalytics.avg_execution_time?.change_type || 'decrease';
  
  // Chart data from API
  const toolAdoptionData = toolAnalytics.tool_adoption?.length > 0 ? toolAnalytics.tool_adoption : mockToolAdoptionData;
  const topToolsData = toolAnalytics.top_tools?.length > 0 ? toolAnalytics.top_tools : mockTopTools;

  return (
    <div className="space-y-6">
      {/* Tool Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Installations
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-purple-50 group-hover:scale-110 transition-transform">
                <Download className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">{totalInstallations}</div>
              <div className="flex items-center gap-1">
                {totalInstallationsChangeType === 'increase' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${totalInstallationsChangeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                  {totalInstallationsChangeType === 'increase' ? '+' : ''}{totalInstallationsChange}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This {dateRange === '24h' ? 'day' : 'period'}
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tool Executions
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-blue-50 group-hover:scale-110 transition-transform">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">{toolExecutions >= 1000 ? `${(toolExecutions/1000).toFixed(1)}k` : toolExecutions}</div>
              <div className="flex items-center gap-1">
                {toolExecutionsChangeType === 'increase' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${toolExecutionsChangeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                  {toolExecutionsChangeType === 'increase' ? '+' : ''}{toolExecutionsChange}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total executions
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Success Rate
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-green-50 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">{successRate}%</div>
              <Badge className={`border ${successRate >= 95 ? 'bg-green-100 text-green-800 border-green-200' : successRate >= 90 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                {successRate >= 95 ? 'Excellent' : successRate >= 90 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Execution success
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Execution Time
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-amber-50 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">{avgExecutionTime}ms</div>
              <div className="flex items-center gap-1">
                {avgExecutionTimeChangeType === 'decrease' ? (
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${avgExecutionTimeChangeType === 'decrease' ? 'text-green-600' : 'text-red-600'}`}>
                  {avgExecutionTimeChangeType === 'decrease' ? '' : '+'}{avgExecutionTimeChange}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {avgExecutionTimeChangeType === 'decrease' ? 'Performance improved' : 'Performance declined'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Adoption Trend */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Tool Adoption Trend</CardTitle>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                6 months
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={toolAdoptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="installations" fill="#10b981" name="Installations" radius={[8, 8, 0, 0]} />
                <Bar dataKey="uninstallations" fill="#ef4444" name="Uninstallations" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tool Usage by Category */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Usage by Category</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                All time
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockToolUsageByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="usage"
                >
                  {mockToolUsageByCategory.map((entry, index) => (
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
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => {
                    const item = mockToolUsageByCategory.find(i => i.usage === value);
                    return `${item?.category} (${item?.percentage}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tool Performance Chart */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Tool Performance Metrics</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                <span className="text-sm text-gray-600">Execution Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
                <span className="text-sm text-gray-600">Success Rate</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockToolPerformance}>
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
                dataKey="avgExecutionTime" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Avg Execution Time (ms)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="successRate" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Success Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Tools Table */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Top Performing Tools</CardTitle>
            <Button variant="outline" size="sm" className="hover:bg-gray-50">
              View All Tools
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topToolsData.map((tool, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{tool.name}</p>
                      {tool.trend === 'up' && (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      )}
                      {tool.trend === 'down' && (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {tool.users} users
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {tool.usage} executions
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <Badge className={`${
                      tool.successRate >= 99 ? 'bg-green-100 text-green-800 border-green-200' :
                      tool.successRate >= 95 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {tool.successRate}%
                    </Badge>
                  </div>
                  <Progress value={tool.successRate} className="w-32 h-2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 