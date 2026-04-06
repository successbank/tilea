import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function POST(request: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const section = await prisma.courseSection.findUnique({ where: { id: params.id }, include: { course: true } });
    if (!section || section.course.instructorId !== session.user.id) return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 });
    const body = await request.json();
    const count = await prisma.lesson.count({ where: { sectionId: params.id } });
    const lesson = await prisma.lesson.create({ data: { sectionId: params.id, title: body.title, videoUrl: body.videoUrl, duration: body.duration, isFree: body.isFree || false, sortOrder: count, quiz: body.quiz } });
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
