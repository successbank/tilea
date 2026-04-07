export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;

    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (category) where.categoryId = category;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const orderBy = sort === 'popular' ? { salesCount: 'desc' as const } : sort === 'price_asc' ? { price: 'asc' as const } : sort === 'price_desc' ? { price: 'desc' as const } : sort === 'rating' ? { averageRating: 'desc' as const } : { createdAt: 'desc' as const };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: { category: { select: { name: true } }, seller: { select: { name: true } } } }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const body = await request.json();
    const product = await prisma.product.create({ data: { sellerId: session.user.id, ...body } });
    return NextResponse.json(product, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
