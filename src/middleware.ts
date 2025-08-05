import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Force log to verify middleware is running
  console.log('🔥 MIDDLEWARE RUNNING:', {
    pathname,
    search: request.nextUrl.search,
    href: request.nextUrl.href
  });
  
  // Get auth tokens and organization info from cookies
  const accessToken = request.cookies.get('access-token')?.value;
  const hostAddress = request.cookies.get('host-address')?.value;
  const selectedOrganizationId = request.cookies.get('selected-organization-id')?.value;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/api/health'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // API routes (handle auth at the API level)
  const isApiRoute = pathname.startsWith('/api/');
  
  // Organization selection route
  const isOrgSelectRoute = pathname === '/select-organization';
  
  // Onboarding route (requires auth but not organization)
  const isOnboardingRoute = pathname === '/onboarding';
  
  // Create organization route (requires auth but not organization)
  const isCreateOrgRoute = pathname === '/dashboard/create-organization';
  
  // Dashboard routes (require both auth and organization)
  const isDashboardRoute = pathname.startsWith('/dashboard') && !isCreateOrgRoute;
  
  // Check if user is authenticated
  const isAuthenticated = !!(accessToken && hostAddress);
  
  // Check if organization is selected
  const hasSelectedOrganization = !!selectedOrganizationId;
  
  console.log('🔍 Middleware check:', {
    pathname,
    search: request.nextUrl.search,
    isAuthenticated,
    hasSelectedOrganization,
    selectedOrganizationId: selectedOrganizationId ? selectedOrganizationId.substring(0, 8) + '...' : null,
    cookies: {
      hasAccessToken: !!accessToken,
      hasHostAddress: !!hostAddress,
      hasSelectedOrgId: !!selectedOrganizationId,
      accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : null,
      hostAddressValue: hostAddress
    }
  });
  
  // If not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute && !isApiRoute && !isOnboardingRoute) {
    console.log('❌ Not authenticated, redirecting to login', {
      reason: !accessToken ? 'No access token' : 'No host address',
      accessToken: accessToken ? 'Present' : 'Missing',
      hostAddress: hostAddress ? 'Present' : 'Missing'
    });
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If authenticated and trying to access login page
  if (isAuthenticated && pathname === '/login') {
    if (hasSelectedOrganization) {
      console.log('✅ Has organization, redirecting to dashboard from login', {
        originalSearch: request.nextUrl.search,
        finalUrl: `/dashboard${request.nextUrl.search}`
      });
      const dashboardUrl = new URL('/dashboard', request.url);
      // Preserve query parameters if any
      dashboardUrl.search = request.nextUrl.search;
      return NextResponse.redirect(dashboardUrl);
    } else {
      console.log('⚠️ No organization, redirecting to onboarding for login users');
      const onboardingUrl = new URL('/onboarding', request.url);
      return NextResponse.redirect(onboardingUrl);
    }
  }
  
  // If authenticated and trying to access root
  if (isAuthenticated && pathname === '/') {
    if (hasSelectedOrganization) {
      console.log('✅ Has organization, redirecting to dashboard from root', {
        originalSearch: request.nextUrl.search,
        finalUrl: `/dashboard${request.nextUrl.search}`
      });
      const dashboardUrl = new URL('/dashboard', request.url);
      // Preserve query parameters if any
      dashboardUrl.search = request.nextUrl.search;
      return NextResponse.redirect(dashboardUrl);
    } else {
      console.log('⚠️ No organization, redirecting to onboarding for new users');
      const onboardingUrl = new URL('/onboarding', request.url);
      return NextResponse.redirect(onboardingUrl);
    }
  }
  
  // If authenticated but no organization selected and trying to access dashboard (except create-organization)
  if (isAuthenticated && !hasSelectedOrganization && isDashboardRoute && !isOnboardingRoute) {
    console.log('⚠️ No organization for dashboard, redirecting to onboarding');
    const onboardingUrl = new URL('/onboarding', request.url);
    return NextResponse.redirect(onboardingUrl);
  }
  
  // If authenticated and trying to access create-organization but already has organization
  if (isAuthenticated && hasSelectedOrganization && isCreateOrgRoute) {
    console.log('✅ Already has organization, redirecting to dashboard from create-org');
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // If authenticated and has organization but trying to access organization selection
  if (isAuthenticated && hasSelectedOrganization && isOrgSelectRoute) {
    console.log('✅ Already has organization, redirecting to dashboard from org select', {
      originalSearch: request.nextUrl.search,
      finalUrl: `/dashboard${request.nextUrl.search}`
    });
    const dashboardUrl = new URL('/dashboard', request.url);
    // Preserve query parameters if any
    dashboardUrl.search = request.nextUrl.search;
    return NextResponse.redirect(dashboardUrl);
  }
  
  // If authenticated and has organization but trying to access onboarding
  if (isAuthenticated && hasSelectedOrganization && isOnboardingRoute) {
    console.log('✅ Already has organization, redirecting to dashboard from onboarding');
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 