export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const where: Record<string, unknown> = { userId: session.user.id };
    if (type) where.type = type;
    const expenses = await prisma.expense.findMany({ where, orderBy: { date: 'desc' }, take: 100 });
    const totals = { income: 0, expense: 0 };
    expenses.forEach((e) => { if (e.type === 'INCOME') totals.income += e.amount; else totals.expense += e.amount; });
    return NextResponse.json({ expenses, totals });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const body = await request.json();
    const expense = await prisma.expense.create({ data: { userId: session.user.id, ...body } });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
