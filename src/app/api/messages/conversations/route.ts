import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: session.user.id }, { receiverId: session.user.id }] },
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { id: true, name: true, image: true } }, receiver: { select: { id: true, name: true, image: true } } },
    });

    const conversationMap = new Map<string, typeof messages[0]>();
    for (const msg of messages) {
      const otherId = msg.senderId === session.user.id ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(otherId)) conversationMap.set(otherId, msg);
    }

    return NextResponse.json(Array.from(conversationMap.values()));
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
