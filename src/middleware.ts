import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE       = 'tls_admin_session';
const MAINTENANCE_COOKIE = 'tls_maintenance';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Maintenance Mode Gate ──────────────────────────────────────────────────
  // If tls_maintenance cookie is 'true', redirect all public pages to /maintenance
  const isMaintenanceMode = request.cookies.get(MAINTENANCE_COOKIE)?.value === 'true';
  const isAdminRoute      = pathname.startsWith('/admin');
  const isApiRoute        = pathname.startsWith('/api');
  const isMaintenancePage = pathname === '/maintenance';
  const isStaticAsset     = pathname.startsWith('/_next') || pathname.startsWith('/favicon');

  if (isMaintenanceMode && !isAdminRoute && !isApiRoute && !isMaintenancePage && !isStaticAsset) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // ── Admin Auth Gate ────────────────────────────────────────────────────────
  // Only protect /admin routes (but NOT /admin/login itself)
  if (isAdminRoute && pathname !== '/admin/login') {
    const session = request.cookies.get(ADMIN_COOKIE)?.value;

    if (session !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Security Headers ───────────────────────────────────────────────────────
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|event-waffle\\.png|event-shake\\.png|event-acoustic\\.png|events-bg\\.png).*)',
  ],
};
