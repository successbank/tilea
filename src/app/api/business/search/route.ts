import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const region = searchParams.get('region') || '';
    const specialty = searchParams.get('specialty') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;

    const where: Record<string, unknown> = {
      verificationStatus: 'APPROVED',
    };

    if (keyword) {
      where.OR = [
        { shopName: { contains: keyword, mode: 'insensitive' } },
        { businessName: { contains: keyword, mode: 'insensitive' } },
        { introduction: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (region) {
      where.address = { contains: region, mode: 'insensitive' };
    }

    if (specialty) {
      where.specialty = { has: specialty };
    }

    const [profiles, total] = await Promise.all([
      prisma.businessProfile.findMany({
        where,
        include: { user: { select: { name: true, image: true } } },
        orderBy: { averageRating: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.businessProfile.count({ where }),
    ]);

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Business search error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
