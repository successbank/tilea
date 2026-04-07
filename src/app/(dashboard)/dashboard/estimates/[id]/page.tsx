export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'outline' }> = { DRAFT: { label: '작성중', variant: 'outline' }, SENT: { label: '발송', variant: 'default' }, ACCEPTED: { label: '수락', variant: 'success' }, CONTRACTED: { label: '계약', variant: 'success' }, COMPLETED: { label: '완료', variant: 'success' }, REJECTED: { label: '거절', variant: 'destructive' } };

export default function EstimateDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(`/api/estimates/${id}`).then((r) => r.json()).then(setEstimate).finally(() => setLoading(false)); }, [id]);

  if (loading) return <p className="py-10 text-center text-muted">불러오는 중...</p>;
  if (!estimate) return <p className="py-10 text-center text-muted">견적서를 찾을 수 없습니다</p>;

  const items = (estimate.items || []) as Array<{ category: string; name: string; spec: string; quantity: number; unitPrice: number; amount: number }>;
  const st = STATUS_MAP[estimate.status] || STATUS_MAP.DRAFT;
  const fmt = (n: number) => `₩${n.toLocaleString()}`;

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/estimates/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setEstimate({ ...estimate, status });
  };

  const handleDuplicate = async () => {
    const res = await fetch(`/api/estimates/${id}/duplicate`, { method: 'POST' });
    if (res.ok) router.push('/dashboard/estimates');
  };

  const handleSend = async () => {
    await fetch(`/api/estimates/${id}/send`, { method: 'POST' });
    setEstimate({ ...estimate, status: 'SENT' });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{estimate.estimateNo}</h1>
          <p className="text-sm text-muted">{estimate.customerName} · {new Date(estimate.createdAt).toLocaleDateString('ko-KR')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={st.variant}>{st.label}</Badge>
          {estimate.status === 'DRAFT' && <Button size="sm" onClick={handleSend}>이메일 발송</Button>}
          {estimate.status === 'SENT' && <Button size="sm" variant="outline" onClick={() => handleStatusChange('ACCEPTED')}>수락 처리</Button>}
          <Button size="sm" variant="outline" onClick={handleDuplicate}>복제</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>항목</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-muted"><th className="pb-2">카테고리</th><th className="pb-2">품명</th><th className="pb-2">규격</th><th className="pb-2 text-right">수량</th><th className="pb-2 text-right">단가</th><th className="pb-2 text-right">금액</th></tr></thead>
            <tbody>{items.map((item, i) => <tr key={i} className="border-b border-border"><td className="py-2">{item.category}</td><td>{item.name}</td><td>{item.spec || '-'}</td><td className="text-right">{item.quantity}</td><td className="text-right">{fmt(item.unitPrice)}</td><td className="text-right font-medium">{fmt(item.amount)}</td></tr>)}</tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-right text-sm">
            <p>소계: <span className="font-medium">{fmt(estimate.subtotal)}</span></p>
            <p>마진 ({estimate.marginRate}%): <span className="font-medium">{fmt(estimate.marginAmount)}</span></p>
            <p className="text-xl font-bold text-primary">합계: {fmt(estimate.totalAmount)}</p>
          </div>
          {estimate.notes && <p className="mt-4 text-sm text-muted">비고: {estimate.notes}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
