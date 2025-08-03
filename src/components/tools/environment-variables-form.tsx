'use client';

import { AuthSchema, EnvironmentVariable } from '@/types/tools';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Key, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Settings,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface EnvironmentVariablesFormProps {
  schema: AuthSchema;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  useCustomCredentials?: boolean;
  onCustomCredentialsChange?: (useCustom: boolean) => void;
  oauth2EnvAvailable?: boolean; // Tool level OAuth2 availability
  className?: string;
}

export function EnvironmentVariablesForm({ 
  schema, 
  values, 
  onChange,
  useCustomCredentials = false,
  onCustomCredentialsChange,
  oauth2EnvAvailable = false,
  className 
}: EnvironmentVariablesFormProps) {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleFieldVisibility = (fieldName: string) => {
    setVisibleFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const handleInputChange = (name: string, value: string) => {
    onChange({
      ...values,
      [name]: value
    });
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const showSystemHint = schema.auth_type === 'oauth2' && schema.system_has_oauth2_variables;
  const envVariables = schema.setup_environment_variables || [];



  const getFieldType = (envVar: EnvironmentVariable, fieldName: string) => {
    if (visibleFields[fieldName]) return 'text';
    
    const isSecret = envVar.name.toLowerCase().includes('secret') || 
                    envVar.name.toLowerCase().includes('key') ||
                    envVar.name.toLowerCase().includes('token') ||
                    envVar.name.toLowerCase().includes('password') ||
                    envVar.type === 'secret';
    
    return isSecret ? 'password' : 'text';
  };

  const isFieldRequired = (envVar: EnvironmentVariable) => {
    // If system has OAuth2 variables, fields are optional
    if (showSystemHint) return false;
    return envVar.required !== false; // Default to required if not specified
  };

  const getFieldIcon = (envVar: EnvironmentVariable) => {
    switch (envVar.type) {
      case 'secret':
        return <Key className="h-3.5 w-3.5 text-orange-500" />;
      case 'url':
        return <ExternalLink className="h-3.5 w-3.5 text-blue-500" />;
      default:
        return <Key className="h-3.5 w-3.5 text-gray-500" />;
    }
  };

  // OAuth2 specific fields configuration
  const oauth2Fields = [
    {
      name: 'client_id',
      title: 'Client ID',
      subtitle: 'Client ID of the app',
      type: 'text',
      required: true
    },
    {
      name: 'client_secret',
      title: 'Client Secret',
      subtitle: 'Client secret of the app',
      type: 'password',
      required: true
    },
    {
      name: 'redirect_uri',
      title: 'Redirect URI',
      subtitle: 'Add this Redirect URL to your app\'s OAuth allow list.',
      type: 'text',
      disabled: true,
      defaultValue: 'https://backend.modulex.dev/api/v1/auth-apps/add',
      copyable: true
    },
    {
      name: 'access_token',
      title: 'Access Token',
      subtitle: 'Access token injected automatically after OAuth2 authentication flow',
      type: 'text',
      required: false
    }
  ];

  const renderOAuth2Fields = () => {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            OAuth2 Configuration
            <Badge variant="outline" className="text-xs">
              {oauth2Fields.length} fields
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {oauth2Fields.map((field) => {
            // For redirect_uri, always use the default value and don't store it in values
            const fieldValue = field.name === 'redirect_uri' 
              ? field.defaultValue || '' 
              : values[field.name] || '';
            const isVisible = visibleFields[field.name];
            const fieldType = field.type === 'password' && !isVisible ? 'password' : 'text';
            
            return (
              <div key={field.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor={field.name}
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Key className="h-3.5 w-3.5 text-blue-500" />
                    {field.title}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  
                  <div className="flex items-center gap-1">
                    {field.copyable && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(fieldValue, field.name)}
                        title="Copy to clipboard"
                      >
                        {copiedField === field.name ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                    
                    {field.type === 'password' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleFieldVisibility(field.name)}
                        title={isVisible ? 'Hide' : 'Show'}
                      >
                        {isVisible ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                <Input
                  id={field.name}
                  type={fieldType}
                  placeholder={field.subtitle}
                  value={fieldValue}
                  onChange={(e) => !field.disabled && handleInputChange(field.name, e.target.value)}
                  required={field.required}
                  disabled={field.disabled}
                  className={`transition-colors ${
                    field.disabled 
                      ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                      : fieldValue 
                        ? 'border-green-300 bg-green-50' 
                        : field.required 
                          ? 'border-gray-300' 
                          : 'border-gray-200'
                  }`}
                />
                
                <div className="flex items-start justify-between text-xs text-muted-foreground">
                  <p className="flex-1">
                    {field.subtitle}
                  </p>
                  
                  {fieldValue && !field.disabled && (
                    <div className="flex items-center gap-1 text-green-600 ml-2">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Set</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Validation Summary for OAuth2 */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-green-700">
                  {oauth2Fields.filter(field => !field.disabled && values[field.name]?.trim()).length} configured
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-orange-700">
                  {oauth2Fields.filter(field => field.required).length} required
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Main render logic based on OAuth2 requirements
  const isOAuth2 = schema.auth_type === 'oauth2';
  
  // Debug log for testing
  console.log('🔍 EnvironmentVariablesForm Debug:', {
    authType: schema.auth_type,
    isOAuth2,
    oauth2EnvAvailable,
    useCustomCredentials,
    envVariablesCount: envVariables.length
  });
  
  // Case 1: OAuth2 with no system credentials available (oauth2_env_available === false)
  // Show OAuth2 fields directly
  if (isOAuth2 && !oauth2EnvAvailable) {
    return (
      <div className={`${className} overflow-hidden`}>
        {renderOAuth2Fields()}
      </div>
    );
  }
  
  // Case 2: OAuth2 with system credentials available (oauth2_env_available === true)
  // Show radio button choice and OAuth2 fields if custom is selected
  if (isOAuth2 && oauth2EnvAvailable) {
    return (
      <div className={`${className} overflow-hidden`}>
        {/* OAuth2 Credentials Selection */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              OAuth2 Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  id="system"
                  name="oauth-credentials"
                  value="system"
                  checked={!useCustomCredentials}
                  onChange={() => onCustomCredentialsChange?.(false)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <Label htmlFor="system" className="text-sm font-medium cursor-pointer">
                    Use system OAuth2 credentials (Recommended)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use the system's pre-configured OAuth2 application for authentication. No setup required.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  id="custom"
                  name="oauth-credentials"
                  value="custom"
                  checked={useCustomCredentials}
                  onChange={() => onCustomCredentialsChange?.(true)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <Label htmlFor="custom" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    <Settings className="h-3.5 w-3.5" />
                    Use your own developer credentials
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage authentication with custom credentials from your own OAuth2 application.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Show OAuth2 fields if custom credentials is selected */}
        {useCustomCredentials && renderOAuth2Fields()}
      </div>
    );
  }
  
  // Case 3: Non-OAuth2 or legacy environment variables
  if (envVariables.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
        <p className="text-sm">No configuration required for this authentication method.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* System Hint */}
      {showSystemHint && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800 mb-1">
                  System Environment Variables Available
                </h4>
                <p className="text-xs text-green-700">
                  You can leave fields empty to use system defaults. Only provide values if you want to override the system configuration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Variables Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Key className="h-4 w-4" />
            Environment Variables
            <Badge variant="outline" className="text-xs">
              {envVariables.length} variables
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {envVariables.map((envVar) => {
            const isRequired = isFieldRequired(envVar);
            const hasValue = values[envVar.name]?.trim();
            const fieldType = getFieldType(envVar, envVar.name);
            
            return (
              <div key={envVar.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor={envVar.name}
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    {getFieldIcon(envVar)}
                    {envVar.name}
                    {isRequired && <span className="text-red-500">*</span>}
                    {!isRequired && showSystemHint && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Optional
                      </Badge>
                    )}
                  </Label>
                  
                  <div className="flex items-center gap-1">
                    {envVar.about_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(envVar.about_url, '_blank')}
                        title="View documentation"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {fieldType === 'password' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleFieldVisibility(envVar.name)}
                        title={visibleFields[envVar.name] ? 'Hide' : 'Show'}
                      >
                        {visibleFields[envVar.name] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                <Input
                  id={envVar.name}
                  type={fieldType}
                  placeholder={showSystemHint 
                    ? `${envVar.description} (leave empty for system default)`
                    : envVar.description
                  }
                  value={values[envVar.name] || ''}
                  onChange={(e) => handleInputChange(envVar.name, e.target.value)}
                  required={isRequired}
                  className={`transition-colors ${
                    hasValue 
                      ? 'border-green-300 bg-green-50' 
                      : isRequired 
                        ? 'border-gray-300' 
                        : 'border-gray-200'
                  }`}
                />
                
                <div className="flex items-start justify-between text-xs text-muted-foreground">
                  <p className="flex-1">
                    {envVar.description}
                    {envVar.sample_format && (
                      <span className="block mt-1 font-mono text-xs text-gray-500">
                        Format: {envVar.sample_format}
                      </span>
                    )}
                  </p>
                  
                  {hasValue && (
                    <div className="flex items-center gap-1 text-green-600 ml-2">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Set</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Validation Summary */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-green-700">
                  {Object.keys(values).filter(key => values[key]?.trim()).length} configured
                </span>
              </div>
              
              {!showSystemHint && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-700">
                    {envVariables.filter(v => isFieldRequired(v)).length} required
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 