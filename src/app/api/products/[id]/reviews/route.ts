export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  try {
    const reviews = await prisma.productReview.findMany({ where: { productId: params.id }, include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(reviews);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const { rating, content, images } = await request.json();
    const review = await prisma.productReview.create({ data: { productId: params.id, userId: session.user.id, rating, content, images: images || [] } });
    const agg = await prisma.productReview.aggregate({ where: { productId: params.id }, _avg: { rating: true }, _count: true });
    await prisma.product.update({ where: { id: params.id }, data: { averageRating: agg._avg.rating || 0, reviewCount: agg._count } });
    return NextResponse.json(review, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
