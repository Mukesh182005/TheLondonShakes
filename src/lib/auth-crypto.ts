import { NextRequest } from 'next/server';

if (process.env.NODE_ENV === 'production') {
  const adminPwd = process.env.ADMIN_PASSWORD || '';
  if (!adminPwd || adminPwd === 'admin@thelondon.co.uk' || adminPwd.length < 8) {
    console.warn("===============================================================");
    console.warn("🚨 CRITICAL SECURITY WARNING 🚨");
    console.warn("Your ADMIN_PASSWORD is missing, too weak, or using the default.");
    console.warn("Please set a secure, unique ADMIN_PASSWORD in your environment.");
    console.warn("===============================================================");
  }
}

export async function generateSessionToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret + "-tls-session-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function generateStaffSessionToken(email: string, role: string): Promise<string> {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fallback-secret';
  const encoder = new TextEncoder();
  const data = encoder.encode(`${email}:${role}:${ADMIN_PASSWORD}-staff-salt-2026`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return `staff-session:${email}:${role}:${signature}`;
}

export async function verifyStaffSessionToken(token: string): Promise<{ email: string; role: string } | null> {
  if (!token || !token.startsWith('staff-session:')) return null;
  const parts = token.split(':');
  if (parts.length !== 4) return null;
  const [_, email, role, signature] = parts;
  
  const expectedToken = await generateStaffSessionToken(email, role);
  if (token === expectedToken) {
    return { email, role };
  }
  return null;
}

export async function verifyAdminRequest(request: NextRequest): Promise<boolean> {
  const ADMIN_COOKIE = 'tls_admin_session';
  const session = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!session) return false;

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const expectedToken = ADMIN_PASSWORD ? await generateSessionToken(ADMIN_PASSWORD) : '';
  
  if (session === expectedToken) {
    return true;
  }

  const staff = await verifyStaffSessionToken(session);
  return !!staff;
}
