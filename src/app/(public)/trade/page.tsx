export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';

const TRADE_TYPES = [{ value: '', label: '전체' }, { value: 'SELL', label: '판매' }, { value: 'BUY', label: '구매' }, { value: 'EXCHANGE', label: '교환' }, { value: 'FREE', label: '나눔' }];
const CATEGORIES = ['전체', '수공구', '전동공구', '목재', '합판', '하드웨어', '도료', '기타'];
const TYPE_LABELS: Record<string, string> = { SELL: '판매', BUY: '구매', EXCHANGE: '교환', FREE: '나눔' };

interface TradeItem { id: string; title: string; images: string[]; price: number | null; tradeType: string; region: string; status: string; createdAt: string; user: { name: string | null }; }

export default function TradePage() {
  const [posts, setPosts] = useState<TradeItem[]>([]);
  const [tradeType, setTradeType] = useState('');
  const [category, setCategory] = useState('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (tradeType) p.set('tradeType', tradeType);
    if (category !== '전체') p.set('category', category);
    fetch(`/api/trade?${p}`).then((r) => r.json()).then((d) => setPosts(d.posts || [])).finally(() => setLoading(false));
  }, [tradeType, category]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">중고거래</h1>
        <Link href="/trade/write"><Button>글쓰기</Button></Link>
      </div>
      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={tradeType} onChange={(e) => setTradeType(e.target.value)} className="w-32">
          {TRADE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <div className="flex gap-1">{CATEGORIES.map((c) => <Button key={c} size="sm" variant={category === c ? 'default' : 'outline'} onClick={() => setCategory(c)}>{c}</Button>)}</div>
      </div>
      {loading ? <p className="py-10 text-center text-muted">불러오는 중...</p> : posts.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted">아직 거래 게시글이 없습니다</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/trade/${p.id}`}>
              <Card className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md">
                {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="h-40 w-full object-cover" />}
                <CardContent className="pt-4">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge>{TYPE_LABELS[p.tradeType] || p.tradeType}</Badge>
                    <span className="text-xs text-muted">{p.region}</span>
                  </div>
                  <h3 className="mb-1 font-medium text-foreground">{p.title}</h3>
                  <p className="text-lg font-bold text-primary">{p.price ? `₩${p.price.toLocaleString()}` : '가격 협의'}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
