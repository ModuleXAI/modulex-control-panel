'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationStore } from '@/store/organization-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Building2, 
  ChevronDown, 
  Crown, 
  Shield, 
  Users,
  CheckCircle2
} from 'lucide-react';

export function OrganizationSwitcher() {
  const router = useRouter();
  const { 
    organizations, 
    selectedOrganization, 
    selectOrganization 
  } = useOrganizationStore();
  
  const [isOpen, setIsOpen] = useState(false);

  const handleOrganizationChange = (organizationId: string) => {
    selectOrganization(organizationId);
    setIsOpen(false);
    
    // Optional: refresh the page to reload data for new organization
    window.location.reload();
  };

  const handleSelectOrganization = () => {
    router.push('/select-organization');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-blue-600" />;
      default:
        return <Users className="h-3 w-3 text-green-600" />;
    }
  };

  if (!selectedOrganization) {
    return (
      <Button 
        variant="outline" 
        onClick={handleSelectOrganization}
        className="border-gray-200 hover:bg-gray-50"
      >
        <Building2 className="h-4 w-4 mr-2" />
        Select Organization
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="border-gray-200 hover:bg-gray-50 min-w-0 max-w-64"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 bg-blue-100 rounded">
              <Building2 className="h-3 w-3 text-blue-600" />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate">
                {selectedOrganization.name}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {selectedOrganization.domain}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-80">
        <div className="px-3 py-2 border-b">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Current Organization
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="p-1 bg-blue-100 rounded">
              <Building2 className="h-3 w-3 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedOrganization.name}
              </p>
              <div className="flex items-center gap-2">
                {getRoleIcon(selectedOrganization.role)}
                <span className="text-xs text-gray-500">
                  {selectedOrganization.role.charAt(0).toUpperCase() + selectedOrganization.role.slice(1)}
                </span>
                {selectedOrganization.is_default && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 bg-green-100 text-green-800 border-green-200">
                    Default
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {organizations.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Switch Organization
              </p>
              <div className="space-y-1">
                {organizations
                  .filter(org => org.id !== selectedOrganization.id)
                  .map((org) => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => handleOrganizationChange(org.id)}
                      className="cursor-pointer p-2 rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="p-1 bg-gray-100 rounded">
                          <Building2 className="h-3 w-3 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {org.name}
                          </p>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(org.role)}
                            <span className="text-xs text-gray-500">
                              {org.role.charAt(0).toUpperCase() + org.role.slice(1)}
                            </span>
                            {org.is_default && (
                              <Badge variant="secondary" className="text-xs px-1 py-0 bg-green-100 text-green-800 border-green-200">
                                Default
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
              </div>
            </div>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSelectOrganization}
          className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Building2 className="h-4 w-4 mr-2" />
          Manage Organizations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 