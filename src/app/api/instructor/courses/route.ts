export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const courses = await prisma.course.findMany({ where: { instructorId: session.user.id }, include: { _count: { select: { enrollments: true, reviews: true } }, sections: { include: { _count: { select: { lessons: true } } } } }, orderBy: { updatedAt: 'desc' } });
    return NextResponse.json(courses);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const body = await request.json();
    const slug = body.title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').slice(0, 80) + '-' + Date.now().toString(36);
    const course = await prisma.course.create({ data: { instructorId: session.user.id, title: body.title, slug, description: body.description || '', category: body.category || '입문/기초', price: body.price || 0, coverImage: body.coverImage, level: body.level } });
    return NextResponse.json(course, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
