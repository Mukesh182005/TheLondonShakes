import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const search = searchParams.get('search') || '';

    const where: any = {
      action: 'BILL_EDITED',
    };

    if (search) {
      where.OR = [
        { details: { contains: search } },
        { adminEmail: { contains: search } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Parse JSON details for each log
    const parsed = logs.map((log) => {
      let details: any = {};
      try {
        details = JSON.parse(log.details);
      } catch {
        details = { raw: log.details };
      }
      return {
        id: log.id,
        action: log.action,
        adminEmail: log.adminEmail,
        createdAt: log.createdAt.toISOString(),
        ...details,
      };
    });

    return NextResponse.json({
      logs: parsed,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Bill logs API error:', error);
    return NextResponse.json({ logs: [], total: 0, page: 1, totalPages: 0 });
  }
}
