export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AUCTION_CATEGORIES = ['전체', '맞춤가구', '인테리어목공', '재단가공', '보수/수리', '기타'];
const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'outline' }> = {
  OPEN: { label: '모집중', variant: 'success' }, BIDDING: { label: '입찰중', variant: 'default' },
  SELECTED: { label: '선정완료', variant: 'warning' }, AUCTION_CONTRACTED: { label: '계약', variant: 'outline' },
  AUCTION_COMPLETED: { label: '완료', variant: 'outline' }, CANCELLED: { label: '취소', variant: 'destructive' },
};

interface AuctionItem { id: string; title: string; category: string; region: string; budgetMin: number | null; budgetMax: number | null; deadline: string | null; status: string; _count: { bids: number }; createdAt: string; }

export default function AuctionPage() {
  const [requests, setRequests] = useState<AuctionItem[]>([]);
  const [category, setCategory] = useState('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (category !== '전체') p.set('category', category);
    fetch(`/api/auction/requests?${p}`).then((r) => r.json()).then((d) => setRequests(d.requests || [])).finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">역경매</h1>
        <Link href="/auction/write"><Button>의뢰 등록</Button></Link>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {AUCTION_CATEGORIES.map((c) => <Button key={c} size="sm" variant={category === c ? 'default' : 'outline'} onClick={() => setCategory(c)}>{c}</Button>)}
      </div>
      {loading ? <p className="py-10 text-center text-muted">불러오는 중...</p> : requests.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted">아직 의뢰가 없습니다</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          {requests.map((r) => {
            const st = STATUS_MAP[r.status] || STATUS_MAP.OPEN;
            return (
              <Link key={r.id} href={`/auction/${r.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant={st.variant}>{st.label}</Badge>
                      <span className="text-sm text-muted">{r._count.bids}건 입찰</span>
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">{r.title}</h3>
                    <p className="text-sm text-muted">{r.category} · {r.region}</p>
                    {(r.budgetMin || r.budgetMax) && <p className="mt-1 text-sm font-medium text-primary">₩{r.budgetMin?.toLocaleString() || '?'} ~ ₩{r.budgetMax?.toLocaleString() || '?'}</p>}
                    {r.deadline && <p className="mt-1 text-xs text-muted">마감: {new Date(r.deadline).toLocaleDateString('ko-KR')}</p>}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
