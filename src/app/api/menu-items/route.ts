import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, price, category, imageUrl, image, active } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json({ success: false, error: 'Name, category, and price are required' }, { status: 400 });
    }

    const item = await prisma.menuItem.create({
      data: {
        ...(id ? { id } : {}),
        name,
        description: description || '',
        price: Number(price),
        category,
        imageUrl: imageUrl || image || null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ success: false, error: 'Failed to create menu item' }, { status: 500 });
  }
}
