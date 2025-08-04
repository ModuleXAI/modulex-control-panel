'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useOrganizationStore } from '@/store/organization-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CreateOrganizationFormData {
  name: string;
  domain: string;
  slug: string;
}

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { fetchUserOrganizations } = useOrganizationStore();
  
  const [formData, setFormData] = useState<CreateOrganizationFormData>({
    name: '',
    domain: '',
    slug: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateOrganizationFormData>>({});

  const handleInputChange = (field: keyof CreateOrganizationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Auto-generate slug from name if slug is empty
    if (field === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateOrganizationFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.domain.trim()) {
      newErrors.domain = 'Domain is required';
    } else if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(formData.domain)) {
      newErrors.domain = 'Please enter a valid domain name';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.createOrganization({
        name: formData.name.trim(),
        domain: formData.domain.trim(),
        slug: formData.slug.trim()
      });

      if (response.success || response.id) {
        // Refresh organizations list
        await fetchUserOrganizations();
        
        // Redirect back to dashboard
        router.push('/dashboard?tab=overview');
      } else {
        throw new Error(response.message || 'Failed to create organization');
      }
    } catch (error: any) {
      console.error('Failed to create organization:', error);
      
      // Handle validation errors from server
      if (error.details && typeof error.details === 'object') {
        setErrors(error.details);
      } else {
        alert(error.message || 'Failed to create organization. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard?tab=overview');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create New Organization</h1>
                <p className="text-sm text-gray-600">Set up a new organization for your team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter organization name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Domain */}
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain *</Label>
                  <Input
                    id="domain"
                    type="text"
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    placeholder="example.com"
                    className={errors.domain ? 'border-red-500' : ''}
                  />
                  {errors.domain && (
                    <p className="text-sm text-red-600">{errors.domain}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    The domain associated with your organization
                  </p>
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="my-organization"
                    className={errors.slug ? 'border-red-500' : ''}
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600">{errors.slug}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    URL-friendly identifier (lowercase, numbers, and hyphens only)
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Creating...' : 'Create Organization'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}