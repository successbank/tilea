import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* 상단 네비게이션 */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            tilea
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted">
            <span>대시보드 (prd1 인증 후 활성화)</span>
          </nav>
        </div>
      </header>
      {/* 본문 */}
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
