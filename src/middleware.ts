import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access-token');
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  if (pathname.startsWith('/api/health')) {
    return NextResponse.next();
  }

  // Handle root route - redirect to dashboard if authenticated, login if not
  if (pathname === '/') {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Handle login page
  if (pathname.startsWith('/login')) {
    // If there's an access token, redirect to dashboard
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Handle protected dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // If no access token, redirect to login
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
}; 