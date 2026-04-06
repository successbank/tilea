'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { onboardingSchema, type OnboardingInput } from '@/lib/validations/auth';

export function OnboardingForm() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: session?.user?.name || '',
      agreedMarketing: false,
    },
  });

  const onSubmit = async (data: OnboardingInput) => {
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || '정보 저장에 실패했습니다');
      setIsLoading(false);
      return;
    }

    await update({ onboardingCompleted: true });
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="ob-name" className="mb-1 block text-sm font-medium text-foreground">
          이름 <span className="text-destructive">*</span>
        </label>
        <input
          id="ob-name"
          type="text"
          {...register('name')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="이름을 입력하세요"
        />
        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="ob-phone" className="mb-1 block text-sm font-medium text-foreground">
          전화번호
        </label>
        <input
          id="ob-phone"
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
        {isLoading ? '저장 중...' : '시작하기'}
      </button>
    </form>
  );
}
