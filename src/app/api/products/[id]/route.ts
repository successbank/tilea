import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id }, include: { category: true, seller: { select: { name: true, businessProfile: { select: { shopName: true, averageRating: true } } } }, reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 } } });
    if (!product) return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
