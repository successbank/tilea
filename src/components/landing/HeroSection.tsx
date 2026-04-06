import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-20 desktop:py-32 max-w-[1200px] mx-auto">
      <div className="grid desktop:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/20 text-primary text-xs font-bold mb-6">
            목공 올인원 플랫폼
          </div>
          <h1 className="text-4xl desktop:text-6xl font-extrabold font-headline text-foreground tracking-tight leading-tight mb-6">
            나무를 다루는 사람들의
            <br />
            모든 업무, <span className="text-primary">하나로.</span>
          </h1>
          <p className="text-lg text-muted mb-10 max-w-lg leading-relaxed">
            복잡한 목재 계산부터 실시간 경매, 커뮤니티, 자재 마켓까지.
            목공 전문가와 입문자를 위한 가장 정밀한 디지털 워크숍, TILEA를 경험하세요.
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <Link
              href="/auth/register"
              className="bg-accent text-white px-8 py-4 rounded-lg font-bold shadow-lg transition-transform hover:-translate-y-1"
            >
              무료 시작
            </Link>
            <Link
              href="#features"
              className="bg-stone-100 border border-border text-foreground px-8 py-4 rounded-lg font-bold hover:bg-stone-200 transition-colors"
            >
              서비스 둘러보기
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBGEkESdbCPFlf6Eoc3Spc5nfbJ2BscpWwIGcxLaTHIqvcI87fnnCbO9Qoa_F086XKtkR23qjx0bt1v4-Qna2N7iSnbM4-NxCiMIVamCoDbrn5ah2p5is7QxyraQ07DEJUTccRJps8wed9PRM6h_Ug9LBF2cQyJ83br5dVu5v9EWOLfxfkGiJCwz9dC7reqotjymc70ceAovCBImJKBOdgy5LVXfRAzm7BqnWONiFuJoUh3ujlQgHYlR8gG3clRPIaFdm0DntAVGaG0',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBDGdvupn0Dm4i4_jwqCbyMiS2vGrSlbfAwH3gu04dwACUoIhgz1eLebB0OMIgj6RLxIB2UiVxzMuKT5I9wixtHbmbU6evKILNTJBzfrSr-PC8ehKt4MRIEQXfN9T1RgeBJ27xTk924BEA1kT37DbEhG_OUJwrc2DIuqtMFjqZurP2o-J45eFszftWQiaDgYOHgRdUwfL00D0KbqF57NYleY5BM9DXxz5e_nlb4dFBtgR6TnQ2e2_CCfw79sBrDVVxn5zOTQ6nYHxA0',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBhxQ5PbsvoATH2ResJKTV6zRH1fnAVIqc8VztpciaPqDIXRTZn_AZddKLKEYDIYVDFaaChzJWhpk6prNc9GdwgnLfMPiFqagM9UjF7Dz_bi_a-WBN08kc4IHIxz0d4aNy3Oj49OOfT5O1D9285JU86ml25r0Ehm5sV7HKh7lD2kL1cuhs6rnEhYgdMOrzGlv3suEBwubQnroMc3E4SXIsSsfPte_cQ1vIfqD4f06cFa0yC9p58HhXWeyWPkrNgduIluJUJgA1Ir-hq',
              ].map((src, i) => (
                <img
                  key={i}
                  alt={`사용자 ${i + 1}`}
                  className="w-10 h-10 rounded-full border-2 border-background object-cover"
                  src={src}
                />
              ))}
            </div>
            <p className="text-sm text-muted font-medium">
              <span className="text-primary font-bold">1,247명</span> 이상의 목공 마스터와 함께합니다
            </p>
          </div>
        </div>

        {/* Right: Cutting Demo Card */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl group-hover:bg-primary/20 transition-all" />
          <div className="relative bg-white border border-border/30 rounded-2xl shadow-2xl overflow-hidden p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-foreground">스마트 재단 최적화</h3>
                <p className="text-xs text-muted">원장: 2440 x 1220 mm (자작나무 합판)</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-accent">자투리 18%</span>
                <p className="text-[10px] text-muted uppercase tracking-widest font-bold">높은 효율성</p>
              </div>
            </div>
            <div className="aspect-video bg-stone-100 rounded-lg border border-border/20 p-4 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <rect fill="white" height="180" stroke="#d1c5b2" strokeWidth="1" width="380" x="10" y="10" />
                <rect fill="#8b6914" height="80" opacity="0.8" rx="2" width="100" x="10" y="10" />
                <rect fill="#2f7e33" height="120" opacity="0.8" rx="2" width="120" x="115" y="10" />
                <rect fill="#ecc165" height="95" opacity="0.8" rx="2" width="80" x="10" y="95" />
                <rect fill="#8b6914" height="40" opacity="0.6" rx="2" width="150" x="240" y="10" />
                <rect fill="#795900" height="75" opacity="0.7" rx="2" width="70" x="240" y="55" />
                <rect fill="#2f7e33" height="100" opacity="0.4" rx="2" width="75" x="315" y="55" />
                <path d="M10 10 L390 190" stroke="#f6f3f2" strokeDasharray="4" strokeWidth="0.5" />
              </svg>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { label: '재단수', value: '14 Pcs' },
                { label: '톱날', value: '3.2 mm' },
                { label: '잔여물', value: '0.82 m²' },
              ].map((stat) => (
                <div key={stat.label} className="bg-surface-alt p-3 rounded-lg">
                  <p className="text-[10px] text-muted font-bold uppercase mb-1">{stat.label}</p>
                  <p className="text-sm font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
