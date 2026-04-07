'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const CATEGORIES = ['맞춤가구', '인테리어목공', '재단가공', '보수/수리', '기타'];

export default function WriteAuctionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/auction/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: fd.get('title'), description: fd.get('description'), category: fd.get('category'), region: fd.get('region'), district: fd.get('district') || undefined, budgetMin: fd.get('budgetMin') ? Number(fd.get('budgetMin')) : null, budgetMax: fd.get('budgetMax') ? Number(fd.get('budgetMax')) : null, deadline: fd.get('deadline') || undefined, images: [] }) });
    setLoading(false);
    if (!res.ok) { setError((await res.json()).error); return; }
    const req = await res.json();
    router.push(`/auction/${req.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card><CardHeader><CardTitle>역경매 의뢰 등록</CardTitle></CardHeader><CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><Label>카테고리 *</Label><Select name="category" required>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select></div><div><Label>지역 *</Label><Input name="region" required placeholder="서울특별시" /></div></div>
          <div><Label>구/군</Label><Input name="district" placeholder="강남구" /></div>
          <div><Label>제목 *</Label><Input name="title" required placeholder="의뢰 제목" /></div>
          <div><Label>상세 요구사항 *</Label><Textarea name="description" required placeholder="필요한 작업 내용을 상세히 적어주세요" rows={6} /></div>
          <div className="grid grid-cols-3 gap-4"><div><Label>최소 예산</Label><Input name="budgetMin" type="number" placeholder="원" /></div><div><Label>최대 예산</Label><Input name="budgetMax" type="number" placeholder="원" /></div><div><Label>납기일</Label><Input name="deadline" type="date" /></div></div>
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? '등록 중...' : '의뢰 등록'}</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
