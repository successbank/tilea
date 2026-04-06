import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createEstimateSchema } from '@/lib/validations/estimate';

async function generateEstimateNo(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `EST-${dateStr}-`;

  const lastEstimate = await prisma.estimate.findFirst({
    where: { estimateNo: { startsWith: prefix } },
    orderBy: { estimateNo: 'desc' },
  });

  const seq = lastEstimate
    ? parseInt(lastEstimate.estimateNo.slice(-3)) + 1
    : 1;

  return `${prefix}${seq.toString().padStart(3, '0')}`;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;

    const where: Record<string, unknown> = { userId: session.user.id };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { estimateNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [estimates, total] = await Promise.all([
      prisma.estimate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.estimate.count({ where }),
    ]);

    return NextResponse.json({
      estimates,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Estimates GET error:', error);
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
    const parsed = createEstimateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const estimateNo = await generateEstimateNo();

    const estimate = await prisma.estimate.create({
      data: {
        userId: session.user.id,
        estimateNo,
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

    return NextResponse.json(estimate, { status: 201 });
  } catch (error) {
    console.error('Estimate create error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
