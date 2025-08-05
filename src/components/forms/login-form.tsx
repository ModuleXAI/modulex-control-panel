'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/store/auth-store';
import { loginSchema, registerSchema, LoginFormData, RegisterFormData } from '@/lib/schemas';
import { Mail, User, AlertCircle, Check } from 'lucide-react';


const GithubIcon = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path 
      fillRule="evenodd" 
      fill="currentColor"
      d="M 16 4 C 9.371094 4 4 9.371094 4 16 C 4 21.300781 7.4375 25.800781 12.207031 27.386719 C 12.808594 27.496094 13.027344 27.128906 13.027344 26.808594 C 13.027344 26.523438 13.015625 25.769531 13.011719 24.769531 C 9.671875 25.492188 8.96875 23.160156 8.96875 23.160156 C 8.421875 21.773438 7.636719 21.402344 7.636719 21.402344 C 6.546875 20.660156 7.71875 20.675781 7.71875 20.675781 C 8.921875 20.761719 9.554688 21.910156 9.554688 21.910156 C 10.625 23.746094 12.363281 23.214844 13.046875 22.910156 C 13.15625 22.132813 13.46875 21.605469 13.808594 21.304688 C 11.144531 21.003906 8.34375 19.972656 8.34375 15.375 C 8.34375 14.0625 8.8125 12.992188 9.578125 12.152344 C 9.457031 11.851563 9.042969 10.628906 9.695313 8.976563 C 9.695313 8.976563 10.703125 8.65625 12.996094 10.207031 C 13.953125 9.941406 14.980469 9.808594 16 9.804688 C 17.019531 9.808594 18.046875 9.941406 19.003906 10.207031 C 21.296875 8.65625 22.300781 8.976563 22.300781 8.976563 C 22.957031 10.628906 22.546875 11.851563 22.421875 12.152344 C 23.191406 12.992188 23.652344 14.0625 23.652344 15.375 C 23.652344 19.984375 20.847656 20.996094 18.175781 21.296875 C 18.605469 21.664063 18.988281 22.398438 18.988281 23.515625 C 18.988281 25.121094 18.976563 26.414063 18.976563 26.808594 C 18.976563 27.128906 19.191406 27.503906 19.800781 27.386719 C 24.566406 25.796875 28 21.300781 28 16 C 28 9.371094 22.628906 4 16 4 Z"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

type AuthMode = 'welcome' | 'login' | 'signup';

interface FieldStatus {
  isChecking: boolean;
  isAvailable: boolean | null;
  error?: string;
}

export default function LoginForm() {
  const [authMode, setAuthMode] = useState<AuthMode>('welcome');
  const [error, setError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<FieldStatus>({ isChecking: false, isAvailable: null });
  const [usernameStatus, setUsernameStatus] = useState<FieldStatus>({ isChecking: false, isAvailable: null });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { login, register, checkUnique, isLoading } = useAuthStore();
  const router = useRouter();

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
    },
  });

  // Debounced unique check for email
  useEffect(() => {
    if (authMode === 'signup') {
      const email = registerForm.watch('email');
      if (email && email.includes('@')) {
        const timeoutId = setTimeout(() => {
          checkEmailUnique(email);
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    }
    return undefined;
  }, [registerForm.watch('email'), authMode]);

  // Debounced unique check for username
  useEffect(() => {
    if (authMode === 'signup') {
      const username = registerForm.watch('username');
      if (username && username.length > 0) {
        const timeoutId = setTimeout(() => {
          checkUsernameUnique(username);
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    }
    return undefined;
  }, [registerForm.watch('username'), authMode]);

  const checkEmailUnique = async (email: string) => {
    setEmailStatus({ isChecking: true, isAvailable: null });
    try {
      const result = await checkUnique({ email });
      setEmailStatus({
        isChecking: false,
        isAvailable: result.email_available,
        error: result.email_available === false ? 'This email is already registered' : undefined
      });
    } catch (error) {
      setEmailStatus({ isChecking: false, isAvailable: null, error: 'Error checking email' });
    }
  };

  const checkUsernameUnique = async (username: string) => {
    setUsernameStatus({ isChecking: true, isAvailable: null });
    try {
      const result = await checkUnique({ username });
      setUsernameStatus({
        isChecking: false,
        isAvailable: result.username_available,
        error: result.username_available === false ? 'This username is already taken' : undefined
      });
    } catch (error) {
      setUsernameStatus({ isChecking: false, isAvailable: null, error: 'Error checking username' });
    }
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data);
      // Let middleware decide where to redirect based on organization status
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      
      // Check final validation
      if (emailStatus.isAvailable === false) {
        setError('Please use a different email address');
        return;
      }
      
      if (data.username && usernameStatus.isAvailable === false) {
        setError('Please choose a different username');
        return;
      }

      const registerData = {
        email: data.email,
        password: data.password,
        ...(data.username && { username: data.username })
      };

      await register(registerData);
      
      // Debug: Check auth state after registration
      const authStore = useAuthStore.getState();
      console.log('🔄 Auth state immediately after registration:', {
        isAuthenticated: authStore.isAuthenticated,
        hasAccessToken: !!authStore.accessToken,
        hasHostAddress: !!authStore.hostAddress,
        cookies: {
          accessToken: !!document.cookie.includes('access-token'),
          hostAddress: !!document.cookie.includes('host-address')
        }
      });
      
      // Redirect immediately to onboarding for new users
      console.log('🚀 Redirecting to onboarding...');
      router.push('/onboarding');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
    }
  };

  const getFieldIcon = (status: FieldStatus) => {
    if (status.isChecking) {
      return <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />;
    }
    if (status.isAvailable === true) {
      return <Check className="w-4 h-4 text-green-600" />;
    }
    if (status.isAvailable === false) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const renderWelcomeScreen = () => (
    <div className="text-center space-y-10">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">Welcome to ModuleX</h1>
        <p className="text-base text-gray-600 leading-relaxed">
          Let's get you started with building smarter,<br />
          more intuitive AI agents
        </p>
      </div>

      <div className="space-y-8 w-full max-w-sm mx-auto">
        {/* GitHub and Google Buttons - Stacked vertically with consistent width */}
        <div className="space-y-3">
          <button
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-gray-400 rounded-lg text-sm font-medium border border-gray-200 cursor-not-allowed transition-all hover:bg-gray-50"
            disabled
          >
            <GithubIcon />
            Continue with GitHub
            <span className="text-xs text-gray-400 ml-auto">Soon</span>
          </button>
          <button
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-gray-400 rounded-lg text-sm font-medium border border-gray-200 cursor-not-allowed transition-all hover:bg-gray-50"
            disabled
          >
            <GoogleIcon />
            Continue with Google
            <span className="text-xs text-gray-400 ml-auto">Soon</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm font-medium">or continue with email</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setAuthMode('login')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-800 text-gray-800 bg-white rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:border-gray-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Mail className="w-4 h-4" />
            Sign in with Email
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gray-900 text-white rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            <User className="w-4 h-4" />
            Create new account
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoginForm = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">Welcome back</h2>
        <p className="text-sm text-gray-600">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="name@example.com"
            className="text-sm"
            {...loginForm.register('email')}
          />
          {loginForm.formState.errors.email && (
            <p className="text-xs text-red-600">
              {loginForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">Password</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            className="text-sm"
            {...loginForm.register('password')}
          />
          {loginForm.formState.errors.password && (
            <p className="text-xs text-red-600">
              {loginForm.formState.errors.password.message}
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
          className="w-full text-sm font-medium py-3 mt-6"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>

        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setAuthMode('welcome')}
            className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 font-medium cursor-pointer hover:scale-105"
          >
            ← Back to options
          </button>
        </div>
      </form>
    </div>
  );

  const renderSignupForm = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">Create your account</h2>
        <p className="text-sm text-gray-600">Join thousands of developers building with ModuleX</p>
      </div>

      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">Email</Label>
          <div className="relative">
            <Input
              id="register-email"
              type="email"
              placeholder="name@example.com"
              className={`text-sm pr-10 ${
                emailStatus.isAvailable === false ? 'border-red-500' : 
                emailStatus.isAvailable === true ? 'border-green-500' : ''
              }`}
              {...registerForm.register('email')}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getFieldIcon(emailStatus)}
            </div>
          </div>
          {registerForm.formState.errors.email && (
            <p className="text-xs text-red-600">
              {registerForm.formState.errors.email.message}
            </p>
          )}
          {emailStatus.error && (
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" />
              {emailStatus.error}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-username" className="text-sm font-medium text-gray-700">Username (optional)</Label>
          <div className="relative">
            <Input
              id="register-username"
              type="text"
              placeholder="your-username"
              className={`text-sm pr-10 ${
                usernameStatus.isAvailable === false ? 'border-red-500' : 
                usernameStatus.isAvailable === true ? 'border-green-500' : ''
              }`}
              {...registerForm.register('username')}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getFieldIcon(usernameStatus)}
            </div>
          </div>
          {usernameStatus.error && (
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" />
              {usernameStatus.error}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">Password</Label>
          <Input
            id="register-password"
            type="password"
            placeholder="Create a strong password"
            className="text-sm"
            {...registerForm.register('password')}
          />
          {registerForm.formState.errors.password && (
            <p className="text-xs text-red-600">
              {registerForm.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-confirm-password" className="text-sm font-medium text-gray-700">Confirm Password</Label>
          <Input
            id="register-confirm-password"
            type="password"
            placeholder="Confirm your password"
            className="text-sm"
            {...registerForm.register('confirmPassword')}
          />
          {registerForm.formState.errors.confirmPassword && (
            <p className="text-xs text-red-600">
              {registerForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            className="mt-0.5"
          />
          <label
            htmlFor="terms"
            className="text-xs text-gray-600 leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full text-sm font-medium py-3 mt-6"
          disabled={isLoading || !agreedToTerms}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>

        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setAuthMode('welcome')}
            className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 font-medium cursor-pointer hover:scale-105"
          >
            ← Back to options
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="w-full max-w-md">
      {authMode === 'welcome' && renderWelcomeScreen()}
      {authMode === 'login' && renderLoginForm()}
      {authMode === 'signup' && renderSignupForm()}
    </div>
  );
}