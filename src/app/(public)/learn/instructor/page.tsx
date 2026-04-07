'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CourseItem { id: string; title: string; price: number; enrollCount: number; averageRating: number; isPublished: boolean; sections: { _count: { lessons: number } }[]; _count: { enrollments: number; reviews: number }; }

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [revenue, setRevenue] = useState<{ totalRevenue: number; instructorShare: number; tax: number; netAmount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/instructor/courses').then((r) => r.json()),
      fetch('/api/instructor/revenue').then((r) => r.json()),
    ]).then(([c, r]) => { setCourses(Array.isArray(c) ? c : []); setRevenue(r); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8"><p className="text-center text-muted">불러오는 중...</p></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">강사 대시보드</h1>
        <Button>+ 새 강의</Button>
      </div>

      {revenue && (
        <div className="mb-6 grid grid-cols-2 gap-4 tablet:grid-cols-4">
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-primary">₩{revenue.totalRevenue.toLocaleString()}</p><p className="text-xs text-muted">총 매출</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-green-600">₩{revenue.instructorShare.toLocaleString()}</p><p className="text-xs text-muted">강사 수익 (70%)</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-red-500">₩{revenue.tax.toLocaleString()}</p><p className="text-xs text-muted">원천징수 (3.3%)</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-foreground">₩{revenue.netAmount.toLocaleString()}</p><p className="text-xs text-muted">정산 금액</p></CardContent></Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>내 강의 ({courses.length})</CardTitle></CardHeader>
        <CardContent>
          {courses.length === 0 ? <p className="py-8 text-center text-muted">아직 등록한 강의가 없습니다</p> : (
            <div className="space-y-3">{courses.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium text-foreground">{c.title}</p>
                  <p className="text-sm text-muted">{c._count.enrollments}명 수강 · ⭐ {c.averageRating.toFixed(1)} · {c._count.reviews}개 리뷰</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-primary">{c.price === 0 ? '무료' : `₩${c.price.toLocaleString()}`}</p>
                  <Badge variant={c.isPublished ? 'success' : 'outline'}>{c.isPublished ? '공개' : '비공개'}</Badge>
                </div>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
