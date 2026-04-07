export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;

    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = category;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { author: { select: { name: true } } },
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({ articles, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Articles GET error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== 'ADMIN') return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });

    const body = await request.json();
    const slug = body.title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').slice(0, 100) + '-' + Date.now().toString(36);

    const article = await prisma.article.create({
      data: { authorId: session.user.id, title: body.title, slug, content: body.content, excerpt: body.excerpt, coverImage: body.coverImage, category: body.category, tags: body.tags || [], isPublished: body.isPublished ?? false, publishedAt: body.isPublished ? new Date() : null },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Article create error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
