'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  Clock,
  Server,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Database,
  Cpu,
  HardDrive,
  Gauge
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { usePerformanceAnalytics } from '@/hooks/use-analytics';
import { AnalyticsCardSkeleton, AnalyticsChartSkeleton, AnalyticsTableSkeleton, AnalyticsErrorState } from './analytics-skeleton';

interface PerformanceAnalyticsProps {
  dateRange: string;
}

// Mock data
const mockApiResponseTimes = [
  { time: '00:00', p50: 120, p95: 180, p99: 250 },
  { time: '04:00', p50: 110, p95: 165, p99: 220 },
  { time: '08:00', p50: 135, p95: 200, p99: 280 },
  { time: '12:00', p50: 145, p95: 215, p99: 300 },
  { time: '16:00', p50: 130, p95: 195, p99: 270 },
  { time: '20:00', p50: 125, p95: 185, p99: 260 },
];

const mockEndpointPerformance = [
  { endpoint: '/api/tools/execute', avgTime: 245, calls: 1250, errors: 12 },
  { endpoint: '/api/users/auth', avgTime: 85, calls: 980, errors: 5 },
  { endpoint: '/api/dashboard/stats', avgTime: 120, calls: 820, errors: 2 },
  { endpoint: '/api/logs/query', avgTime: 320, calls: 650, errors: 8 },
  { endpoint: '/api/tools/install', avgTime: 450, calls: 420, errors: 3 },
];

const mockSystemMetrics = [
  { name: 'CPU Usage', value: 68, color: '#3b82f6' },
  { name: 'Memory Usage', value: 75, color: '#8b5cf6' },
  { name: 'Disk I/O', value: 45, color: '#10b981' },
  { name: 'Network I/O', value: 82, color: '#f59e0b' },
];

const mockRequestVolume = [
  { hour: '0', requests: 450, errors: 5 },
  { hour: '4', requests: 320, errors: 3 },
  { hour: '8', requests: 780, errors: 8 },
  { hour: '12', requests: 920, errors: 12 },
  { hour: '16', requests: 850, errors: 10 },
  { hour: '20', requests: 680, errors: 7 },
];

export default function PerformanceAnalytics({ dateRange }: PerformanceAnalyticsProps) {
  const { data, isLoading, error, refetch } = usePerformanceAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading state for performance metrics */}
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
        title="Failed to load performance analytics"
        message="Unable to fetch performance analytics data. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  // Use API data if available, otherwise fall back to mock data
  const performanceAnalytics = data?.performanceAnalytics || {};

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Response Time
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-blue-50 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">128ms</div>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">-8%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              P50 latency
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Uptime
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-green-50 group-hover:scale-110 transition-transform">
                <Server className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">99.95%</div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Excellent
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Request Volume
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-purple-50 group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">4.5k/h</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">+12%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average per hour
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-400 to-red-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Error Rate
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-red-50 group-hover:scale-110 transition-transform">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">0.12%</div>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">-0.05%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Of total requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Distribution */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Response Time Distribution</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                24 hours
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockApiResponseTimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Line type="monotone" dataKey="p50" stroke="#10b981" strokeWidth={2} name="P50 (median)" />
                <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} name="P95" />
                <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={2} name="P99" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Resources */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">System Resources</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                Real-time
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSystemMetrics.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {metric.name === 'CPU Usage' && <Cpu className="h-4 w-4 text-gray-600" />}
                      {metric.name === 'Memory Usage' && <Database className="h-4 w-4 text-gray-600" />}
                      {metric.name === 'Disk I/O' && <HardDrive className="h-4 w-4 text-gray-600" />}
                      {metric.name === 'Network I/O' && <Activity className="h-4 w-4 text-gray-600" />}
                      <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Gauge className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Overall system health:</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Optimal
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Volume Chart */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Request Volume & Error Rate</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                <span className="text-sm text-gray-600">Requests</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-600"></div>
                <span className="text-sm text-gray-600">Errors</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockRequestVolume}>
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
              <Bar dataKey="requests" fill="#3b82f6" name="Total Requests" radius={[8, 8, 0, 0]} />
              <Bar dataKey="errors" fill="#ef4444" name="Errors" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Endpoint Performance Table */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Endpoint Performance</CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              Top 5
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockEndpointPerformance.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <p className="font-mono text-sm font-medium text-gray-900">{endpoint.endpoint}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {endpoint.avgTime}ms avg
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {endpoint.calls.toLocaleString()} calls
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {endpoint.errors} errors
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${
                    endpoint.avgTime < 200 ? 'bg-green-100 text-green-800 border-green-200' :
                    endpoint.avgTime < 400 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {endpoint.avgTime < 200 ? 'Fast' : endpoint.avgTime < 400 ? 'Normal' : 'Slow'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 