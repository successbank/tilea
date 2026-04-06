import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const enrollments = await prisma.enrollment.findMany({ where: { userId: session.user.id }, include: { course: { select: { id: true, title: true, coverImage: true, category: true, instructorId: true } } }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(enrollments);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
