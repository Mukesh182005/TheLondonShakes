import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ isStaff: false });
  }

  // Super admin emails
  if (email === 'thelondonshakessilchar@gmail.com' || email === 'admin@thelondon.co.uk') {
    return NextResponse.json({ isStaff: true });
  }

  try {
    const staff = await prisma.staffAccount.findUnique({
      where: { email },
    });
    return NextResponse.json({ isStaff: !!staff && staff.active });
  } catch (error) {
    console.error('Error checking staff email:', error);
    return NextResponse.json({ isStaff: false });
  }
}
