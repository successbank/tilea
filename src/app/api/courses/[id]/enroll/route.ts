import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function POST(_: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

    const course = await prisma.course.findUnique({ where: { id: params.id } });
    if (!course) return NextResponse.json({ error: '강의를 찾을 수 없습니다' }, { status: 404 });

    const existing = await prisma.enrollment.findUnique({ where: { courseId_userId: { courseId: params.id, userId: session.user.id } } });
    if (existing) return NextResponse.json({ error: '이미 수강 중입니다' }, { status: 409 });

    if (course.price > 0) {
      console.warn(`[DEV] 유료 강의 결제 필요: ${course.title} (₩${course.price})`);
    }

    const enrollment = await prisma.enrollment.create({ data: { courseId: params.id, userId: session.user.id } });
    await prisma.course.update({ where: { id: params.id }, data: { enrollCount: { increment: 1 } } });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
