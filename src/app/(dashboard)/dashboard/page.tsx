export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const [estimateCount, projectCount, inventoryCount, cuttingCount] = await Promise.all([
    prisma.estimate.count({ where: { userId: session.user.id } }),
    prisma.project.count({ where: { userId: session.user.id } }),
    prisma.inventory.count({ where: { userId: session.user.id } }),
    prisma.cuttingProject.count({ where: { userId: session.user.id } }),
  ]);

  const quickLinks = [
    { href: '/dashboard/cutting', label: '재단 계산기', icon: '📐', count: cuttingCount, desc: '프로젝트' },
    { href: '/dashboard/estimates', label: '견적 관리', icon: '📋', count: estimateCount, desc: '건' },
    { href: '/dashboard/inventory', label: '재고 관리', icon: '📦', count: inventoryCount, desc: '자재' },
    { href: '/dashboard/projects', label: '프로젝트', icon: '🗂', count: projectCount, desc: '건' },
    { href: '/dashboard/crm', label: 'CRM', icon: '👥', count: null, desc: '' },
    { href: '/dashboard/settings/business', label: '사업자 정보', icon: '🏢', count: null, desc: '' },
  ];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        안녕하세요, {session.user.name || '회원'}님
      </h1>
      <p className="mb-8 text-muted">tilea 대시보드에 오신 것을 환영합니다.</p>

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
        {quickLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <span className="mb-2 block text-3xl">{item.icon}</span>
                <h3 className="mb-1 text-lg font-semibold text-foreground">{item.label}</h3>
                {item.count !== null ? (
                  <p className="text-2xl font-bold text-primary">{item.count}<span className="ml-1 text-sm font-normal text-muted">{item.desc}</span></p>
                ) : (
                  <p className="text-sm text-muted">관리하기</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
