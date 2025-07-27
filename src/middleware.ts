import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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
  
  // Dashboard routes (require both auth and organization)
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  // Check if user is authenticated
  const isAuthenticated = !!(accessToken && hostAddress);
  
  // Check if organization is selected
  const hasSelectedOrganization = !!selectedOrganizationId;
  
  console.log('🔍 Middleware check:', {
    pathname,
    isAuthenticated,
    hasSelectedOrganization,
    selectedOrganizationId: selectedOrganizationId ? selectedOrganizationId.substring(0, 8) + '...' : null
  });
  
  // If not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute && !isApiRoute) {
    console.log('❌ Not authenticated, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If authenticated and trying to access login page
  if (isAuthenticated && pathname === '/login') {
    if (hasSelectedOrganization) {
      console.log('✅ Has organization, redirecting to dashboard');
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    } else {
      console.log('⚠️ No organization, redirecting to select organization');
      const selectOrgUrl = new URL('/select-organization', request.url);
      return NextResponse.redirect(selectOrgUrl);
    }
  }
  
  // If authenticated and trying to access root
  if (isAuthenticated && pathname === '/') {
    if (hasSelectedOrganization) {
      console.log('✅ Has organization, redirecting to dashboard');
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    } else {
      console.log('⚠️ No organization, redirecting to select organization');
      const selectOrgUrl = new URL('/select-organization', request.url);
      return NextResponse.redirect(selectOrgUrl);
    }
  }
  
  // If authenticated but no organization selected and trying to access dashboard
  if (isAuthenticated && !hasSelectedOrganization && isDashboardRoute) {
    console.log('⚠️ No organization for dashboard, redirecting to select organization');
    const selectOrgUrl = new URL('/select-organization', request.url);
    return NextResponse.redirect(selectOrgUrl);
  }
  
  // If authenticated and has organization but trying to access organization selection
  if (isAuthenticated && hasSelectedOrganization && isOrgSelectRoute) {
    console.log('✅ Already has organization, redirecting to dashboard');
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