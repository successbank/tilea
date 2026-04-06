import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  try {
    const logs = await prisma.projectLog.findMany({ where: { projectId: params.id }, orderBy: { date: 'desc' } });
    return NextResponse.json(logs);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const project = await prisma.project.findFirst({ where: { id: params.id, userId: session.user.id } });
    if (!project) return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다' }, { status: 404 });
    const body = await request.json();
    const log = await prisma.projectLog.create({ data: { projectId: params.id, content: body.content, images: body.images || [], hoursWorked: body.hoursWorked } });
    return NextResponse.json(log, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
