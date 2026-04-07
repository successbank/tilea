export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyBusinessNumber } from '@/lib/nts';
import { businessVerifySchema } from '@/lib/validations/business';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = businessVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { businessNumber, businessName, ownerName, businessType } = parsed.data;

    const existing = await prisma.businessProfile.findUnique({
      where: { businessNumber },
    });
    if (existing) {
      return NextResponse.json({ error: '이미 등록된 사업자번호입니다' }, { status: 409 });
    }

    const userProfile = await prisma.businessProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (userProfile) {
      return NextResponse.json({ error: '이미 사업자 인증을 신청하셨습니다' }, { status: 409 });
    }

    const ntsResult = await verifyBusinessNumber(businessNumber);

    if (!ntsResult.valid) {
      return NextResponse.json(
        { error: `유효하지 않은 사업자번호입니다 (${ntsResult.status})` },
        { status: 400 }
      );
    }

    const profile = await prisma.businessProfile.create({
      data: {
        userId: session.user.id,
        businessNumber,
        businessName,
        ownerName,
        businessType: businessType || null,
      },
    });

    return NextResponse.json({
      id: profile.id,
      verified: true,
      ntsStatus: ntsResult.status,
      verificationStatus: profile.verificationStatus,
    });
  } catch (error) {
    console.error('Business verify error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
