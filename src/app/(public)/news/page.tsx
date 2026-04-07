export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = ['전체', '업계뉴스', '정부지원사업', '전시/박람회', '장비리뷰', '기술칼럼', '법규/인증'];

interface Article { id: string; title: string; slug: string; excerpt: string | null; coverImage: string | null; category: string; publishedAt: string; author: { name: string | null }; views: number; }

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== '전체') params.set('category', category);
    fetch(`/api/articles?${params}`).then((r) => r.json()).then((d) => setArticles(d.articles || [])).finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-foreground">뉴스/정보</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Button key={c} size="sm" variant={category === c ? 'default' : 'outline'} onClick={() => setCategory(c)}>{c}</Button>
        ))}
      </div>
      {loading ? <p className="py-10 text-center text-muted">불러오는 중...</p> : articles.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted">아직 기사가 없습니다</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {articles.map((a) => (
            <Link key={a.id} href={`/news/${a.slug}`}>
              <Card className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md">
                {a.coverImage && <img src={a.coverImage} alt={a.title} className="h-40 w-full object-cover" />}
                <CardContent className="pt-4">
                  <Badge variant="outline" className="mb-2">{a.category}</Badge>
                  <h2 className="mb-1 font-semibold text-foreground line-clamp-2">{a.title}</h2>
                  {a.excerpt && <p className="mb-2 text-sm text-muted line-clamp-2">{a.excerpt}</p>}
                  <p className="text-xs text-muted">{a.author?.name} · {new Date(a.publishedAt).toLocaleDateString('ko-KR')} · 조회 {a.views}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
