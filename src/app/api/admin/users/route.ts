export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== 'ADMIN') return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const where: Record<string, unknown> = {};
    if (search) where.OR = [{ email: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }];

    const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100, select: { id: true, email: true, name: true, role: true, status: true, createdAt: true, points: true, businessProfile: { select: { shopName: true, verificationStatus: true } } } });
    return NextResponse.json(users);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
