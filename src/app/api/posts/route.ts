export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const board = searchParams.get('board');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const where: Record<string, unknown> = { status: 'ACTIVE' };

    if (board) {
      where.board = board;
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Record<string, string>;
    switch (sort) {
      case 'popular':
        orderBy = { likes: 'desc' };
        break;
      case 'comments':
        orderBy = { comments: 'desc' };
        break;
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          orderBy,
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, image: true } },
          _count: { select: { comments: true, bookmarks: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Posts GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { board, title, content, images, tags } = body;

    if (!board || !title || !content) {
      return NextResponse.json(
        { error: '게시판, 제목, 내용은 필수입니다' },
        { status: 400 }
      );
    }

    const [post] = await prisma.$transaction([
      prisma.post.create({
        data: {
          userId: session.user.id,
          board,
          title,
          content,
          images: images || [],
          tags: tags || [],
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      }),
      prisma.pointTransaction.create({
        data: {
          userId: session.user.id,
          amount: 10,
          reason: '게시글 작성',
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { points: { increment: 10 } },
      }),
    ]);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Post create error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
