'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Mail,
  Calendar,
  Shield,
  Activity,
  Key,
  UserCheck,
  UserX,
  Clock,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Edit,
  Ban,
  RefreshCw,
  User,
  Settings,
  Smartphone,
  Monitor,
  Trash2
} from 'lucide-react';
import { useUserDetail } from '@/hooks/use-users';
import { UserErrorState } from './user-skeleton';
import { UserDetail } from '@/types/users';

interface UserDetailDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetailDialog({
  userId,
  open,
  onOpenChange
}: UserDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: user, isLoading, error, refetch } = useUserDetail(userId || '');

  console.log('🎯 [UserDetailDialog] Component render:', {
    userId,
    open,
    user,
    isLoading,
    error,
    userToolCount: user?.toolCount,
    userActiveToolCount: user?.activeToolCount,
    userSessionCount: user?.sessionCount,
    userTotalLogins: user?.totalLogins
  });

  const getInitials = (username: string | null, email: string | null) => {
    console.log('🔍 getInitials called with:', { username, email });
    
    if (username && username.trim() && username.length > 0) {
      const initials = username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      console.log('✅ Using username initials:', initials);
      return initials;
    }
    
    if (email && email.trim() && email.length > 0) {
      const initials = email.substring(0, 2).toUpperCase();
      console.log('✅ Using email initials:', initials);
      return initials;
    }
    
    console.log('✅ Using default initials: UN');
    return 'UN'; // Default for unnamed users
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getToolStatusIcon = (isAuthenticated: boolean) => {
    return isAuthenticated ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getSessionIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return <Smartphone className="h-4 w-4 text-gray-500" />;
    }
    return <Monitor className="h-4 w-4 text-gray-500" />;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'tool_auth':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'tool_execution':
        return <Settings className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Loading User Details...</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <UserErrorState
            title="Failed to load user details"
            message="Unable to fetch user information. Please try again."
            onRetry={() => refetch()}
          />
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader>
          <div className="flex items-start justify-between p-6 pb-0">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar || undefined} alt={user?.username || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {getInitials(user?.username, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {user?.username || 'Unnamed User'}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{user?.email || 'No email provided'}</span>
                  <Badge 
                    className={getStatusColor(user?.is_active || false)}
                  >
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={user?.is_active ? "text-amber-600" : "text-green-600"}
              >
                {user?.is_active ? (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            </div>
          </div>
          <DialogDescription>
            View detailed information about this user including their tools, sessions, and activity history.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px] mt-6">
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* User Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">User ID</p>
                        <p className="font-mono text-sm">{user.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm">{formatDate(user.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Active</p>
                        <p className="text-sm">{user.lastActiveAt ? formatDate(user.lastActiveAt) : 'Never'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Logins</p>
                        <p className="text-sm">{user.totalLogins || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tools</p>
                          <p className="text-2xl font-bold">{user.toolCount || 0}</p>
                        </div>
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Tools</p>
                          <p className="text-2xl font-bold">{user.activeToolCount || 0}</p>
                        </div>
                        <Key className="h-8 w-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Sessions</p>
                          <p className="text-2xl font-bold">{user.sessionCount || 0}</p>
                        </div>
                        <Activity className="h-8 w-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tools" className="space-y-4 mt-0">
                {user.tools && user.tools.length > 0 ? (
                  user.tools.map((tool) => (
                    <Card key={tool.id} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-100">
                              {getToolStatusIcon(tool.is_authenticated)}
                            </div>
                            <div>
                              <p className="font-medium">{tool.name}</p>
                              <p className="text-sm text-muted-foreground">{tool.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge 
                              className={tool.is_authenticated 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {tool.is_authenticated ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Authenticated
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Not Authenticated
                                </>
                              )}
                            </Badge>
                            {tool.last_used && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Last used {new Date(tool.last_used).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tools configured</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 mt-0">
                {user.activities && user.activities.length > 0 ? (
                  user.activities.map((activity, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'login' ? 'bg-green-500' :
                          activity.type === 'tool_auth' ? 'bg-blue-500' :
                          activity.type === 'tool_execution' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`} />
                        {index < user.activities.length - 1 && (
                          <div className="absolute top-4 left-[3px] w-0.5 h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{activity.description}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(activity.timestamp)}
                            </p>
                          </div>
                          {activity.metadata && (
                            <Badge variant="outline" className="text-xs">
                              {activity.metadata}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sessions" className="space-y-4 mt-0">
                {user.sessions && user.sessions.length > 0 ? (
                  user.sessions.map((session) => (
                    <Card key={session.id} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">Session #{session.id.slice(-8)}</p>
                              {session.is_active && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Started {formatDate(session.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">IP Address</p>
                            <p className="font-mono text-sm">{session.ip_address || 'Unknown'}</p>
                          </div>
                        </div>
                        {session.user_agent && (
                          <p className="text-xs text-muted-foreground mt-3">
                            {session.user_agent}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No sessions found</p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 