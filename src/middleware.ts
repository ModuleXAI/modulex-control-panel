import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  if (pathname.startsWith('/api/health')) {
    return NextResponse.next();
  }

  // Handle root route - always redirect to login for now
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Handle login page
  if (pathname.startsWith('/login')) {
    // If there's a token, clear it and stay on login page
    if (token) {
      const response = NextResponse.next();
      response.cookies.delete('auth-token');
      response.cookies.delete('host-address');
      return response;
    }
    return NextResponse.next();
  }

  // Handle protected dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // If no token, redirect to login
    if (!token) {
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