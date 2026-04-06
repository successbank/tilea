import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id }, include: { category: true, seller: { select: { name: true, businessProfile: { select: { shopName: true, averageRating: true } } } }, reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 } } });
    if (!product) return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function PUT(request: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const product = await prisma.product.findFirst({ where: { id: params.id, sellerId: session.user.id } });
    if (!product) return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 });
    const body = await request.json();
    const updated = await prisma.product.update({ where: { id: params.id }, data: body });
    return NextResponse.json(updated);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const product = await prisma.product.findFirst({ where: { id: params.id, sellerId: session.user.id } });
    if (!product) return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 });
    await prisma.product.update({ where: { id: params.id }, data: { status: 'INACTIVE' } });
    return NextResponse.json({ success: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
