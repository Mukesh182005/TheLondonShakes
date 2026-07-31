import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      label,
      name,
      slug,
      icon,
      desc,
      bannerImage,
      gutterImageLeftTop,
      gutterImageLeftBottom,
      gutterImageRightTop,
      gutterImageRightBottom,
      sortOrder,
    } = body;

    if (!label) {
      return NextResponse.json({ success: false, error: 'Label is required' }, { status: 400 });
    }

    const catId = id || label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.menuCategory.upsert({
      where: { id: catId },
      update: {
        label,
        name: name || label,
        slug: slug || catId,
        icon: icon || '◆',
        desc: desc || '',
        bannerImage: bannerImage || null,
        gutterImageLeftTop: gutterImageLeftTop || null,
        gutterImageLeftBottom: gutterImageLeftBottom || null,
        gutterImageRightTop: gutterImageRightTop || null,
        gutterImageRightBottom: gutterImageRightBottom || null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
      create: {
        id: catId,
        label,
        name: name || label,
        slug: slug || catId,
        icon: icon || '◆',
        desc: desc || '',
        bannerImage: bannerImage || null,
        gutterImageLeftTop: gutterImageLeftTop || null,
        gutterImageLeftBottom: gutterImageLeftBottom || null,
        gutterImageRightTop: gutterImageRightTop || null,
        gutterImageRightBottom: gutterImageRightBottom || null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error creating menu category:', error);
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
  }
}
