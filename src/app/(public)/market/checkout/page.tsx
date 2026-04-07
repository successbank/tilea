export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CartItem { id: string; quantity: number; product: { id: string; title: string; price: number; salePrice: number | null; images: string[] } }

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ items: CartItem[]; totalAmount: number }>({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetch('/api/cart').then((r) => r.json()).then(setCart).finally(() => setLoading(false)); }, []);

  const handleOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOrdering(true); setError(null);
    const fd = new FormData(e.currentTarget);

    const orderRes = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart.items.map((i) => ({ productId: i.product.id, quantity: i.quantity })), shippingInfo: { recipientName: fd.get('name') as string, recipientPhone: fd.get('phone') as string, recipientAddress: fd.get('address') as string } }) });

    if (!orderRes.ok) { setError((await orderRes.json()).error); setOrdering(false); return; }
    const order = await orderRes.json();

    // 결제 승인 (Dev: mock)
    const payRes = await fetch('/api/payments/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.id, paymentKey: `mock_${Date.now()}`, amount: order.totalAmount }) });
    setOrdering(false);

    if (!payRes.ok) { setError((await payRes.json()).error); return; }
    router.push('/dashboard');
  };

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-8"><p className="text-center text-muted">불러오는 중...</p></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">주문/결제</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>주문 상품 ({cart.items.length})</CardTitle></CardHeader>
        <CardContent>{cart.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b border-border py-3">
            <div className="flex items-center gap-3">{item.product.images?.[0] && <img src={item.product.images[0]} className="h-12 w-12 rounded object-cover" />}<div><p className="text-sm font-medium">{item.product.title}</p><p className="text-xs text-muted">{item.quantity}개</p></div></div>
            <p className="font-medium">₩{((item.product.salePrice || item.product.price) * item.quantity).toLocaleString()}</p>
          </div>
        ))}<p className="mt-4 text-right text-xl font-bold text-primary">합계: ₩{cart.totalAmount.toLocaleString()}</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>배송 정보</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleOrder} className="space-y-4">
            <div><Label>수령인 *</Label><Input name="name" required placeholder="이름" /></div>
            <div><Label>연락처 *</Label><Input name="phone" required placeholder="01012345678" /></div>
            <div><Label>주소 *</Label><Input name="address" required placeholder="배송 주소" /></div>
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>}
            <Button type="submit" disabled={ordering || cart.items.length === 0} className="w-full">{ordering ? '결제 처리 중...' : `₩${cart.totalAmount.toLocaleString()} 결제하기`}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
