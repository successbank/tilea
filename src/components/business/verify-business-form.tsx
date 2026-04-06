'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { businessVerifySchema, type BusinessVerifyInput } from '@/lib/validations/business';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function VerifyBusinessForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessVerifyInput>({
    resolver: zodResolver(businessVerifySchema),
  });

  const onSubmit = async (data: BusinessVerifyInput) => {
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/business/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setIsLoading(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || '인증에 실패했습니다');
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl">✅</div>
        <h2 className="mb-2 text-xl font-bold text-foreground">인증 신청 완료</h2>
        <p className="mb-6 text-muted">
          사업자등록번호가 확인되었습니다.
          <br />
          관리자 승인 후 사업자 회원으로 전환됩니다.
        </p>
        <Button onClick={() => router.push('/dashboard')}>대시보드로 이동</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="businessNumber">
          사업자등록번호 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="businessNumber"
          {...register('businessNumber')}
          placeholder="하이픈(-) 없이 10자리 입력"
          maxLength={10}
        />
        {errors.businessNumber && (
          <p className="mt-1 text-sm text-destructive">{errors.businessNumber.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="businessName">
          상호명 <span className="text-destructive">*</span>
        </Label>
        <Input id="businessName" {...register('businessName')} placeholder="사업자등록증상 상호명" />
        {errors.businessName && (
          <p className="mt-1 text-sm text-destructive">{errors.businessName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="ownerName">
          대표자명 <span className="text-destructive">*</span>
        </Label>
        <Input id="ownerName" {...register('ownerName')} placeholder="대표자 성명" />
        {errors.ownerName && (
          <p className="mt-1 text-sm text-destructive">{errors.ownerName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="businessType">업종 (선택)</Label>
        <Input id="businessType" {...register('businessType')} placeholder="예: 목공, 인테리어" />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? '확인 중...' : '사업자 인증 신청'}
      </Button>
    </form>
  );
}
