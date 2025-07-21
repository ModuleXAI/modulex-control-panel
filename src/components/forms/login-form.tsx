'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/auth-store';
import { loginSchema, LoginFormData } from '@/lib/schemas';

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      console.log('🔐 Attempting login with:', {
        email: data.email
      });
      
      await login(data);
      console.log('✅ Login successful, redirecting to dashboard');
      router.push('/dashboard');
    } catch (err) {
      console.error('❌ Login failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      
      // Don't redirect on error, stay on login page
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">ModuleX Control Panel</CardTitle>
        <p className="text-sm text-muted-foreground text-center mt-2">
          {process.env.NEXT_PUBLIC_MODULEX_HOST ? 
            `Connecting to: ${process.env.NEXT_PUBLIC_MODULEX_HOST}` : 
            'Environment not configured'
          }
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 