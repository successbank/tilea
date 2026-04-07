export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Estimate {
  id: string;
  estimateNo: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'outline' }> = {
  DRAFT: { label: '작성중', variant: 'outline' },
  SENT: { label: '발송', variant: 'default' },
  ACCEPTED: { label: '수락', variant: 'success' },
  CONTRACTED: { label: '계약', variant: 'success' },
  COMPLETED: { label: '완료', variant: 'success' },
  REJECTED: { label: '거절', variant: 'destructive' },
};

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async (searchTerm?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);

    const res = await fetch(`/api/estimates?${params}`);
    if (res.ok) {
      const data = await res.json();
      setEstimates(data.estimates);
    }
    setLoading(false);
  };

  const handleSearch = () => fetchEstimates(search);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">견적 관리</h1>
        <Link href="/dashboard/estimates/new">
          <Button>+ 새 견적서</Button>
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="고객명 또는 견적번호 검색"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={handleSearch}>
          검색
        </Button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-muted">불러오는 중...</p>
      ) : estimates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="mb-4 text-4xl">📋</p>
            <p className="mb-4 text-muted">아직 견적서가 없습니다</p>
            <Link href="/dashboard/estimates/new">
              <Button>첫 견적서 작성하기</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {estimates.map((est) => {
            const status = STATUS_MAP[est.status] || STATUS_MAP.DRAFT;
            return (
              <Link key={est.id} href={`/dashboard/estimates/${est.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between pt-6">
                    <div>
                      <p className="font-medium text-foreground">{est.customerName}</p>
                      <p className="text-sm text-muted">
                        {est.estimateNo} · {new Date(est.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-foreground">
                        ₩{est.totalAmount.toLocaleString()}
                      </p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
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
