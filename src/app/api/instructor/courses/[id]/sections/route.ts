export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function POST(request: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const course = await prisma.course.findFirst({ where: { id: params.id, instructorId: session.user.id } });
    if (!course) return NextResponse.json({ error: '강의를 찾을 수 없습니다' }, { status: 404 });
    const { title } = await request.json();
    const count = await prisma.courseSection.count({ where: { courseId: params.id } });
    const section = await prisma.courseSection.create({ data: { courseId: params.id, title, sortOrder: count } });
    return NextResponse.json(section, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
