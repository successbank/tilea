export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cuttingProjectSchema } from '@/lib/validations/cutting';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const projects = await prisma.cuttingProject.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        sheetWidth: true,
        sheetHeight: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Cutting projects GET error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = cuttingProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const project = await prisma.cuttingProject.create({
      data: {
        userId: session.user.id,
        ...parsed.data,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Cutting project create error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
