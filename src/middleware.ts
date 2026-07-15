import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import { generateSessionToken, verifyStaffSessionToken } from '@/lib/auth-crypto';

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

  const isApiAdmin = pathname.startsWith('/api/admin/') && pathname !== '/api/admin/settings/verify-passcode';
  const isProtectedAdmin = isAdminRoute(request) || isApiAdmin;

  if (isMaintenanceMode && !isProtectedAdmin && !isApiRoute && !isMaintenancePage && !isStaticAsset) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // ── Admin Auth Gate (Clerk / Local Dev Fallback) ───────────────────────────
  if (isProtectedAdmin) {
    if (hasClerkKeys) {
      return clerkMiddleware(async (auth) => {
        await auth.protect();
      })(request, event);
    } else {
      const ADMIN_COOKIE = 'tls_admin_session';
      const session = request.cookies.get(ADMIN_COOKIE)?.value;
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
      const expectedToken = ADMIN_PASSWORD ? await generateSessionToken(ADMIN_PASSWORD) : '';

      let isValidSession = session === expectedToken;
      if (!isValidSession && session) {
        const staff = await verifyStaffSessionToken(session);
        isValidSession = !!staff;
      }

      if (!isValidSession && pathname !== '/admin/login') {
        if (pathname.startsWith('/api')) {
          return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // ── CSRF Protection on API State-Changing Methods ──────────────────────────
  if (['POST', 'PUT', 'DELETE'].includes(request.method) && isApiRoute) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host') || request.nextUrl.host;

    let isCsrfValid = true;
    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          isCsrfValid = false;
        }
      } catch {
        isCsrfValid = false;
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host !== host) {
          isCsrfValid = false;
        }
      } catch {
        isCsrfValid = false;
      }
    }

    if (!isCsrfValid) {
      return new NextResponse(
        JSON.stringify({ error: 'CSRF validation failed: Request origin/referer mismatch' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self'; frame-src 'self' https://*.google.com;"
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

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
