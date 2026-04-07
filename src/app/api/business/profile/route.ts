export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { businessProfileSchema } from '@/lib/validations/business';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
      }

      const profile = await prisma.businessProfile.findUnique({
        where: { userId: session.user.id },
        include: { user: { select: { name: true, image: true, email: true } } },
      });

      if (!profile) {
        return NextResponse.json({ error: '사업자 프로필이 없습니다' }, { status: 404 });
      }

      return NextResponse.json(profile);
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId },
      include: { user: { select: { name: true, image: true } } },
    });

    if (!profile || profile.verificationStatus !== 'APPROVED') {
      return NextResponse.json({ error: '프로필을 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = businessProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.businessProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: '사업자 인증을 먼저 완료하세요' }, { status: 400 });
    }

    const updated = await prisma.businessProfile.update({
      where: { userId: session.user.id },
      data: {
        shopName: parsed.data.shopName,
        introduction: parsed.data.introduction || null,
        specialty: parsed.data.specialty,
        address: parsed.data.address || null,
        addressDetail: parsed.data.addressDetail || null,
        phone: parsed.data.phone || null,
        website: parsed.data.website || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
