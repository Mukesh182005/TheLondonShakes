import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, logs });
  } catch (error: unknown) {
    console.error('Audit logs API GET error:', error);
    return NextResponse.json({ success: true, logs: [], warning: 'Logs database temporarily offline' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, details, adminEmail } = await req.json();

    if (!action || !adminEmail) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    let finalAdminEmail = adminEmail;
    try {
      if (adminEmail && !adminEmail.includes('|')) {
        const staff = await prisma.staffAccount.findUnique({
          where: { email: adminEmail },
        });
        if (staff) {
          finalAdminEmail = `${staff.name} | ${adminEmail}`;
        } else if (adminEmail === (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || '')) {
          finalAdminEmail = `Super Admin | ${adminEmail}`;
        } else {
          const dbUser = await prisma.user.findUnique({
            where: { email: adminEmail },
          });
          if (dbUser && dbUser.name) {
            finalAdminEmail = `${dbUser.name} | ${adminEmail}`;
          } else {
            finalAdminEmail = `Staff | ${adminEmail}`;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to resolve staff name:', e);
    }

    let savedLog = null;
    try {
      savedLog = await prisma.auditLog.create({
        data: {
          action,
          details: typeof details === 'object' ? JSON.stringify(details) : String(details),
          adminEmail: finalAdminEmail,
        },
      });
    } catch (dbError) {
      console.warn('Failed to save audit log to DB:', dbError);
      savedLog = {
        id: 'mock-' + Math.random().toString(36).substring(2, 9),
        action,
        details: typeof details === 'object' ? JSON.stringify(details) : String(details),
        adminEmail: finalAdminEmail,
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({ success: true, log: savedLog });
  } catch (error: unknown) {
    console.error('Audit logs API POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
