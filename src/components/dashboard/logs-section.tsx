'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Calendar,
  FileText,
  Shield,
  Briefcase,
  AlertTriangle,
  Settings,
  ClipboardList,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useLogs } from '@/hooks/use-logs';
import { LogFilters, LogType, LogLevel, LogEntry } from '@/types/logs';

const LOG_TYPE_ICONS = {
  request: FileText,
  security: Shield,
  business: Briefcase,
  error: AlertTriangle,
  system: Settings,
  audit: ClipboardList,
};

const LOG_LEVEL_STYLES = {
  INFO: {
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Info,
    iconColor: 'text-blue-600'
  },
  WARNING: {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: AlertCircle,
    iconColor: 'text-amber-600'
  },
  ERROR: {
    badge: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600'
  },
  CRITICAL: {
    badge: 'bg-red-200 text-red-900 border-red-300',
    icon: AlertTriangle,
    iconColor: 'text-red-700'
  },
};

export default function LogsSection() {
  const [filters, setFilters] = useState<LogFilters>({
    limit: 50,
    offset: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useLogs(filters);

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      offset: 0,
    }));
  };

  const handleTypeFilter = (log_type: LogType | 'all') => {
    setFilters(prev => ({
      ...prev,
      log_type: log_type === 'all' ? undefined : log_type,
      offset: 0,
    }));
  };

  const handleLevelFilter = (level: LogLevel | 'all') => {
    setFilters(prev => ({
      ...prev,
      level: level === 'all' ? undefined : level,
      offset: 0,
    }));
  };

  const handlePreviousPage = () => {
    if (data?.pagination.has_previous) {
      setFilters(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
      }));
    }
  };

  const handleNextPage = () => {
    if (data?.pagination.has_next) {
      setFilters(prev => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderLogEntry = (log: LogEntry) => {
    const IconComponent = LOG_TYPE_ICONS[log.log_type];
    const levelStyle = LOG_LEVEL_STYLES[log.level];
    const LevelIcon = levelStyle.icon;
    const isExpanded = expandedLog === log.id;

    return (
      <div 
        key={log.id} 
        className="border-0 rounded-lg p-3 hover:bg-gray-50 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md"
        onClick={() => setExpandedLog(isExpanded ? null : log.id)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-gray-50 flex-shrink-0">
              <IconComponent className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-0">
                  {log.log_type}
                </Badge>
                <Badge className={`text-xs px-2 py-0.5 border ${levelStyle.badge}`}>
                  <LevelIcon className={`h-3 w-3 mr-1 ${levelStyle.iconColor}`} />
                  {log.level}
                </Badge>
                {log.success !== null && (
                  <Badge 
                    variant={log.success ? "default" : "destructive"} 
                    className={`text-xs px-2 py-0.5 border ${
                      log.success 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}
                  >
                    {log.success ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {log.success ? 'Success' : 'Failed'}
                  </Badge>
                )}
                {log.category && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 border-purple-200">
                    {log.category}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                {log.message}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {log.tool_name && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {log.tool_name}
                  </span>
                )}
                {log.user_id && (
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    User: {log.user_id}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-right flex-shrink-0">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatTimestamp(log.timestamp)}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Log Details</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <span className="font-medium text-gray-600 min-w-[80px]">ID:</span>
                  <span className="text-gray-900 font-mono">{log.id}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-600 min-w-[80px]">Timestamp:</span>
                  <span className="text-gray-900">{log.timestamp}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-600 min-w-[80px]">Type:</span>
                  <span className="text-gray-900">{log.log_type}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-600 min-w-[80px]">Level:</span>
                  <span className="text-gray-900">{log.level}</span>
                </div>
                {log.user_id && (
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600 min-w-[80px]">User ID:</span>
                    <span className="text-gray-900">{log.user_id}</span>
                  </div>
                )}
                {log.tool_name && (
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600 min-w-[80px]">Tool:</span>
                    <span className="text-gray-900">{log.tool_name}</span>
                  </div>
                )}
                {log.category && (
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600 min-w-[80px]">Category:</span>
                    <span className="text-gray-900">{log.category}</span>
                  </div>
                )}
                {log.details && (
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600 min-w-[80px]">Details:</span>
                    <span className="text-gray-900">{log.details}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="font-medium text-gray-600 min-w-[80px]">Success:</span>
                  <span className="text-gray-900">
                    {log.success === null ? 'N/A' : log.success ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load logs</p>
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              className="hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-indigo-400 to-indigo-600" />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-indigo-50">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <span>Activity Logs</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-10 bg-white border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              size="sm"
              className="h-10 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Search
            </Button>
          </div>
          
          <Select value={filters.log_type || 'all'} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-36 h-10 bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="request">Request</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="audit">Audit</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.level || 'all'} onValueChange={handleLevelFilter}>
            <SelectTrigger className="w-36 h-10 bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="INFO">Info</SelectItem>
              <SelectItem value="WARNING">Warning</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg p-3 animate-pulse bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : data?.logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">No logs found</p>
              <p className="text-sm text-muted-foreground">
                Logs matching your criteria will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.logs.map(renderLogEntry)}
            </div>
          )}
        </ScrollArea>

        {/* Pagination */}
        {data && data.logs.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Showing {data.pagination.offset + 1} to {Math.min(data.pagination.offset + data.pagination.limit, data.pagination.total_count)} of {data.pagination.total_count.toLocaleString()} logs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!data.pagination.has_previous}
                className="hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!data.pagination.has_next}
                className="hover:bg-gray-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 