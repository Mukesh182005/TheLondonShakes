import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import { generateSessionToken, verifyStaffSessionToken } from '@/lib/auth-crypto';

const MAINTENANCE_COOKIE = 'tls_maintenance';

function hasCodeInjection(str: string): boolean {
  if (!str) return false;
  
  let decoded = str;
  try {
    decoded = decodeURIComponent(str);
  } catch {}
  
  const lower = decoded.toLowerCase();
  
  return (
    lower.includes('<script') ||
    lower.includes('</script') ||
    lower.includes('javascript:') ||
    /onload\s*=/i.test(lower) ||
    /onerror\s*=/i.test(lower) ||
    /onclick\s*=/i.test(lower) ||
    /onmouseover\s*=/i.test(lower) ||
    /onfocus\s*=/i.test(lower) ||
    lower.includes('<iframe') ||
    lower.includes('<embed') ||
    lower.includes('<object') ||
    lower.includes('alert(') ||
    lower.includes('eval(')
  );
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // ── Code Injection Protection (WAF Shield) ─────────────────────────────────
  if (hasCodeInjection(pathname) || hasCodeInjection(request.nextUrl.search)) {
    return new NextResponse(
      JSON.stringify({ error: 'Security Violation: Code injection attempt detected.' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    try {
      const contentType = request.headers.get('content-type') || '';
      if (
        contentType.includes('application/json') ||
        contentType.includes('application/x-www-form-urlencoded') ||
        contentType.includes('text/')
      ) {
        const clone = request.clone();
        const bodyText = await clone.text();
        // Remove base64 data URLs to prevent false-positive XSS hits on random binary base64 character combinations
        const cleanBodyText = bodyText.replace(/data:image\/[^;]+;base64,[a-zA-Z0-9+/=\s]+/gi, '');
        if (hasCodeInjection(cleanBodyText)) {
          return new NextResponse(
            JSON.stringify({ error: 'Security Violation: Code injection attempt detected.' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }
    } catch (err) {
      console.warn('Failed to parse request body for security check:', err);
    }
  }

  // ── Maintenance Mode Gate ──────────────────────────────────────────────────
  const isMaintenanceMode = request.cookies.get(MAINTENANCE_COOKIE)?.value === 'true';
  const isApiRoute        = pathname.startsWith('/api');
  const isMaintenancePage = pathname === '/maintenance';
  const isStaticAsset     = pathname.startsWith('/_next') || pathname.startsWith('/favicon');

  const isApiAdmin = pathname.startsWith('/api/admin/') && pathname !== '/api/admin/settings/verify-passcode';
  const isProtectedAdmin = pathname.startsWith('/admin') || isApiAdmin;

  if (isMaintenanceMode && !isProtectedAdmin && !isApiRoute && !isMaintenancePage && !isStaticAsset) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // ── Admin Auth Gate (Cookie Validation) ────────────────────────────────────
  if (isProtectedAdmin) {
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
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self' wss://*.pusher.com https://*.pusher.com; frame-src 'self' https://*.google.com;"
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
