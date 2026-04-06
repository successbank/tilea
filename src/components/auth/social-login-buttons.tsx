'use client';

import { signIn } from 'next-auth/react';

export function SocialLoginButtons() {
  return (
    <div className="space-y-3">
      <button
        onClick={() => signIn('kakao', { callbackUrl: '/dashboard' })}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] px-4 py-3 font-medium text-[#191919] transition-opacity hover:opacity-90"
      >
        카카오로 시작하기
      </button>
      <button
        onClick={() => signIn('naver', { callbackUrl: '/dashboard' })}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#03C75A] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
      >
        네이버로 시작하기
      </button>
      <button
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-3 font-medium text-foreground transition-opacity hover:opacity-90"
      >
        Google로 시작하기
      </button>
    </div>
  );
}
