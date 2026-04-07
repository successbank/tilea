export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/upload';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: '사업자 인증을 먼저 완료하세요' }, { status: 400 });
    }

    if (profile.portfolioImages.length >= 10) {
      return NextResponse.json({ error: '포트폴리오 이미지는 최대 10장입니다' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 });
    }

    const url = await uploadFile(file, 'portfolio');

    await prisma.businessProfile.update({
      where: { userId: session.user.id },
      data: {
        portfolioImages: { push: url },
      },
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Portfolio upload error:', error);
    return NextResponse.json({ error: '업로드에 실패했습니다' }, { status: 500 });
  }
}
