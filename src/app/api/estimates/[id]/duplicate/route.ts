export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Context {
  params: { id: string };
}

export async function POST(_: Request, { params }: Context) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const original = await prisma.estimate.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!original) {
      return NextResponse.json({ error: '견적서를 찾을 수 없습니다' }, { status: 404 });
    }

    // Generate new estimate number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `EST-${dateStr}-`;
    const last = await prisma.estimate.findFirst({
      where: { estimateNo: { startsWith: prefix } },
      orderBy: { estimateNo: 'desc' },
    });
    const seq = last ? parseInt(last.estimateNo.slice(-3)) + 1 : 1;
    const estimateNo = `${prefix}${seq.toString().padStart(3, '0')}`;

    const duplicate = await prisma.estimate.create({
      data: {
        userId: session.user.id,
        estimateNo,
        customerName: original.customerName,
        customerPhone: original.customerPhone,
        customerEmail: original.customerEmail,
        customerAddress: original.customerAddress,
        items: original.items as object,
        subtotal: original.subtotal,
        marginRate: original.marginRate,
        marginAmount: original.marginAmount,
        totalAmount: original.totalAmount,
        notes: original.notes,
        templateType: original.templateType,
        status: 'DRAFT',
      },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error('Estimate duplicate error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
