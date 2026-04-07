export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const item = await prisma.inventory.findFirst({ where: { id: params.id, userId: session.user.id }, include: { transactions: { orderBy: { date: 'desc' }, take: 20 } } });
    if (!item) return NextResponse.json({ error: '자재를 찾을 수 없습니다' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function PUT(request: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const existing = await prisma.inventory.findFirst({ where: { id: params.id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: '자재를 찾을 수 없습니다' }, { status: 404 });
    const body = await request.json();
    const updated = await prisma.inventory.update({ where: { id: params.id }, data: body });
    return NextResponse.json(updated);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const existing = await prisma.inventory.findFirst({ where: { id: params.id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: '자재를 찾을 수 없습니다' }, { status: 404 });
    await prisma.inventory.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
