'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth';

export function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setIsLoading(false);

    if (!res.ok) {
      setError('요청 처리에 실패했습니다');
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-xl font-bold text-foreground">이메일을 확인하세요</h2>
        <p className="text-muted">
          비밀번호 재설정 링크를 발송했습니다.
          <br />
          이메일을 확인해주세요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="fp-email" className="mb-1 block text-sm font-medium text-foreground">
          이메일
        </label>
        <input
          id="fp-email"
          type="email"
          {...register('email')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="가입한 이메일을 입력하세요"
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? '처리 중...' : '비밀번호 재설정 링크 보내기'}
      </button>
    </form>
  );
}
