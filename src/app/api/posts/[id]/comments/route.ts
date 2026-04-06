import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const post = await prisma.post.findUnique({
      where: { id, status: 'ACTIVE' },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { postId: id, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, image: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Comments GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { id } = params;

    const post = await prisma.post.findUnique({
      where: { id, status: 'ACTIVE' },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: '댓글 내용을 입력해주세요' },
        { status: 400 }
      );
    }

    // If replying, verify parent comment exists and belongs to same post
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { postId: true },
      });

      if (!parentComment || parentComment.postId !== id) {
        return NextResponse.json(
          { error: '원본 댓글을 찾을 수 없습니다' },
          { status: 404 }
        );
      }
    }

    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          postId: id,
          userId: session.user.id,
          parentId: parentId || null,
          content: content.trim(),
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
          replies: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
        },
      }),
      prisma.pointTransaction.create({
        data: {
          userId: session.user.id,
          amount: 3,
          reason: '댓글 작성',
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { points: { increment: 3 } },
      }),
    ]);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Comment create error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
