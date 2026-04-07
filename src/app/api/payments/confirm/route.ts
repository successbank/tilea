export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });

    const { orderId, paymentKey, amount } = await request.json();

    const order = await prisma.order.findFirst({ where: { id: orderId, buyerId: session.user.id } });
    if (!order) return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 });

    // 금액 서버 검증 (위변조 방지)
    if (order.totalAmount !== amount) {
      return NextResponse.json({ error: '결제 금액이 일치하지 않습니다' }, { status: 400 });
    }

    if (process.env.TOSS_SECRET_KEY) {
      // 프로덕션: 토스페이먼츠 결제 승인 API 호출
      const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: { Authorization: `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey, orderId: order.orderNo, amount }),
      });
      if (!res.ok) {
        const err = await res.json();
        return NextResponse.json({ error: err.message || '결제 승인 실패' }, { status: 400 });
      }
    } else {
      console.warn(`[DEV] 결제 승인 Mock: ${order.orderNo} / ₩${amount}`);
    }

    // 결제 기록 + 주문 상태 변경 + 재고 차감
    await prisma.$transaction([
      prisma.payment.create({ data: { orderId, paymentKey: paymentKey || `mock_${Date.now()}`, method: 'CARD', amount, status: 'APPROVED', approvedAt: new Date() } }),
      prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } }),
      ...((await prisma.orderItem.findMany({ where: { orderId } })).map((item) =>
        prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } } })
      )),
    ]);

    return NextResponse.json({ success: true, orderNo: order.orderNo });
  } catch (error) { console.error('Payment confirm error:', error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
