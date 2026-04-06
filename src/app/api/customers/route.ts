import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const where: Record<string, unknown> = { userId: session.user.id };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const customers = await prisma.customer.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(customers);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const body = await request.json();
    const customer = await prisma.customer.create({ data: { userId: session.user.id, ...body } });
    return NextResponse.json(customer, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
