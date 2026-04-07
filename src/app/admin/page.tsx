export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const [userCount, businessCount, postCount, estimateCount, auctionCount, articleCount] = await Promise.all([
    prisma.user.count(),
    prisma.businessProfile.count({ where: { verificationStatus: 'APPROVED' } }),
    prisma.post.count({ where: { status: 'ACTIVE' } }),
    prisma.estimate.count(),
    prisma.auctionRequest.count(),
    prisma.article.count(),
  ]);

  const pendingVerifications = await prisma.businessProfile.count({ where: { verificationStatus: 'PENDING' } });

  const stats = [
    { label: '전체 회원', value: userCount, icon: '👥' },
    { label: '사업자 회원', value: businessCount, icon: '🏢' },
    { label: '인증 대기', value: pendingVerifications, icon: '⏳' },
    { label: '게시글', value: postCount, icon: '📝' },
    { label: '견적서', value: estimateCount, icon: '📋' },
    { label: '역경매', value: auctionCount, icon: '🔨' },
    { label: '뉴스 기사', value: articleCount, icon: '📰' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">관리자 대시보드</h1>
      <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 text-center">
              <span className="mb-2 block text-2xl">{s.icon}</span>
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>사업자 인증 대기 ({pendingVerifications}건)</CardTitle></CardHeader>
          <CardContent>
            {pendingVerifications === 0 ? <p className="text-sm text-muted">대기 중인 인증이 없습니다</p> : <p className="text-sm text-muted">관리자 승인 API: PUT /api/admin/business/approve</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>시스템 정보</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted">서버: 단독 우분투 서버</p>
            <p className="text-muted">배포: Coolify + Docker</p>
            <p className="text-muted">DB: PostgreSQL 16</p>
            <p className="text-muted">캐시: Redis 7</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
