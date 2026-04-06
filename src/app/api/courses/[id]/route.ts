import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  try {
    const course = await prisma.course.findUnique({ where: { id: params.id }, include: { sections: { include: { lessons: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }, reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 } } });
    if (!course) return NextResponse.json({ error: '강의를 찾을 수 없습니다' }, { status: 404 });
    return NextResponse.json(course);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
