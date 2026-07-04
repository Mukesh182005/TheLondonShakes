import { NextRequest } from 'next/server';

export async function generateSessionToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret + "-tls-session-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyAdminRequest(request: NextRequest): Promise<boolean> {
  const hasClerkKeys =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder');

  if (hasClerkKeys) {
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const session = await auth();
      return !!session.userId;
    } catch (e) {
      console.error('Clerk auth verification failed:', e);
      return false;
    }
  } else {
    const ADMIN_COOKIE = 'tls_admin_session';
    const session = request.cookies.get(ADMIN_COOKIE)?.value;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const expectedToken = ADMIN_PASSWORD ? await generateSessionToken(ADMIN_PASSWORD) : '';
    return !!(session && session === expectedToken);
  }
}
