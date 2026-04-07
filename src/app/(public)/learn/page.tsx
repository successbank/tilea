'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = ['전체', '입문/기초', '가구제작', '기법/테크닉', '디지털목공', '사업운영', '인테리어목공'];

interface CourseItem { id: string; title: string; coverImage: string | null; category: string; price: number; salePrice: number | null; averageRating: number; enrollCount: number; level: string | null; }

export default function LearnPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [category, setCategory] = useState('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (category !== '전체') p.set('category', category);
    fetch(`/api/courses?${p}`).then((r) => r.json()).then((d) => setCourses(d.courses || [])).finally(() => setLoading(false));
  }, [category]);

  const levelLabel = (l: string | null) => ({ beginner: '입문', intermediate: '중급', advanced: '고급' }[l || ''] || '');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-foreground">온라인 클래스</h1>
      <div className="mb-6 flex flex-wrap gap-2">{CATEGORIES.map((c) => <Button key={c} size="sm" variant={category === c ? 'default' : 'outline'} onClick={() => setCategory(c)}>{c}</Button>)}</div>
      {loading ? <p className="py-10 text-center text-muted">불러오는 중...</p> : courses.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted">아직 강의가 없습니다</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.id} href={`/learn/${c.id}`}>
              <Card className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md">
                {c.coverImage && <img src={c.coverImage} alt={c.title} className="h-44 w-full object-cover" />}
                <CardContent className="pt-4">
                  <div className="mb-2 flex items-center gap-2"><Badge variant="outline">{c.category}</Badge>{c.level && <Badge variant="default">{levelLabel(c.level)}</Badge>}</div>
                  <h3 className="mb-2 font-semibold text-foreground line-clamp-2">{c.title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-primary">{c.price === 0 ? '무료' : `₩${(c.salePrice || c.price).toLocaleString()}`}</p>
                    <span className="text-xs text-muted">{c.averageRating > 0 && `⭐ ${c.averageRating.toFixed(1)} · `}{c.enrollCount}명 수강</span>
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
