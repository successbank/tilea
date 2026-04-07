export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const orders = await prisma.order.findMany({ where: { buyerId: session.user.id }, orderBy: { createdAt: 'desc' }, include: { items: { include: { product: { select: { title: true, images: true } } } }, payment: true, shipping: true } });
    return NextResponse.json(orders);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    const { items, shippingInfo } = await request.json();

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `ORD-${dateStr}-`;
    const last = await prisma.order.findFirst({ where: { orderNo: { startsWith: prefix } }, orderBy: { orderNo: 'desc' } });
    const seq = last ? parseInt(last.orderNo.slice(-3)) + 1 : 1;
    const orderNo = `${prefix}${seq.toString().padStart(3, '0')}`;

    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) return NextResponse.json({ error: `재고 부족: ${product?.title || item.productId}` }, { status: 400 });
      const amount = product.price * item.quantity;
      totalAmount += amount;
      orderItems.push({ productId: item.productId, sellerId: product.sellerId, quantity: item.quantity, unitPrice: product.price, amount });
    }

    const order = await prisma.order.create({
      data: { orderNo, buyerId: session.user.id, totalAmount, items: { create: orderItems }, shipping: shippingInfo ? { create: shippingInfo } : undefined },
      include: { items: true, shipping: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
