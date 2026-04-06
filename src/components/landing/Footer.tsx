import Link from 'next/link';

const footerLinks = {
  서비스: [
    { label: '대시보드 시스템', href: '/dashboard' },
    { label: '역경매 시스템', href: '/auction' },
    { label: '스마트 계산기', href: '/dashboard/cutting' },
    { label: '마켓플레이스', href: '/market' },
  ],
  커뮤니티: [
    { label: '사용자 포럼', href: '/community' },
    { label: '온라인 클래스', href: '/learn' },
    { label: '업계 뉴스', href: '/news' },
    { label: '목재 라이브러리', href: '/community' },
  ],
  고객지원: [
    { label: '고객센터', href: '#' },
    { label: '개인정보처리방침', href: '#' },
    { label: '이용약관', href: '#' },
    { label: '문의하기', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300 py-20 px-6 border-t border-stone-800">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 tablet:grid-cols-4 gap-12">
        <div className="col-span-2 tablet:col-span-1">
          <span className="text-2xl font-black font-headline text-white tracking-tighter mb-6 block">TILEA</span>
          <p className="text-sm text-stone-500 leading-relaxed mb-6">
            나무의 가치를 기술로 더합니다.
            <br />
            (주)타일레아 우드워킹 솔루션
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-stone-400 hover:text-white cursor-pointer transition-colors">public</span>
            <span className="material-symbols-outlined text-stone-400 hover:text-white cursor-pointer transition-colors">alternate_email</span>
            <span className="material-symbols-outlined text-stone-400 hover:text-white cursor-pointer transition-colors">podcasts</span>
          </div>
        </div>
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category}>
            <h4 className="text-white font-bold mb-6 text-sm">{category}</h4>
            <ul className="space-y-4 text-sm text-stone-500">
              {links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-secondary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1200px] mx-auto mt-20 pt-8 border-t border-stone-900 flex flex-col tablet:flex-row justify-between items-center gap-6">
        <p className="text-xs text-stone-600 font-medium tracking-tight">
          &copy; 2024 TILEA Woodworking. All rights reserved.{' '}
          <span className="ml-4 text-accent">시스템 정상 작동 중.</span>
        </p>
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-stone-600">
          <span>Seoul, Korea</span>
          <span>Version 2.4.0</span>
        </div>
      </div>
    </footer>
  );
}
