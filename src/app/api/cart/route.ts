export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const items = await prisma.cartItem.findMany({ where: { userId: session.user.id }, include: { product: { select: { id: true, title: true, price: true, salePrice: true, images: true, stock: true, seller: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' } });
    const totalAmount = items.reduce((sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity, 0);
    return NextResponse.json({ items, totalAmount });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const { productId, quantity = 1 } = await request.json();
    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId: session.user.id, productId, quantity },
    });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const { productId, quantity } = await request.json();
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { userId_productId: { userId: session.user.id, productId } } });
      return NextResponse.json({ deleted: true });
    }
    const item = await prisma.cartItem.update({ where: { userId_productId: { userId: session.user.id, productId } }, data: { quantity } });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const { productId } = await request.json();
    await prisma.cartItem.delete({ where: { userId_productId: { userId: session.user.id, productId } } });
    return NextResponse.json({ success: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
