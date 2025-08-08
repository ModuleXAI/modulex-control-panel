import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // After Supabase OAuth, redirect to root and let middleware route based on org state
  const url = new URL(request.url);
  const redirect = url.searchParams.get('redirect') || '/';
  return NextResponse.redirect(new URL(redirect, url.origin));
}


