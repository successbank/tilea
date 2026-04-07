export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_STEPS = ['RECEIVED', 'ESTIMATING', 'CONTRACTED', 'PRODUCING', 'DELIVERING', 'COMPLETED'];
const STATUS_LABELS: Record<string, string> = { RECEIVED: '접수', ESTIMATING: '견적', CONTRACTED: '계약', PRODUCING: '제작', DELIVERING: '납품', COMPLETED: '완료' };

interface Props { params: { token: string } }

export default async function ProjectSharePage({ params }: Props) {
  const project = await prisma.project.findUnique({ where: { shareToken: params.token }, include: { logs: { orderBy: { date: 'desc' } } } });
  if (!project) notFound();

  const currentStep = STATUS_STEPS.indexOf(project.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-2 text-center text-sm text-muted">프로젝트 진행 현황</div>
      <h1 className="mb-8 text-center text-2xl font-bold text-foreground">{project.name}</h1>

      {/* Progress bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-muted'}`}>{i + 1}</div>
                <span className={`mt-1 text-xs ${i <= currentStep ? 'font-medium text-foreground' : 'text-muted'}`}>{STATUS_LABELS[step]}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 h-1 rounded bg-gray-200"><div className="h-1 rounded bg-primary transition-all" style={{ width: `${((currentStep + 1) / STATUS_STEPS.length) * 100}%` }} /></div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="mb-6">
        <CardContent className="grid grid-cols-2 gap-4 pt-6 text-sm">
          <div><span className="text-muted">고객</span><p className="font-medium">{project.customerName}</p></div>
          {project.deadline && <div><span className="text-muted">마감일</span><p className="font-medium">{new Date(project.deadline).toLocaleDateString('ko-KR')}</p></div>}
          {project.contractAmount && <div><span className="text-muted">계약금액</span><p className="font-medium">₩{project.contractAmount.toLocaleString()}</p></div>}
        </CardContent>
      </Card>

      {/* Work logs */}
      <Card>
        <CardHeader><CardTitle>작업 일지</CardTitle></CardHeader>
        <CardContent>
          {project.logs.length === 0 ? <p className="py-4 text-center text-sm text-muted">아직 작업 일지가 없습니다</p> : (
            <div className="space-y-4">
              {project.logs.map((log) => (
                <div key={log.id} className="border-l-2 border-primary pl-4">
                  <p className="text-xs text-muted">{new Date(log.date).toLocaleDateString('ko-KR')} {log.hoursWorked && `· ${log.hoursWorked}시간`}</p>
                  <p className="mt-1 text-sm text-foreground">{log.content}</p>
                  {log.images.length > 0 && <div className="mt-2 flex gap-2">{log.images.map((url, i) => <img key={i} src={url} className="h-20 w-20 rounded object-cover" />)}</div>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-xs text-muted">이 페이지는 tilea.kr에서 제공하는 프로젝트 공유 링크입니다.</p>
    </div>
  );
}
