'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useOrganizationStore } from '@/store/organization-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Crown, 
  Shield, 
  Users, 
  CheckCircle2,
  Loader2 
} from 'lucide-react';

export default function SelectOrganizationPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { 
    organizations, 
    isLoading, 
    error, 
    fetchUserOrganizations, 
    selectOrganization 
  } = useOrganizationStore();
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch user organizations
    fetchUserOrganizations();
  }, [isAuthenticated, router, fetchUserOrganizations]);

  const handleOrganizationSelect = async (organizationId: string) => {
    setIsSelecting(true);
    setSelectedId(organizationId);
    
    try {
      selectOrganization(organizationId);
      
      // Small delay for user feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error selecting organization:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <Users className="h-4 w-4 text-green-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Organization
          </h1>
          <p className="text-gray-600">
            Choose an organization to continue to the dashboard
          </p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Welcome back, {user.name || user.email}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600 mt-4">Loading organizations...</p>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchUserOrganizations} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : organizations.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Organizations Found
              </h3>
              <p className="text-gray-600">
                You don't have access to any organizations yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card 
                key={org.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  selectedId === org.id 
                    ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !isSelecting && handleOrganizationSelect(org.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {org.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {org.domain}
                        </p>
                      </div>
                    </div>
                    
                    {org.is_default && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        Default
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(org.role)}
                      <Badge 
                        variant="secondary" 
                        className={getRoleBadgeColor(org.role)}
                      >
                        {org.role.charAt(0).toUpperCase() + org.role.slice(1)}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {org.slug}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button 
                      className="w-full" 
                      disabled={isSelecting && selectedId === org.id}
                      variant={selectedId === org.id ? "default" : "outline"}
                    >
                      {isSelecting && selectedId === org.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Selecting...
                        </>
                      ) : selectedId === org.id ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        'Select Organization'
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Joined {new Date(org.joined_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 