import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const where: Record<string, unknown> = { status: 'active' };
    if (region) where.region = { contains: region, mode: 'insensitive' };

    const programs = await prisma.supportProgram.findMany({ where, orderBy: { applyEnd: 'asc' } });
    return NextResponse.json(programs);
  } catch (error) {
    console.error('Support programs error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== 'ADMIN') return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });

    const body = await request.json();
    const program = await prisma.supportProgram.create({ data: body });
    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Support program create error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
