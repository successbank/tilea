import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

    const courses = await prisma.course.findMany({ where: { instructorId: session.user.id }, select: { id: true, title: true, price: true, enrollCount: true, averageRating: true } });

    const totalRevenue = courses.reduce((sum, c) => sum + c.price * c.enrollCount, 0);
    const instructorShare = Math.round(totalRevenue * 0.7);
    const platformFee = Math.round(totalRevenue * 0.3);
    const tax = Math.round(instructorShare * 0.033);
    const netAmount = instructorShare - tax;

    const payouts = await prisma.instructorPayout.findMany({ where: { instructorId: session.user.id }, orderBy: { createdAt: 'desc' } });

    return NextResponse.json({ courses, totalRevenue, instructorShare, platformFee, tax, netAmount, payouts });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
