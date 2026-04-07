'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const TYPES = [{ value: 'SELL', label: '판매' }, { value: 'BUY', label: '구매' }, { value: 'EXCHANGE', label: '교환' }, { value: 'FREE', label: '나눔' }];
const CATEGORIES = ['수공구', '전동공구', '목재', '합판', '하드웨어', '도료', '기타'];

export default function WriteTradePostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/trade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: fd.get('title'), description: fd.get('description'), tradeType: fd.get('tradeType'), category: fd.get('category'), price: fd.get('price') ? Number(fd.get('price')) : null, region: fd.get('region'), district: fd.get('district') || undefined, images: [] }) });
    setLoading(false);
    if (!res.ok) { setError((await res.json()).error); return; }
    const post = await res.json();
    router.push(`/trade/${post.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card><CardHeader><CardTitle>중고거래 글쓰기</CardTitle></CardHeader><CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><Label>거래 유형 *</Label><Select name="tradeType" required>{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</Select></div><div><Label>카테고리 *</Label><Select name="category" required>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select></div></div>
          <div><Label>제목 *</Label><Input name="title" required placeholder="상품명을 입력하세요" /></div>
          <div><Label>설명 *</Label><Textarea name="description" required placeholder="상품 상태, 사용 기간 등을 자세히 적어주세요" rows={6} /></div>
          <div className="grid grid-cols-3 gap-4"><div><Label>가격 (원)</Label><Input name="price" type="number" placeholder="가격 협의 시 비워두세요" /></div><div><Label>지역 *</Label><Input name="region" required placeholder="서울특별시" /></div><div><Label>구/군</Label><Input name="district" placeholder="성동구" /></div></div>
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? '등록 중...' : '등록하기'}</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
