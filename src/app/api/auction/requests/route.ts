export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const region = searchParams.get('region');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (region) where.region = { contains: region, mode: 'insensitive' };

    const [requests, total] = await Promise.all([
      prisma.auctionRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, include: { user: { select: { name: true } }, _count: { select: { bids: true } } } }),
      prisma.auctionRequest.count({ where }),
    ]);
    return NextResponse.json({ requests, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const body = await request.json();
    const req = await prisma.auctionRequest.create({ data: { userId: session.user.id, ...body, deadline: body.deadline ? new Date(body.deadline) : null, bidDeadline: body.bidDeadline ? new Date(body.bidDeadline) : null } });
    return NextResponse.json(req, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
