export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tradeType = searchParams.get('tradeType');
    const category = searchParams.get('category');
    const region = searchParams.get('region');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;

    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (tradeType) where.tradeType = tradeType;
    if (category) where.category = category;
    if (region) where.region = { contains: region, mode: 'insensitive' };

    const [posts, total] = await Promise.all([
      prisma.tradePost.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, include: { user: { select: { name: true } } } }),
      prisma.tradePost.count({ where }),
    ]);

    return NextResponse.json({ posts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const body = await request.json();
    const post = await prisma.tradePost.create({ data: { userId: session.user.id, ...body } });
    return NextResponse.json(post, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
