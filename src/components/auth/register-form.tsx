'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';

export function RegisterForm() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreedMarketing: false },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setIsLoading(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || '회원가입에 실패했습니다');
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-xl font-bold text-foreground">인증 이메일을 확인하세요</h2>
        <p className="text-muted">
          입력하신 이메일로 인증 링크를 발송했습니다.
          <br />
          이메일을 확인하여 가입을 완료해주세요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
          이름 <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="이름을 입력하세요"
        />
        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-foreground">
          이메일 <span className="text-destructive">*</span>
        </label>
        <input
          id="reg-email"
          type="email"
          {...register('email')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="이메일을 입력하세요"
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-foreground">
          비밀번호 <span className="text-destructive">*</span>
        </label>
        <input
          id="reg-password"
          type="password"
          {...register('password')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="8자 이상, 영문+숫자+특수문자"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-foreground">
          비밀번호 확인 <span className="text-destructive">*</span>
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="비밀번호를 다시 입력하세요"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-foreground">
          전화번호
        </label>
        <input
          id="phone"
          type="tel"
          {...register('phone')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="01012345678 (선택)"
        />
        {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2 pt-2">
        <label className="flex items-start gap-2">
          <input type="checkbox" {...register('agreedTerms')} className="mt-1" />
          <span className="text-sm">
            <span className="text-destructive">[필수]</span> 이용약관에 동의합니다
          </span>
        </label>
        {errors.agreedTerms && (
          <p className="text-sm text-destructive">{errors.agreedTerms.message}</p>
        )}

        <label className="flex items-start gap-2">
          <input type="checkbox" {...register('agreedPrivacy')} className="mt-1" />
          <span className="text-sm">
            <span className="text-destructive">[필수]</span> 개인정보처리방침에 동의합니다
          </span>
        </label>
        {errors.agreedPrivacy && (
          <p className="text-sm text-destructive">{errors.agreedPrivacy.message}</p>
        )}

        <label className="flex items-start gap-2">
          <input type="checkbox" {...register('agreedMarketing')} className="mt-1" />
          <span className="text-sm">[선택] 마케팅 정보 수신에 동의합니다</span>
        </label>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? '가입 처리 중...' : '회원가입'}
      </button>
    </form>
  );
}
