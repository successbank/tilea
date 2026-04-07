'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const CATEGORIES = [{ value: 'PANEL', label: '판재' }, { value: 'TIMBER', label: '각재' }, { value: 'HARDWARE', label: '하드웨어' }, { value: 'PAINT', label: '도료' }, { value: 'ACCESSORY', label: '부자재' }, { value: 'OTHER', label: '기타' }];

export default function NewInventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fd.get('name'), category: fd.get('category'), spec: fd.get('spec') || undefined, unit: fd.get('unit'), quantity: Number(fd.get('quantity')), unitPrice: Number(fd.get('unitPrice')), minQuantity: fd.get('minQuantity') ? Number(fd.get('minQuantity')) : undefined, location: fd.get('location') || undefined, barcode: fd.get('barcode') || undefined }) });
    setLoading(false);
    if (!res.ok) { setError((await res.json()).error); return; }
    router.push('/dashboard/inventory');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-foreground">자재 등록</h1>
      <Card><CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>자재명 *</Label><Input name="name" required placeholder="자재 이름" /></div>
          <div className="grid grid-cols-2 gap-4"><div><Label>카테고리 *</Label><Select name="category" required>{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</Select></div><div><Label>단위 *</Label><Input name="unit" required placeholder="장, 개, m, kg" /></div></div>
          <div><Label>규격</Label><Input name="spec" placeholder="예: 2440×1220×18mm" /></div>
          <div className="grid grid-cols-3 gap-4"><div><Label>초기 수량</Label><Input name="quantity" type="number" defaultValue={0} /></div><div><Label>단가 (원)</Label><Input name="unitPrice" type="number" defaultValue={0} /></div><div><Label>안전재고</Label><Input name="minQuantity" type="number" placeholder="최소 수량" /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><Label>보관 위치</Label><Input name="location" placeholder="창고 A-3" /></div><div><Label>바코드/QR</Label><Input name="barcode" placeholder="바코드 번호" /></div></div>
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? '등록 중...' : '자재 등록'}</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
