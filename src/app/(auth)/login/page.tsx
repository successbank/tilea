import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-primary">tilea</h1>
        <p className="text-muted">목공·목재 산업 종합 플랫폼</p>
      </div>

      <div className="space-y-3">
        {/* 소셜 로그인 버튼 플레이스홀더 (prd1에서 구현) */}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] px-4 py-3 font-medium text-[#191919]"
          disabled
        >
          카카오로 시작하기
        </button>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#03C75A] px-4 py-3 font-medium text-white"
          disabled
        >
          네이버로 시작하기
        </button>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-3 font-medium text-foreground"
          disabled
        >
          Google로 시작하기
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        prd1에서 인증 시스템 구현 예정
      </p>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-primary hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
