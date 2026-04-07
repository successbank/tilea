export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // Check if user already liked this post via PointTransaction
    const existingLike = await prisma.pointTransaction.findFirst({
      where: {
        userId: session.user.id,
        reason: `게시글 좋아요:${id}`,
      },
    });

    if (existingLike) {
      // Unlike: remove the like record and decrement
      await prisma.$transaction([
        prisma.pointTransaction.delete({
          where: { id: existingLike.id },
        }),
        prisma.post.update({
          where: { id },
          data: { likes: { decrement: 1 } },
        }),
        // Deduct 2 points from post author
        ...(post.userId !== session.user.id
          ? [
              prisma.pointTransaction.create({
                data: {
                  userId: post.userId,
                  amount: -2,
                  reason: `게시글 좋아요 취소 차감`,
                },
              }),
              prisma.user.update({
                where: { id: post.userId },
                data: { points: { decrement: 2 } },
              }),
            ]
          : []),
      ]);

      const updatedPost = await prisma.post.findUnique({
        where: { id },
        select: { likes: true },
      });

      return NextResponse.json({ liked: false, likes: updatedPost?.likes ?? 0 });
    } else {
      // Like: create like record and increment
      await prisma.$transaction([
        prisma.pointTransaction.create({
          data: {
            userId: session.user.id,
            amount: 0,
            reason: `게시글 좋아요:${id}`,
          },
        }),
        prisma.post.update({
          where: { id },
          data: { likes: { increment: 1 } },
        }),
        // Award 2 points to post author (not self-likes)
        ...(post.userId !== session.user.id
          ? [
              prisma.pointTransaction.create({
                data: {
                  userId: post.userId,
                  amount: 2,
                  reason: '게시글 좋아요 포인트',
                },
              }),
              prisma.user.update({
                where: { id: post.userId },
                data: { points: { increment: 2 } },
              }),
            ]
          : []),
      ]);

      const updatedPost = await prisma.post.findUnique({
        where: { id },
        select: { likes: true },
      });

      return NextResponse.json({ liked: true, likes: updatedPost?.likes ?? 0 });
    }
  } catch (error) {
    console.error('Post like error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
