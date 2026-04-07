export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const txns = await prisma.inventoryTransaction.findMany({ where: { inventoryId: params.id }, orderBy: { date: 'desc' } });
    return NextResponse.json(txns);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const inv = await prisma.inventory.findFirst({ where: { id: params.id, userId: session.user.id } });
    if (!inv) return NextResponse.json({ error: '자재를 찾을 수 없습니다' }, { status: 404 });

    const { type, quantity, unitPrice, note } = await request.json();
    if (!type || !quantity) return NextResponse.json({ error: 'type과 quantity가 필요합니다' }, { status: 400 });

    const [txn] = await prisma.$transaction([
      prisma.inventoryTransaction.create({ data: { inventoryId: params.id, type, quantity, unitPrice, note } }),
      prisma.inventory.update({ where: { id: params.id }, data: { quantity: { increment: type === 'IN' ? quantity : -quantity } } }),
    ]);

    return NextResponse.json(txn, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
