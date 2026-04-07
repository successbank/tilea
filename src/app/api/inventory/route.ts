export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const where: Record<string, unknown> = { userId: session.user.id };
    if (category) where.category = category;

    const items = await prisma.inventory.findMany({ where, orderBy: { updatedAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

    const body = await request.json();
    const item = await prisma.inventory.create({ data: { userId: session.user.id, ...body } });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Inventory create error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
