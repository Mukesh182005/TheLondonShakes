import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: Number(body.price) }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.image !== undefined && { imageUrl: body.image }),
        ...(body.active !== undefined && { active: Boolean(body.active) }),
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ success: false, error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    try {
      await prisma.menuItem.delete({
        where: { id },
      });
    } catch (err: any) {
      if (err?.code !== 'P2025') {
        console.warn(`Prisma delete info for ${id}:`, err?.message || err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete menu item' }, { status: 500 });
  }
}
