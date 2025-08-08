'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight, Check, Users, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth-store';
import { useOrganizationStore } from '@/store/organization-store';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

type OnboardingStep = 'welcome' | 'create-org' | 'intro' | 'complete';

interface CreateOrganizationFormData {
  name: string;
  domain: string;
  slug: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { /* user */ } = useAuthStore();
  const { /* organizations, */ fetchUserOrganizations, selectOrganization } = useOrganizationStore();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [hasOrganizations, setHasOrganizations] = useState(false);
  
  // Organization creation form
  const [formData, setFormData] = useState<CreateOrganizationFormData>({
    name: '',
    domain: '',
    slug: ''
  });
  const [errors, setErrors] = useState<Partial<CreateOrganizationFormData>>({});

  // Check user's organizations on mount
  useEffect(() => {
    checkUserOrganizations();
  }, []);

  const checkUserOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUserOrganizations();
      const userHasOrgs = response.success && response.organizations && response.organizations.length > 0;
      
      setHasOrganizations(userHasOrgs);
      
      if (userHasOrgs) {
        // Ensure organization store is populated and one is selected, then go to dashboard
        try {
          await fetchUserOrganizations();
        } catch (err) {
          // ignore; we'll still attempt to navigate
        }

        // Ensure a selection exists (store auto-selects default/first if available)
        let orgStore = useOrganizationStore.getState();
        if (!orgStore.selectedOrganizationId && orgStore.organizations.length > 0) {
          selectOrganization(orgStore.organizations[0].id);
        }

        router.push('/dashboard');
        return;
      } else {
        // User has no organizations, start with welcome
        setCurrentStep('welcome');
      }
    } catch (error) {
      console.error('Error checking organizations:', error);
      setCurrentStep('welcome');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateOrganizationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name' && !formData.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateOrganizationFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }
    
    if (!formData.domain.trim()) {
      newErrors.domain = 'Domain is required';
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/.test(formData.domain.trim())) {
      newErrors.domain = 'Please enter a valid domain (e.g., company.com)';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Organization slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateOrganization = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      const response = await apiClient.createOrganization({
        name: formData.name.trim(),
        domain: formData.domain.trim(),
        slug: formData.slug.trim()
      });

      toast.success('Organization created successfully!');
      
      // Refresh organizations
      await fetchUserOrganizations();
      
      // Debug: Check current auth state
      const authState = useAuthStore.getState();
      console.log('🔄 Auth state after org creation:', {
        isAuthenticated: authState.isAuthenticated,
        hasAccessToken: !!authState.accessToken,
        hasHostAddress: !!authState.hostAddress
      });
      
      // Select the newly created organization
      // If response contains the organization ID, use it
      if (response && response.organization && response.organization.id) {
        console.log('🏢 Selecting organization from response:', response.organization.id);
        selectOrganization(response.organization.id);
      } else {
        // Fallback: select the first organization if no organization is currently selected
        const orgStore = useOrganizationStore.getState();
        console.log('🏢 Current org state:', {
          selectedOrganizationId: orgStore.selectedOrganizationId,
          organizationsCount: orgStore.organizations.length
        });
        
        if (!orgStore.selectedOrganizationId && orgStore.organizations.length > 0) {
          console.log('🏢 Selecting first organization:', orgStore.organizations[0].id);
          selectOrganization(orgStore.organizations[0].id);
        }
      }
      
      setCurrentStep('intro');
      
    } catch (error) {
      console.error('Organization creation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipIntro = async () => {
    // Ensure organizations are populated and one is selected before going to dashboard
    let orgStore = useOrganizationStore.getState();
    if (orgStore.organizations.length === 0) {
      try {
        await fetchUserOrganizations();
      } catch (err) {
        // ignore; navigation may still be blocked by middleware
      }
      orgStore = useOrganizationStore.getState();
    }
    if (!orgStore.selectedOrganizationId && orgStore.organizations.length > 0) {
      selectOrganization(orgStore.organizations[0].id);
    }
    router.push('/dashboard');
  };

  const handleContinue = async () => {
    if (currentStep === 'welcome') {
      setCurrentStep('create-org');
    } else if (currentStep === 'intro') {
      // Debug: Check final state before dashboard redirect
      const authState = useAuthStore.getState();
      let orgStore = useOrganizationStore.getState();
      
      console.log('🚀 Final state before dashboard redirect:', {
        auth: {
          isAuthenticated: authState.isAuthenticated,
          hasAccessToken: !!authState.accessToken,
          hasHostAddress: !!authState.hostAddress
        },
        org: {
          selectedOrganizationId: orgStore.selectedOrganizationId,
          organizationsCount: orgStore.organizations.length
        },
        cookies: {
          accessToken: !!document.cookie.includes('access-token'),
          hostAddress: !!document.cookie.includes('host-address'),
          selectedOrgId: !!document.cookie.includes('selected-organization-id')
        }
      });
      
      // If organizations are not yet in the store but the user has orgs, fetch them now
      if (orgStore.organizations.length === 0 && hasOrganizations) {
        try {
          await fetchUserOrganizations();
        } catch (err) {
          // ignore; continue with best effort
        }
        orgStore = useOrganizationStore.getState();
      }

      // Ensure organization is selected before going to dashboard
      if (!orgStore.selectedOrganizationId && orgStore.organizations.length > 0) {
        console.log('🏢 Last-minute organization selection');
        selectOrganization(orgStore.organizations[0].id);
      }
      
      console.log('🚀 Redirecting to dashboard...');
      router.push('/dashboard');
    }
  };

  if (isLoading && currentStep === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Setting up your onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Welcome Step */}
          {currentStep === 'welcome' && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome to ModuleX!</h1>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                  Let's get you started by creating your first organization. This will be your workspace for managing AI agents and tools.
                </p>
              </div>
              
              <Button 
                onClick={handleContinue}
                size="lg"
                className="px-8"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Create Organization Step */}
          {currentStep === 'create-org' && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Create Your Organization</CardTitle>
                <p className="text-gray-600">Set up your workspace to start building with ModuleX</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    placeholder="e.g., Acme Corp"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-domain">Domain</Label>
                  <Input
                    id="org-domain"
                    placeholder="e.g., acme.com"
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    className={errors.domain ? 'border-red-500' : ''}
                  />
                  {errors.domain && <p className="text-sm text-red-600">{errors.domain}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-slug">Organization Slug</Label>
                  <Input
                    id="org-slug"
                    placeholder="e.g., acme-corp"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className={errors.slug ? 'border-red-500' : ''}
                  />
                  {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
                  <p className="text-xs text-gray-500">This will be used in URLs and API calls</p>
                </div>

                <Button 
                  onClick={handleCreateOrganization}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Creating...' : 'Create Organization'}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Intro Step */}
          {currentStep === 'intro' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">You're All Set! 🎉</h1>
                <p className="text-lg text-gray-600">
                  {hasOrganizations ? 
                    "Welcome back! Your organization is ready." :
                    "Your organization has been created successfully."
                  }
                </p>
              </div>

              {/* Intro Content */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Manage Your Team</h3>
                    <p className="text-sm text-gray-600">
                      Invite team members, assign roles, and collaborate on AI projects together.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Build AI Agents</h3>
                    <p className="text-sm text-gray-600">
                      Create intelligent agents using our powerful tools and integrations.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Monitor & Optimize</h3>
                    <p className="text-sm text-gray-600">
                      Track performance, analyze usage, and optimize your AI workflows.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleSkipIntro}
                  size="lg"
                >
                  Skip Intro
                </Button>
                <Button 
                  onClick={handleContinue}
                  size="lg"
                >
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}