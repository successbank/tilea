import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;

    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = category;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, include: { sections: { include: { _count: { select: { lessons: true } } } } } }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({ courses, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
