'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  Package,
  User,
  Activity,
  Info,
  CheckCircle,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { Tool } from '@/types/tools';
import { useInstallTool } from '@/hooks/use-tools';
import { AuthTypeSelector } from './auth-type-selector';
import { EnvironmentVariablesForm } from './environment-variables-form';
import { toast } from 'sonner';

interface InstallToolDialogProps {
  tool: Tool;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InstallToolDialog({ 
  tool, 
  children, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: InstallToolDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [step, setStep] = useState<'auth' | 'config'>('auth');
  const [selectedAuthType, setSelectedAuthType] = useState('');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [useCustomCredentials, setUseCustomCredentials] = useState(false);
  const installTool = useInstallTool();

  // Reset state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    console.log('🚀 Install Dialog Open Change:', { newOpen, toolName: tool.name });
    
    if (!newOpen) {
      // Add delay for close animation to complete
      setTimeout(() => {
        setOpen(newOpen);
        setStep('auth');
        setSelectedAuthType('');
        setEnvVars({});
        setUseCustomCredentials(false);
      }, 150); // Wait for animation to complete
    } else {
      setOpen(newOpen);
    }
  };

  const handleAuthTypeSelect = (authType: string) => {
    console.log('🔐 Auth Type Selected:', { 
      authType, 
      toolName: tool.name,
      oauth2EnvAvailable: tool.oauth2_env_available,
      hasAuthSchemas: !!tool.auth_schemas,
      authSchemasCount: tool.auth_schemas?.length || 0
    });
    setSelectedAuthType(authType);
    setEnvVars({}); // Reset env vars when auth type changes
    setUseCustomCredentials(false); // Reset custom credentials when auth type changes
    setStep('config');
  };

  const handleBack = () => {
    setStep('auth');
  };

  const handleInstall = async () => {
    if (!selectedAuthType) {
      toast.error('Please select an authentication method');
      return;
    }

    try {
      // For OAuth2 with system credentials, don't send environment variables
      const isOAuth2WithSystemCredentials = selectedAuthType === 'oauth2' && 
                                           tool.oauth2_env_available && 
                                           !useCustomCredentials;
      
      let configToSend = undefined;
      
      if (!isOAuth2WithSystemCredentials) {
        // For OAuth2 with custom credentials, filter out redirect_uri as it's read-only
        if (selectedAuthType === 'oauth2') {
          configToSend = Object.fromEntries(
            Object.entries(envVars).filter(([key]) => key !== 'redirect_uri')
          );
        } else {
          configToSend = envVars;
        }
      }
      
      console.log('🔧 Installing tool:', tool.name, { 
        authType: selectedAuthType, 
        config: configToSend,
        useCustomCredentials,
        isOAuth2WithSystemCredentials,
        oauth2EnvAvailable: tool.oauth2_env_available,
        hasAuthSchemas: !!tool.auth_schemas,
        envVarsCount: Object.keys(envVars).length
      });
      
      await installTool.mutateAsync({
        toolName: tool.name,
        authType: selectedAuthType,
        config: configToSend
      });
      
      toast.success('Tool installed successfully!');
      setOpen(false);
    } catch (error) {
      console.error('❌ Failed to install tool:', error);
      toast.error('Failed to install tool. Please try again.');
    }
  };

  // Get auth schemas from tool (new structure) or fallback to legacy structure
  const authSchemas = tool.auth_schemas || [];
  const selectedSchema = authSchemas.find(schema => schema.auth_type === selectedAuthType);



  // Legacy fallback for tools without auth_schemas
  const hasLegacyStructure = !tool.auth_schemas && (tool.environment_variables || tool.setup_environment_variables);
  
  if (hasLegacyStructure) {
    // Auto-select single auth type for legacy tools
    if (!selectedAuthType && authSchemas.length === 0) {
      const legacyEnvVars = tool.environment_variables || tool.setup_environment_variables || [];
      const envVarsList = Array.isArray(legacyEnvVars) ? legacyEnvVars : 
        Object.entries(legacyEnvVars).map(([key, value]) => ({
          name: key,
          description: typeof value === 'string' ? value : '',
          required: true,
          sample_format: '',
          about_url: undefined
        }));
      
      // Create a fallback auth schema
      authSchemas.push({
        auth_type: 'manual',
        setup_environment_variables: envVarsList,
        system_has_oauth2_variables: false
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent 
        className="w-full max-w-2xl flex flex-col p-0 sheet-content overflow-hidden rounded-l-3xl shadow-2xl backdrop-blur-sm bg-white" 
        side="right"
        style={{
          height: '100vh',
          width: '45vw',
          maxWidth: '600px',
          top: '0',
          right: '0',
          bottom: '0'
        }}
      >
        <SheetHeader className="p-3 pb-2 border-b border-gray-200/20 bg-gradient-to-r from-blue-50/40 to-purple-50/40 backdrop-blur-sm rounded-tl-3xl">
          <SheetTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-800">
            {tool.logo ? (
              <img 
                src={tool.logo} 
                alt={tool.display_name}
                className="h-7 w-7 rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Package className="h-6 w-6 text-blue-600" />
            )}
            <span>
              {step === 'auth' ? 'Configure' : 'Install'} {tool.display_name}
            </span>
            {step === 'config' && selectedAuthType && (
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                {selectedAuthType.toUpperCase()}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="text-sm mt-3 text-gray-600 font-medium">
            {step === 'auth' 
              ? 'Choose your authentication method for this integration.'
              : 'Configure environment variables and install the integration.'
            }
          </SheetDescription>
        </SheetHeader>

{/* Step-based Installation Flow */}
        <div className="flex-1 min-h-0 overflow-hidden p-2">
          {step === 'auth' ? (
            /* Auth Type Selection Step */
            <ScrollArea className="h-full max-h-[calc(100vh-180px)] overflow-y-auto overflow-x-hidden">
              <div className="pr-1">
                <AuthTypeSelector 
                  authSchemas={authSchemas}
                  selectedAuthType={selectedAuthType}
                  onAuthTypeChange={handleAuthTypeSelect}
                  oauth2EnvAvailable={tool.oauth2_env_available}
                />
                
                {/* Tool Info Preview */}
                <Card className="mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Info className="h-4 w-4" />
                      <span>Tool Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Display Name</p>
                        <p className="text-sm">{tool.display_name}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Version</p>
                        <Badge variant="outline" className="text-xs">{tool.version}</Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Author</p>
                        <div className="flex items-center space-x-1.5">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm">{tool.author}</span>
                        </div>
                      </div>
                      
                      {tool.app_url && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Website</p>
                          <div className="flex items-center space-x-1.5">
                            <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                            <a 
                              href={tool.app_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Visit Website
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {tool.categories && tool.categories.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Categories</p>
                          <div className="flex flex-wrap gap-1">
                            {tool.categories.map((category) => (
                              <Badge key={category.id} variant="outline" className="text-xs">
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Description</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                    </div>
                  </CardContent>
                </Card>
                

              </div>
            </ScrollArea>
          ) : (
            /* Configuration Step */
            <ScrollArea className="h-full max-h-[calc(100vh-180px)] overflow-y-auto overflow-x-hidden">
              <div className="space-y-4 pr-1 pb-4">
                {selectedSchema && (
                  <EnvironmentVariablesForm
                    schema={selectedSchema}
                    values={envVars}
                    onChange={setEnvVars}
                    useCustomCredentials={useCustomCredentials}
                    onCustomCredentialsChange={setUseCustomCredentials}
                    oauth2EnvAvailable={tool.oauth2_env_available}
                  />
                )}
                
                {/* Actions Preview */}
                {(tool.actions || tool.enabled_actions || []).length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <Activity className="h-4 w-4" />
                        <span>Available Actions</span>
                        <Badge variant="outline" className="text-xs">
                          {(tool.actions || tool.enabled_actions || []).length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(tool.actions || tool.enabled_actions || []).slice(0, 4).map((action, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm font-medium">
                              {typeof action === 'string' ? action : action.name}
                            </span>
                          </div>
                        ))}
                        {(tool.actions || tool.enabled_actions || []).length > 4 && (
                          <div className="text-xs text-muted-foreground p-2">
                            +{(tool.actions || tool.enabled_actions || []).length - 4} more actions
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                

              </div>
            </ScrollArea>
          )}
        </div>

        {/* Sticky Footer with Action Buttons */}
        <div className="border-t border-gray-200/30 bg-white/98 backdrop-blur-sm p-4 shadow-lg mt-auto">
          {step === 'auth' ? (
            /* Auth Step Footer - Only Cancel */
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            /* Config Step Footer - Back, Cancel, Install */
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInstall} 
                  disabled={installTool.isPending || !selectedAuthType}
                  className="min-w-[120px]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {installTool.isPending ? 'Installing...' : 'Install Tool'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 