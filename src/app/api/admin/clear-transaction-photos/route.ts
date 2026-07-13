import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSessionToken } from '@/lib/auth-crypto';

export async function POST(req: NextRequest) {
  try {
    const ADMIN_COOKIE = 'tls_admin_session';
    const session = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const expectedToken = ADMIN_PASSWORD ? await generateSessionToken(ADMIN_PASSWORD) : '';
    
    if (session !== expectedToken) {
      return NextResponse.json({ success: false, error: 'Access Denied: Only the Super Admin (Owner) can clear transaction proofs.' }, { status: 403 });
    }

    await prisma.order.updateMany({
      data: {
        receiptPhoto: null as any,
      },
    });

    return NextResponse.json({ success: true, message: 'All transaction proof photos cleared successfully.' });
  } catch (error) {
    console.error('Failed to clear transaction photos:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear photos' }, { status: 500 });
  }
}
