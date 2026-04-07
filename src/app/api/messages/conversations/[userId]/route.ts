export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Ctx { params: { userId: string } }

export async function GET(_: Request, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: session.user.id, receiverId: params.userId }, { senderId: params.userId, receiverId: session.user.id }] },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, image: true } } },
    });
    // 읽음 처리
    await prisma.message.updateMany({ where: { senderId: params.userId, receiverId: session.user.id, isRead: false }, data: { isRead: true } });
    return NextResponse.json(messages);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
