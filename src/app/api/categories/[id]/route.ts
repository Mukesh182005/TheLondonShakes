import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const category = await prisma.menuCategory.update({
      where: { id },
      data: {
        ...(body.label !== undefined && { label: body.label }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.desc !== undefined && { desc: body.desc }),
        ...(body.bannerImage !== undefined && { bannerImage: body.bannerImage }),
        ...(body.gutterImageLeftTop !== undefined && { gutterImageLeftTop: body.gutterImageLeftTop }),
        ...(body.gutterImageLeftBottom !== undefined && { gutterImageLeftBottom: body.gutterImageLeftBottom }),
        ...(body.gutterImageRightTop !== undefined && { gutterImageRightTop: body.gutterImageRightTop }),
        ...(body.gutterImageRightBottom !== undefined && { gutterImageRightBottom: body.gutterImageRightBottom }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    try {
      await prisma.menuCategory.delete({
        where: { id },
      });
    } catch (err: any) {
      if (err?.code !== 'P2025') {
        console.warn(`Prisma category delete info for ${id}:`, err?.message || err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
