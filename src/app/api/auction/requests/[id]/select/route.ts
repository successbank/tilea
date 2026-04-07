export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function POST(request: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

    const req = await prisma.auctionRequest.findFirst({ where: { id: params.id, userId: session.user.id } });
    if (!req) return NextResponse.json({ error: '의뢰를 찾을 수 없습니다' }, { status: 404 });

    const { bidId } = await request.json();
    if (!bidId) return NextResponse.json({ error: '입찰 ID가 필요합니다' }, { status: 400 });

    await prisma.$transaction([
      prisma.auctionBid.update({ where: { id: bidId }, data: { status: 'SELECTED' } }),
      prisma.auctionRequest.update({ where: { id: params.id }, data: { status: 'SELECTED' } }),
      prisma.auctionContract.create({ data: { requestId: params.id, bidId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
