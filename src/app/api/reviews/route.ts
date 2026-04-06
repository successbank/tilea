import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const body = await request.json();
    const review = await prisma.review.create({
      data: { contractId: body.contractId, reviewerId: session.user.id, targetId: body.targetId, rating: body.rating, qualityRating: body.qualityRating, communicationRating: body.communicationRating, punctualityRating: body.punctualityRating, priceRating: body.priceRating, content: body.content, images: body.images || [] },
    });
    // Update business profile average rating
    const agg = await prisma.review.aggregate({ where: { targetId: body.targetId }, _avg: { rating: true }, _count: true });
    await prisma.businessProfile.updateMany({ where: { userId: body.targetId }, data: { averageRating: agg._avg.rating || 0, reviewCount: agg._count } });
    return NextResponse.json(review, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
