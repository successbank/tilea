import Link from 'next/link';

const navItems = [
  { href: '/community', label: '커뮤니티' },
  { href: '/news', label: '뉴스' },
  { href: '/trade', label: '중고거래' },
  { href: '/auction', label: '역경매' },
  { href: '/market', label: '마켓' },
  { href: '/learn', label: '클래스' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-primary">tilea</Link>
            <nav className="hidden gap-6 tablet:flex">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-muted hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-muted hover:text-foreground">로그인</Link>
            <Link href="/auth/register" className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:opacity-90">회원가입</Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
