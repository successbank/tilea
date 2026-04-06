import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-stone-50/80 backdrop-blur-md shadow-sm h-16">
      <nav className="flex justify-between items-center w-full px-6 max-w-[1200px] mx-auto h-full">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-extrabold text-primary tracking-tighter font-headline">
            TILEA
          </Link>
          <div className="hidden tablet:flex items-center gap-6">
            <Link href="/dashboard" className="text-primary border-b-2 border-primary pb-1 font-semibold text-sm">
              대시보드
            </Link>
            <Link href="/auction" className="text-stone-600 font-medium text-sm hover:text-primary transition-colors">
              역경매
            </Link>
            <Link href="/community" className="text-stone-600 font-medium text-sm hover:text-primary transition-colors">
              커뮤니티
            </Link>
            <Link href="/market" className="text-stone-600 font-medium text-sm hover:text-primary transition-colors">
              마켓
            </Link>
            <Link href="/learn" className="text-stone-600 font-medium text-sm hover:text-primary transition-colors">
              클래스
            </Link>
            <Link href="/news" className="text-stone-600 font-medium text-sm hover:text-primary transition-colors">
              뉴스
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-stone-600 font-medium text-sm px-4 py-2 hover:text-primary transition-colors">
            로그인
          </Link>
          <Link
            href="/auth/register"
            className="bg-accent text-white px-5 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all"
          >
            무료 시작
          </Link>
        </div>
      </nav>
    </header>
  );
}
