import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: '📊' },
  { href: '/dashboard/cutting', label: '재단 계산기', icon: '📐' },
  { href: '/dashboard/estimates', label: '견적 관리', icon: '📋' },
  { href: '/dashboard/inventory', label: '재고 관리', icon: '📦' },
  { href: '/dashboard/projects', label: '프로젝트', icon: '🗂' },
  { href: '/dashboard/crm', label: 'CRM', icon: '👥' },
  { href: '/dashboard/finance', label: '매출 대시보드', icon: '💰' },
  { href: '/dashboard/messages', label: '메시지', icon: '💬' },
  { href: '/dashboard/settings/business', label: '사업자 정보', icon: '🏢' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 border-r border-border bg-white tablet:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/" className="text-xl font-bold text-primary">
            tilea
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-gray-50 hover:text-foreground"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-primary tablet:hidden">
              tilea
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{session.user.name || session.user.email}</span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/auth/login' });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-gray-50"
              >
                로그아웃
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
