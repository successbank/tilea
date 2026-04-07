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
      select: { id: true, title: true, userId: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { reason, detail } = body;

    if (!reason) {
      return NextResponse.json(
        { error: '신고 사유를 선택해주세요' },
        { status: 400 }
      );
    }

    // In production, this would create a Report record in the database
    console.log(
      `[REPORT] Post reported - postId: ${id}, title: "${post.title}", ` +
      `reportedBy: ${session.user.id}, postAuthor: ${post.userId}, ` +
      `reason: ${reason}, detail: ${detail || 'N/A'}, ` +
      `timestamp: ${new Date().toISOString()}`
    );

    return NextResponse.json({ message: '신고가 접수되었습니다' });
  } catch (error) {
    console.error('Post report error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
