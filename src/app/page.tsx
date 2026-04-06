import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-6 text-5xl font-bold text-primary">
          목공·목재 산업의
          <br />
          <span className="text-accent">디지털 전환</span>
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted">
          재단 계산, 견적 관리, 재고 관리, 프로젝트 관리, 커뮤니티, 마켓플레이스까지.
          목공·목재 산업을 위한 올인원 SaaS 플랫폼.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:opacity-90"
          >
            시작하기
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-border px-8 py-3 font-medium text-foreground transition-colors hover:bg-gray-50"
          >
            대시보드
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white px-4 py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 tablet:grid-cols-2 desktop:grid-cols-3">
          {[
            { title: '재단 계산기', desc: '2D 최적 배치로 자재 낭비를 최소화' },
            { title: '견적 관리', desc: '전문 견적서를 빠르게 작성하고 전송' },
            { title: '재고 관리', desc: 'QR 스캔으로 실시간 재고 파악' },
            { title: '프로젝트 관리', desc: '칸반보드로 작업 진행 상황 추적' },
            { title: '커뮤니티', desc: '목공인들의 기술 공유와 소통' },
            { title: '마켓플레이스', desc: '장비·자재 거래의 새로운 채널' },
          ].map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border p-6">
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
