'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface ProductItem { id: string; title: string; price: number; salePrice: number | null; images: string[]; averageRating: number; salesCount: number; category: { name: string }; }

export default function MarketPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ sort });
    if (search) p.set('search', search);
    fetch(`/api/products?${p}`).then((r) => r.json()).then((d) => setProducts(d.products || [])).finally(() => setLoading(false));
  }, [sort, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-foreground">마켓플레이스</h1>
      <div className="mb-6 flex flex-wrap gap-3">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="상품 검색" className="max-w-sm" onKeyDown={(e) => e.key === 'Enter' && setSort(sort)} />
        {['latest', 'popular', 'price_asc', 'price_desc', 'rating'].map((s) => (
          <Button key={s} size="sm" variant={sort === s ? 'default' : 'outline'} onClick={() => setSort(s)}>
            {{ latest: '최신', popular: '인기', price_asc: '가격↑', price_desc: '가격↓', rating: '평점' }[s]}
          </Button>
        ))}
      </div>
      {loading ? <p className="py-10 text-center text-muted">불러오는 중...</p> : products.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted">아직 상품이 없습니다</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-4">
          {products.map((p) => (
            <Link key={p.id} href={`/market/${p.id}`}>
              <Card className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md">
                {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="h-48 w-full object-cover" />}
                <CardContent className="pt-3">
                  <p className="mb-1 text-xs text-muted">{p.category?.name}</p>
                  <h3 className="mb-1 text-sm font-medium text-foreground line-clamp-2">{p.title}</h3>
                  {p.salePrice ? (
                    <div><span className="text-xs text-muted line-through">₩{p.price.toLocaleString()}</span> <span className="font-bold text-primary">₩{p.salePrice.toLocaleString()}</span></div>
                  ) : (
                    <p className="font-bold text-primary">₩{p.price.toLocaleString()}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                    {p.averageRating > 0 && <span>⭐ {p.averageRating.toFixed(1)}</span>}
                    {p.salesCount > 0 && <span>{p.salesCount}건 판매</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
