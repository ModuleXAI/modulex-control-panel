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
  Eye
} from 'lucide-react';
import { useLogs } from '@/hooks/use-logs';
import { LogFilters, LogType, LogLevel, LogEntry } from '@/types/logs';

const LOG_TYPE_ICONS = {
  request: FileText,
  security: Shield,
  business: Briefcase,
  error: AlertTriangle,
  system: Settings,
  audit: Eye,
};

const LOG_LEVEL_COLORS = {
  INFO: 'bg-blue-100 text-blue-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-red-200 text-red-900',
};

export default function LogsSection() {
  const [filters, setFilters] = useState<LogFilters>({
    limit: 50,
    offset: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<LogType | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');

  const { data: logsResponse, isLoading, error, refetch } = useLogs(filters);

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      offset: 0, // Reset pagination when searching
    }));
  };

  const handleTypeFilter = (type: LogType | 'all') => {
    setSelectedType(type);
    setFilters(prev => ({
      ...prev,
      type: type === 'all' ? undefined : type,
      offset: 0,
    }));
  };

  const handleLevelFilter = (level: LogLevel | 'all') => {
    setSelectedLevel(level);
    setFilters(prev => ({
      ...prev,
      level: level === 'all' ? undefined : level,
      offset: 0,
    }));
  };

  const handlePreviousPage = () => {
    setFilters(prev => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
  };

  const handleNextPage = () => {
    if (logsResponse?.pagination.hasMore) {
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
    const IconComponent = LOG_TYPE_ICONS[log.type];
    const levelColor = log.level ? LOG_LEVEL_COLORS[log.level] : 'bg-gray-100 text-gray-800';

    return (
      <div key={log.id} className="border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              <IconComponent className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {log.type}
                </Badge>
                {log.level && (
                  <Badge className={`text-xs ${levelColor}`}>
                    {log.level}
                  </Badge>
                )}
                <span className="text-xs text-gray-500">
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-900 mb-2">{log.message}</p>
              {Object.keys(log.data).length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                    View details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentPage = Math.floor(filters.offset / filters.limit) + 1;
  const totalPages = logsResponse?.pagination.total 
    ? Math.ceil(logsResponse.pagination.total / filters.limit)
    : 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Logs</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedType} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Type" />
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
          <Select value={selectedLevel} onValueChange={handleLevelFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="INFO">Info</SelectItem>
              <SelectItem value="WARNING">Warning</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} className="w-full md:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Apply
          </Button>
        </div>

        {/* Logs List */}
        <div className="border rounded-lg">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading logs...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">Failed to load logs</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : logsResponse?.logs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No logs found</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              {logsResponse?.logs.map(renderLogEntry)}
            </ScrollArea>
          )}
        </div>

        {/* Pagination */}
        {logsResponse && logsResponse.logs.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filters.offset + 1} to {Math.min(filters.offset + filters.limit, logsResponse.pagination.total)} of {logsResponse.pagination.total} logs
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={filters.offset === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!logsResponse.pagination.hasMore}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 