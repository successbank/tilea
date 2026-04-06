import Link from 'next/link';

export default function CtaSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-[1000px] mx-auto bg-accent rounded-[2rem] p-12 desktop:p-20 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-4xl desktop:text-5xl font-black font-headline text-white mb-8 leading-tight">
            지금 시작하세요. 무료입니다.
            <br />
            <span className="text-white/80">당신의 목공 워크숍을 디지털로 업그레이드하세요.</span>
          </h2>
          <Link
            href="/auth/register"
            className="inline-block bg-white text-accent px-12 py-5 rounded-xl font-black text-lg shadow-xl hover:scale-105 transition-transform"
          >
            지금 시작하기
          </Link>
          <p className="text-white/60 text-xs mt-8">신용카드 필요 없음. 언제든 취소 가능.</p>
        </div>
      </div>
    </section>
  );
}
