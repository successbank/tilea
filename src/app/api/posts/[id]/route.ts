export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const post = await prisma.post.update({
      where: { id, status: 'ACTIVE' },
      data: { views: { increment: 1 } },
      include: {
        user: { select: { id: true, name: true, image: true } },
        comments: {
          where: { parentId: null },
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
        },
        _count: { select: { comments: true, bookmarks: true } },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // Check if current user has bookmarked this post
    let isBookmarked = false;
    const session = await auth();
    if (session?.user?.id) {
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: id,
          },
        },
      });
      isBookmarked = !!bookmark;
    }

    return NextResponse.json({ ...post, isBookmarked });
  } catch (error) {
    console.error('Post GET error:', error);
    return NextResponse.json(
      { error: '게시글을 찾을 수 없습니다' },
      { status: 404 }
    );
  }
}

export async function PUT(
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

    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!existingPost || existingPost.status === 'DELETED') {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (existingPost.userId !== session.user.id) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, images, tags } = body;

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(images !== undefined && { images }),
        ...(tags !== undefined && { tags }),
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Post PUT error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!existingPost || existingPost.status === 'DELETED') {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (existingPost.userId !== session.user.id) {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다' },
        { status: 403 }
      );
    }

    await prisma.post.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    return NextResponse.json({ message: '게시글이 삭제되었습니다' });
  } catch (error) {
    console.error('Post DELETE error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
