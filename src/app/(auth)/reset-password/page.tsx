'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token || '' },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setIsLoading(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || '비밀번호 재설정에 실패했습니다');
      return;
    }

    setSuccess(true);
  };

  if (!token) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <p className="text-destructive">유효하지 않은 링크입니다.</p>
        <Link href="/auth/login" className="mt-4 inline-block text-primary hover:underline">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-foreground">비밀번호가 변경되었습니다</h2>
        <p className="mb-4 text-muted">새 비밀번호로 로그인해주세요.</p>
        <Link
          href="/auth/login"
          className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white"
        >
          로그인
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-primary">비밀번호 재설정</h1>
        <p className="text-muted">새로운 비밀번호를 입력해주세요</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('token')} />

        <div>
          <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-foreground">
            새 비밀번호
          </label>
          <input
            id="newPassword"
            type="password"
            {...register('newPassword')}
            className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="8자 이상, 영문+숫자+특수문자"
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-destructive">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="rp-confirm" className="mb-1 block text-sm font-medium text-foreground">
            비밀번호 확인
          </label>
          <input
            id="rp-confirm"
            type="password"
            {...register('confirmPassword')}
            className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="비밀번호를 다시 입력하세요"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? '처리 중...' : '비밀번호 변경'}
        </button>
      </form>
    </div>
  );
}
