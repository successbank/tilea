import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-primary">tilea</h1>
        <p className="mb-8 text-lg text-muted">목공·목재 산업 종합 플랫폼</p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:opacity-90"
          >
            로그인
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-primary px-6 py-3 text-primary transition-colors hover:bg-primary hover:text-white"
          >
            대시보드
          </Link>
        </div>
      </div>
    </main>
  );
}
