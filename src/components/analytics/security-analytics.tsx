'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield,
  Lock,
  AlertTriangle,
  UserX,
  CheckCircle2,
  Activity,
  Globe,
  Key,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useSecurityAnalytics } from '@/hooks/use-analytics';
import { AnalyticsCardSkeleton, AnalyticsChartSkeleton, AnalyticsTableSkeleton, AnalyticsErrorState } from './analytics-skeleton';

interface SecurityAnalyticsProps {
  dateRange: string;
}

// Mock data
const mockSecurityEvents = [
  { time: '00:00', loginAttempts: 45, failedLogins: 2, suspiciousActivity: 0 },
  { time: '04:00', loginAttempts: 32, failedLogins: 1, suspiciousActivity: 0 },
  { time: '08:00', loginAttempts: 125, failedLogins: 5, suspiciousActivity: 1 },
  { time: '12:00', loginAttempts: 180, failedLogins: 8, suspiciousActivity: 2 },
  { time: '16:00', loginAttempts: 156, failedLogins: 6, suspiciousActivity: 1 },
  { time: '20:00', loginAttempts: 98, failedLogins: 3, suspiciousActivity: 0 },
];

const mockAuthMethodsUsage = [
  { method: 'API Key', value: 45, color: '#3b82f6' },
  { method: 'OAuth', value: 30, color: '#8b5cf6' },
  { method: 'JWT', value: 20, color: '#10b981' },
  { method: 'Basic Auth', value: 5, color: '#f59e0b' },
];

const mockSecurityScore = [
  { subject: 'Authentication', score: 95, fullMark: 100 },
  { subject: 'Authorization', score: 92, fullMark: 100 },
  { subject: 'Encryption', score: 98, fullMark: 100 },
  { subject: 'API Security', score: 88, fullMark: 100 },
  { subject: 'Data Protection', score: 90, fullMark: 100 },
  { subject: 'Compliance', score: 85, fullMark: 100 },
];

const mockSuspiciousIPs = [
  { ip: '192.168.1.100', attempts: 15, location: 'Unknown', status: 'blocked' },
  { ip: '10.0.0.55', attempts: 12, location: 'Russia', status: 'monitoring' },
  { ip: '172.16.0.23', attempts: 8, location: 'China', status: 'monitoring' },
  { ip: '203.0.113.45', attempts: 5, location: 'Brazil', status: 'allowed' },
];

const mockRecentSecurityEvents = [
  { id: 1, type: 'failed_login', message: 'Multiple failed login attempts from IP 192.168.1.100', severity: 'high', time: '2 hours ago' },
  { id: 2, type: 'api_abuse', message: 'Rate limit exceeded for API key ending in ...x7f9', severity: 'medium', time: '4 hours ago' },
  { id: 3, type: 'permission_change', message: 'Admin privileges granted to user john@example.com', severity: 'info', time: '6 hours ago' },
  { id: 4, type: 'suspicious_activity', message: 'Unusual data access pattern detected', severity: 'high', time: '8 hours ago' },
];

export default function SecurityAnalytics({ dateRange }: SecurityAnalyticsProps) {
  const { data, isLoading, error, refetch } = useSecurityAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading state for security metrics */}
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
        title="Failed to load security analytics"
        message="Unable to fetch security analytics data. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  // Use API data if available, otherwise fall back to mock data
  const securityAnalytics = data?.securityAnalytics || {};
  const overallSecurityScore = securityAnalytics.securityScore || 91;
  
  return (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Security Score
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-green-50 group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">{overallSecurityScore}/100</div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Excellent
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Overall security health
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Failed Logins
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-blue-50 group-hover:scale-110 transition-transform">
                <UserX className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">28</div>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">-15%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Suspicious Activities
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-amber-50 group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">5</div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                Monitoring
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Active threats
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Sessions
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-purple-50 group-hover:scale-110 transition-transform">
                <Key className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-gray-900">342</div>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Active</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Authenticated users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {mockRecentSecurityEvents.filter(e => e.severity === 'high').length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong>Security Alert:</strong> {mockRecentSecurityEvents.filter(e => e.severity === 'high').length} high-severity events detected in the last 24 hours. Immediate attention required.
          </AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Events Timeline */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Security Events Timeline</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                24 hours
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockSecurityEvents}>
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
                <Line type="monotone" dataKey="loginAttempts" stroke="#3b82f6" strokeWidth={2} name="Login Attempts" />
                <Line type="monotone" dataKey="failedLogins" stroke="#ef4444" strokeWidth={2} name="Failed Logins" />
                <Line type="monotone" dataKey="suspiciousActivity" stroke="#f59e0b" strokeWidth={2} name="Suspicious Activity" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Authentication Methods */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Authentication Methods</CardTitle>
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockAuthMethodsUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockAuthMethodsUsage.map((entry, index) => (
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

      {/* Security Score Radar */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Security Assessment</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              Score: {overallSecurityScore}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={mockSecurityScore}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={12} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" fontSize={10} />
              <Radar name="Security Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suspicious IPs */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Suspicious IP Addresses</CardTitle>
              <Button variant="outline" size="sm" className="hover:bg-gray-50">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockSuspiciousIPs.map((ip, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="font-mono text-sm font-medium text-gray-900">{ip.ip}</p>
                      <p className="text-xs text-gray-500">{ip.location} • {ip.attempts} attempts</p>
                    </div>
                  </div>
                  <Badge className={`${
                    ip.status === 'blocked' ? 'bg-red-100 text-red-800 border-red-200' :
                    ip.status === 'monitoring' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {ip.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Security Events</CardTitle>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRecentSecurityEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    event.severity === 'high' ? 'bg-red-50' :
                    event.severity === 'medium' ? 'bg-amber-50' :
                    'bg-blue-50'
                  }`}>
                    {event.severity === 'high' ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : event.severity === 'medium' ? (
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Info className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{event.time}</p>
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