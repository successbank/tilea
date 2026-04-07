export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createEstimateSchema } from '@/lib/validations/estimate';

interface Context {
  params: { id: string };
}

export async function GET(_: Request, { params }: Context) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const estimate = await prisma.estimate.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!estimate) {
      return NextResponse.json({ error: '견적서를 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error('Estimate GET error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const existing = await prisma.estimate.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: '견적서를 찾을 수 없습니다' }, { status: 404 });
    }

    const body = await request.json();

    // Status change only
    if (body.status && Object.keys(body).length === 1) {
      const updated = await prisma.estimate.update({
        where: { id: params.id },
        data: { status: body.status },
      });
      return NextResponse.json(updated);
    }

    const parsed = createEstimateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다' },
        { status: 400 }
      );
    }

    const updated = await prisma.estimate.update({
      where: { id: params.id },
      data: {
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone || null,
        customerEmail: parsed.data.customerEmail || null,
        customerAddress: parsed.data.customerAddress || null,
        items: parsed.data.items,
        subtotal: parsed.data.subtotal,
        marginRate: parsed.data.marginRate,
        marginAmount: parsed.data.marginAmount,
        totalAmount: parsed.data.totalAmount,
        validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
        notes: parsed.data.notes || null,
        templateType: parsed.data.templateType || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Estimate PUT error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const existing = await prisma.estimate.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: '견적서를 찾을 수 없습니다' }, { status: 404 });
    }

    await prisma.estimate.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Estimate DELETE error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
