'use client';

import { AuthSchema } from '@/types/tools';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Key, 
  Shield, 
  Settings2, 
  CheckCircle2,
  Info
} from 'lucide-react';

interface AuthTypeSelectorProps {
  authSchemas: AuthSchema[];
  selectedAuthType: string;
  onAuthTypeChange: (authType: string) => void;
  oauth2EnvAvailable?: boolean; // Tool level OAuth2 availability
  className?: string;
}

export function AuthTypeSelector({ 
  authSchemas, 
  selectedAuthType, 
  onAuthTypeChange,
  oauth2EnvAvailable = false,
  className 
}: AuthTypeSelectorProps) {
  const getAuthTypeIcon = (authType: string) => {
    switch (authType.toLowerCase()) {
      case 'oauth2':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'api_key':
        return <Key className="h-4 w-4 text-green-600" />;
      case 'manual':
        return <Settings2 className="h-4 w-4 text-orange-600" />;
      default:
        return <Key className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAuthTypeDescription = (authType: string, schema: AuthSchema) => {
    switch (authType.toLowerCase()) {
      case 'oauth2':
        if (oauth2EnvAvailable) {
          return 'Use OAuth2 authentication with system credentials or your own';
        }
        return schema.system_has_oauth2_variables 
          ? 'Use OAuth2 authentication with system defaults available'
          : 'Use OAuth2 authentication (requires setup)';
      case 'api_key':
        return 'Use API key authentication';
      case 'manual':
        return 'Manual configuration with custom credentials';
      default:
        return `Use ${authType} authentication`;
    }
  };

  const getAuthTypeBadgeColor = (authType: string) => {
    switch (authType.toLowerCase()) {
      case 'oauth2':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'api_key':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'manual':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (authSchemas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Info className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No authentication methods available for this tool.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-2 mb-4">
        <h3 className="text-sm font-medium text-gray-900">Select Authentication Method</h3>
        <p className="text-xs text-muted-foreground">
          Choose how you want to authenticate with this tool
        </p>
      </div>
      
      <div className="space-y-3">
        {authSchemas.map((schema) => (
          <Card 
            key={schema.auth_type}
            className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-md ${
              selectedAuthType === schema.auth_type 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onAuthTypeChange(schema.auth_type)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getAuthTypeIcon(schema.auth_type)}
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {schema.auth_type.toUpperCase()}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {getAuthTypeDescription(schema.auth_type, schema)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {oauth2EnvAvailable && schema.auth_type === 'oauth2' && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      System Available
                    </Badge>
                  )}
                  {schema.system_has_oauth2_variables && !oauth2EnvAvailable && schema.auth_type === 'oauth2' && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      System Ready
                    </Badge>
                  )}
                  {selectedAuthType === schema.auth_type && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getAuthTypeBadgeColor(schema.auth_type)}`}
                >
                  {schema.setup_environment_variables.length} variables required
                </Badge>
                
                <Button 
                  variant={selectedAuthType === schema.auth_type ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAuthTypeChange(schema.auth_type);
                  }}
                >
                  {selectedAuthType === schema.auth_type ? 'Selected' : 'Select'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 