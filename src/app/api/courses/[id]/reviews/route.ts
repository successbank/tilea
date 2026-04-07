export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function POST(request: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const enrollment = await prisma.enrollment.findUnique({ where: { courseId_userId: { courseId: params.id, userId: session.user.id } } });
    if (!enrollment) return NextResponse.json({ error: '수강 중인 강의만 리뷰할 수 있습니다' }, { status: 403 });
    const { rating, content } = await request.json();
    const review = await prisma.courseReview.create({ data: { courseId: params.id, userId: session.user.id, rating, content } });
    const agg = await prisma.courseReview.aggregate({ where: { courseId: params.id }, _avg: { rating: true }, _count: true });
    await prisma.course.update({ where: { id: params.id }, data: { averageRating: agg._avg.rating || 0, reviewCount: agg._count } });
    return NextResponse.json(review, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
