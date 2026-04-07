export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { profileId, action } = await request.json();

    if (!profileId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return NextResponse.json({ error: '사업자 프로필을 찾을 수 없습니다' }, { status: 404 });
    }

    if (action === 'approve') {
      await prisma.$transaction([
        prisma.businessProfile.update({
          where: { id: profileId },
          data: { verificationStatus: 'APPROVED', verifiedAt: new Date() },
        }),
        prisma.user.update({
          where: { id: profile.userId },
          data: { role: 'BUSINESS' },
        }),
      ]);
    } else {
      await prisma.businessProfile.update({
        where: { id: profileId },
        data: { verificationStatus: 'REJECTED' },
      });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error('Admin approve error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
