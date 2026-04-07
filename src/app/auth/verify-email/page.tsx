export const dynamic = 'force-dynamic';
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    missing_token: '인증 링크가 올바르지 않습니다.',
    invalid_token: '유효하지 않은 인증 링크입니다.',
    expired_token: '인증 링크가 만료되었습니다. 다시 회원가입해주세요.',
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
      {success ? (
        <>
          <h2 className="mb-4 text-xl font-bold text-success">이메일 인증 완료</h2>
          <p className="mb-6 text-muted">이메일 인증이 완료되었습니다. 로그인해주세요.</p>
          <Link
            href="/auth/login"
            className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white"
          >
            로그인
          </Link>
        </>
      ) : (
        <>
          <h2 className="mb-4 text-xl font-bold text-destructive">인증 실패</h2>
          <p className="mb-6 text-muted">
            {error ? errorMessages[error] || '알 수 없는 오류가 발생했습니다.' : '인증 처리 중...'}
          </p>
          <Link
            href="/auth/register"
            className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white"
          >
            다시 가입하기
          </Link>
        </>
      )}
    </div>
  );
}
