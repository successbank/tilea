import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

const adminNav = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/users', label: '회원 관리', icon: '👥' },
  { href: '/admin/verifications', label: '사업자 인증', icon: '🏢' },
  { href: '/admin/content', label: '콘텐츠 관리', icon: '📝' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 border-r border-border bg-white">
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link href="/admin" className="text-lg font-bold text-primary">tilea 관리자</Link>
        </div>
        <nav className="space-y-1 p-3">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-gray-50 hover:text-foreground">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-gray-50">← 대시보드로</Link>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
