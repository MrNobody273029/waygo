import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const LOCALES = new Set(['ru', 'ka']);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Auth guard for protected routes
  if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (path.startsWith('/admin') && (token as any)?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const response = NextResponse.next();

  // Locale cookie from URL prefix
  const segment = path.split('/')[1];
  if (LOCALES.has(segment)) {
    response.cookies.set('NEXT_LOCALE', segment, { path: '/', sameSite: 'lax' });
  } else if (!request.cookies.has('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', 'en', { path: '/', sameSite: 'lax' });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|api|.*\\.(?:png|svg|ico|jpg|jpeg|webp)$).*)'],
};
