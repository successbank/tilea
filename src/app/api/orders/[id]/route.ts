export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const order = await prisma.order.findFirst({ where: { id: params.id, buyerId: session.user.id }, include: { items: { include: { product: { select: { title: true, images: true } } } }, payment: true, shipping: true } });
    if (!order) return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
