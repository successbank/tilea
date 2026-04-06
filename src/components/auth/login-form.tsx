'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);
    setShowResend(false);
    setResendSent(false);

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      if (result.error.includes('ACCOUNT_LOCKED')) {
        setError('로그인 시도가 5회 초과되었습니다. 30분 후 다시 시도해주세요.');
      } else if (result.error.includes('EMAIL_NOT_VERIFIED')) {
        setError('이메일 인증을 완료해주세요.');
        setShowResend(true);
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  const handleResend = async () => {
    setResendLoading(true);
    const email = getValues('email');

    await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setResendLoading(false);
    setResendSent(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
          이메일
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="이메일을 입력하세요"
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="비밀번호를 입력하세요"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">
          <p>{error}</p>
          {showResend && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || resendSent}
              className="mt-2 font-medium text-primary underline hover:opacity-80 disabled:opacity-50"
            >
              {resendSent
                ? '인증 메일이 발송되었습니다'
                : resendLoading
                  ? '발송 중...'
                  : '인증 메일 재��송'}
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
}
