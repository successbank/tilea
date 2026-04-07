'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'outline' }> = {
  RECEIVED: { label: '접수', variant: 'outline' }, ESTIMATING: { label: '견적', variant: 'default' },
  CONTRACTED: { label: '계약', variant: 'default' }, PRODUCING: { label: '제작', variant: 'warning' },
  DELIVERING: { label: '납품', variant: 'warning' }, COMPLETED: { label: '완료', variant: 'success' },
  CANCELLED: { label: '취소', variant: 'destructive' },
};

const FILTERS = ['전체', 'RECEIVED', 'ESTIMATING', 'CONTRACTED', 'PRODUCING', 'DELIVERING', 'COMPLETED'];

interface ProjectItem { id: string; name: string; customerName: string; status: string; deadline: string | null; _count: { logs: number }; }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [filter, setFilter] = useState('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filter !== '전체') p.set('status', filter);
    fetch(`/api/projects?${p}`).then((r) => r.json()).then((d) => setProjects(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">프로젝트</h1>
        <Button>+ 새 프로젝트</Button>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const label = f === '전체' ? '전체' : STATUS_MAP[f]?.label || f;
          return <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>{label}</Button>;
        })}
      </div>
      {loading ? <p className="py-10 text-center text-muted">불러오는 중...</p> : projects.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted">아직 프로젝트가 없습니다</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {projects.map((proj) => {
            const st = STATUS_MAP[proj.status] || STATUS_MAP.RECEIVED;
            return (
              <Card key={proj.id} className="cursor-pointer transition-shadow hover:shadow-sm">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-foreground">{proj.name}</p>
                    <p className="text-sm text-muted">{proj.customerName} · 일지 {proj._count.logs}건 {proj.deadline && `· 마감 ${new Date(proj.deadline).toLocaleDateString('ko-KR')}`}</p>
                  </div>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
