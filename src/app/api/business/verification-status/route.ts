import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        verificationStatus: true,
        businessNumber: true,
        businessName: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ status: 'none' });
    }

    return NextResponse.json({
      status: profile.verificationStatus,
      businessNumber: profile.businessNumber,
      businessName: profile.businessName,
      appliedAt: profile.createdAt,
    });
  } catch (error) {
    console.error('Verification status error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
