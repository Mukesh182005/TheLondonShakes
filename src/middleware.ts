import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import { generateSessionToken } from '@/lib/auth-crypto';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const MAINTENANCE_COOKIE = 'tls_maintenance';

const hasClerkKeys =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder');

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // ── Maintenance Mode Gate ──────────────────────────────────────────────────
  const isMaintenanceMode = request.cookies.get(MAINTENANCE_COOKIE)?.value === 'true';
  const isApiRoute        = pathname.startsWith('/api');
  const isMaintenancePage = pathname === '/maintenance';
  const isStaticAsset     = pathname.startsWith('/_next') || pathname.startsWith('/favicon');

  const isApiAdmin = pathname.startsWith('/api/admin/');
  const isProtectedAdmin = isAdminRoute(request) || isApiAdmin;

  if (isMaintenanceMode && !isProtectedAdmin && !isApiRoute && !isMaintenancePage && !isStaticAsset) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // ── Admin Auth Gate (Clerk / Local Dev Fallback) ───────────────────────────
  if (isProtectedAdmin) {
    if (hasClerkKeys) {
      // If we have real Clerk credentials, protect using Clerk
      return clerkMiddleware(async (auth) => {
        await auth.protect();
      })(request, event);
    } else {
      // If Clerk is not configured, fall back to standard local cookie auth
      const ADMIN_COOKIE = 'tls_admin_session';
      const session = request.cookies.get(ADMIN_COOKIE)?.value;
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
      const expectedToken = ADMIN_PASSWORD ? await generateSessionToken(ADMIN_PASSWORD) : '';

      if ((!session || session !== expectedToken) && pathname !== '/admin/login') {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }
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
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
