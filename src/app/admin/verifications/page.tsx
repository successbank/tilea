export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AdminVerificationsPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const pending = await prisma.businessProfile.findMany({ where: { verificationStatus: 'PENDING' }, include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } });
  const recent = await prisma.businessProfile.findMany({ where: { verificationStatus: { not: 'PENDING' } }, orderBy: { updatedAt: 'desc' }, take: 10, include: { user: { select: { name: true } } } });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">사업자 인증 관리</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle>인증 대기 ({pending.length}건)</CardTitle></CardHeader>
        <CardContent>{pending.length === 0 ? <p className="py-4 text-center text-sm text-muted">대기 중인 인증 없음</p> : (
          <div className="space-y-3">{pending.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-foreground">{p.businessName} ({p.ownerName})</p>
                <p className="text-sm text-muted">{p.user?.name} · {p.user?.email} · {p.businessNumber}</p>
                <p className="text-xs text-muted">신청일: {new Date(p.createdAt).toLocaleDateString('ko-KR')}</p>
              </div>
              <div className="flex gap-2">
                <p className="text-xs text-muted">PUT /api/admin/business/approve<br/>body: {"{"} profileId: &quot;{p.id}&quot;, action: &quot;approve&quot; {"}"}</p>
              </div>
            </div>
          ))}</div>
        )}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>최근 처리 내역</CardTitle></CardHeader>
        <CardContent><div className="space-y-2">{recent.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded border border-border p-2 text-sm">
            <span>{p.businessName} ({p.user?.name})</span>
            <Badge variant={p.verificationStatus === 'APPROVED' ? 'success' : 'destructive'}>{p.verificationStatus === 'APPROVED' ? '승인' : '거절'}</Badge>
          </div>
        ))}</div></CardContent>
      </Card>
    </div>
  );
}
