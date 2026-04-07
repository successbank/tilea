'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const STATUS_MAP: Record<string, string> = { RECEIVED: '접수', ESTIMATING: '견적', CONTRACTED: '계약', PRODUCING: '제작', DELIVERING: '납품', COMPLETED: '완료' };

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [logContent, setLogContent] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProject = () => fetch(`/api/projects/${id}`).then((r) => r.json()).then(setProject).finally(() => setLoading(false));
  useEffect(() => { fetchProject(); }, [id]);

  const addLog = async () => {
    if (!logContent.trim()) return;
    await fetch(`/api/projects/${id}/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: logContent }) });
    setLogContent('');
    fetchProject();
  };

  if (loading) return <p className="py-10 text-center text-muted">불러오는 중...</p>;
  if (!project) return <p className="py-10 text-center text-muted">프로젝트를 찾을 수 없습니다</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
        <Badge>{STATUS_MAP[project.status] || project.status}</Badge>
      </div>
      <Card className="mb-6">
        <CardContent className="grid grid-cols-2 gap-4 pt-6 text-sm">
          <div><span className="text-muted">고객</span><p className="font-medium">{project.customerName}</p></div>
          {project.deadline && <div><span className="text-muted">마감일</span><p className="font-medium">{new Date(project.deadline).toLocaleDateString('ko-KR')}</p></div>}
          {project.budget && <div><span className="text-muted">예산</span><p className="font-medium">₩{project.budget.toLocaleString()}</p></div>}
          {project.contractAmount && <div><span className="text-muted">계약금액</span><p className="font-medium">₩{project.contractAmount.toLocaleString()}</p></div>}
          {project.shareToken && <div className="col-span-2"><span className="text-muted">공유 링크</span><p className="text-xs break-all text-primary">/project/share/{project.shareToken}</p></div>}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>작업 일지 추가</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={logContent} onChange={(e) => setLogContent(e.target.value)} placeholder="오늘 작업 내용을 기록하세요" rows={3} />
          <Button onClick={addLog} className="mt-2" size="sm">일지 추가</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>작업 이력 ({project.logs?.length || 0}건)</CardTitle></CardHeader>
        <CardContent>
          {(!project.logs || project.logs.length === 0) ? <p className="py-4 text-center text-sm text-muted">아직 작업 일지가 없습니다</p> : (
            <div className="space-y-4">{project.logs.map((log: any) => (
              <div key={log.id} className="border-l-2 border-primary pl-4">
                <p className="text-xs text-muted">{new Date(log.date).toLocaleDateString('ko-KR')} {log.hoursWorked && `· ${log.hoursWorked}시간`}</p>
                <p className="mt-1 text-sm">{log.content}</p>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
