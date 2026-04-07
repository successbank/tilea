export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const customer = await prisma.customer.findFirst({ where: { id: params.id, userId: session.user.id } });
    if (!customer) return NextResponse.json({ error: '고객을 찾을 수 없습니다' }, { status: 404 });
    return NextResponse.json(customer);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function PUT(request: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const body = await request.json();
    const updated = await prisma.customer.update({ where: { id: params.id }, data: body });
    return NextResponse.json(updated);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    await prisma.customer.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
