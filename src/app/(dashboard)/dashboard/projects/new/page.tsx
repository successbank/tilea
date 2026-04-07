export const dynamic = 'force-dynamic';
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fd.get('name'), customerName: fd.get('customerName'), customerPhone: fd.get('customerPhone'), customerEmail: fd.get('customerEmail'), requirements: fd.get('requirements'), budget: fd.get('budget') ? Number(fd.get('budget')) : undefined, deadline: fd.get('deadline') || undefined }) });
    setLoading(false);
    if (!res.ok) { setError((await res.json()).error); return; }
    router.push('/dashboard/projects');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-foreground">새 프로젝트</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>프로젝트명 *</Label><Input name="name" required placeholder="프로젝트 이름" /></div>
            <div><Label>고객명 *</Label><Input name="customerName" required placeholder="고객 이름" /></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>연락처</Label><Input name="customerPhone" placeholder="01012345678" /></div><div><Label>이메일</Label><Input name="customerEmail" type="email" placeholder="이메일" /></div></div>
            <div><Label>요구사항</Label><Textarea name="requirements" placeholder="프로젝트 요구사항을 입력하세요" rows={4} /></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>예산 (원)</Label><Input name="budget" type="number" placeholder="예산" /></div><div><Label>마감일</Label><Input name="deadline" type="date" /></div></div>
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? '생성 중...' : '프로젝트 생성'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
