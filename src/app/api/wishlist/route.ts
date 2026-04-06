import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const items = await prisma.wishlist.findMany({ where: { userId: session.user.id }, include: { product: { select: { id: true, title: true, price: true, salePrice: true, images: true, averageRating: true } } }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const { productId } = await request.json();
    const existing = await prisma.wishlist.findUnique({ where: { userId_productId: { userId: session.user.id, productId } } });
    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ wishlisted: false });
    }
    await prisma.wishlist.create({ data: { userId: session.user.id, productId } });
    return NextResponse.json({ wishlisted: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
