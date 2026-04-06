import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  try {
    const req = await prisma.auctionRequest.findUnique({
      where: { id: params.id },
      include: { user: { select: { name: true } }, bids: { include: { bidder: { select: { name: true, businessProfile: { select: { shopName: true, averageRating: true, reviewCount: true } } } } }, orderBy: { price: 'asc' } }, contract: true },
    });
    if (!req) return NextResponse.json({ error: '의뢰를 찾을 수 없습니다' }, { status: 404 });
    return NextResponse.json(req);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function PUT(request: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const body = await request.json();
    const updated = await prisma.auctionRequest.update({ where: { id: params.id }, data: body });
    return NextResponse.json(updated);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
