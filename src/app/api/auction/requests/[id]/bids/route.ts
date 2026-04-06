import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  try {
    const bids = await prisma.auctionBid.findMany({ where: { requestId: params.id }, include: { bidder: { select: { name: true, businessProfile: { select: { shopName: true, averageRating: true } } } } }, orderBy: { price: 'asc' } });
    return NextResponse.json(bids);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== 'BUSINESS') return NextResponse.json({ error: '사업자 회원만 입찰할 수 있습니다' }, { status: 403 });

    const body = await request.json();
    const bid = await prisma.auctionBid.create({ data: { requestId: params.id, bidderId: session.user.id, price: body.price, priceBreakdown: body.priceBreakdown, estimatedDays: body.estimatedDays, portfolio: body.portfolio || [], message: body.message } });

    await prisma.auctionRequest.update({ where: { id: params.id }, data: { status: 'BIDDING' } });
    return NextResponse.json(bid, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
