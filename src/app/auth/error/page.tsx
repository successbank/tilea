'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: '서버 설정 오류가 발생했습니다.',
    AccessDenied: '접근이 거부되었습니다.',
    Verification: '인증 토큰이 만료되었거나 이미 사용되었습니다.',
    Default: '인증 처리 중 오류가 발생했습니다.',
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-destructive">인증 오류</h2>
      <p className="mb-6 text-muted">
        {error ? errorMessages[error] || errorMessages.Default : errorMessages.Default}
      </p>
      <Link
        href="/auth/login"
        className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white"
      >
        로그인으로 돌아가기
      </Link>
    </div>
  );
}
