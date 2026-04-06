'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { businessProfileSchema, type BusinessProfileInput } from '@/lib/validations/business';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const SPECIALTIES = [
  '가구제작', '인테리어', 'CNC가공', '목재유통', '조각', '칠공예',
  '건축목공', '리모델링', '목재건조', '합판가공', '원목가공', '기타',
];

interface Props {
  defaultValues?: Partial<BusinessProfileInput & { portfolioImages: string[] }>;
}

export function BusinessProfileForm({ defaultValues }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<string[]>(
    defaultValues?.portfolioImages || []
  );
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      shopName: defaultValues?.shopName || '',
      introduction: defaultValues?.introduction || '',
      specialty: defaultValues?.specialty || [],
      address: defaultValues?.address || '',
      addressDetail: defaultValues?.addressDetail || '',
      phone: defaultValues?.phone || '',
      website: defaultValues?.website || '',
    },
  });

  const selectedSpecialties = watch('specialty') || [];

  const toggleSpecialty = (s: string) => {
    const current = selectedSpecialties;
    const next = current.includes(s)
      ? current.filter((x) => x !== s)
      : [...current, s];
    setValue('specialty', next, { shouldValidate: true });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/business/profile/portfolio', {
      method: 'POST',
      body: formData,
    });

    setUploading(false);

    if (res.ok) {
      const { url } = await res.json();
      setPortfolioImages((prev) => [...prev, url]);
    }
  };

  const onSubmit = async (data: BusinessProfileInput) => {
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/business/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setIsLoading(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || '저장에 실패했습니다');
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="shopName">
          공방/가게명 <span className="text-destructive">*</span>
        </Label>
        <Input id="shopName" {...register('shopName')} placeholder="공방 또는 가게 이름" />
        {errors.shopName && (
          <p className="mt-1 text-sm text-destructive">{errors.shopName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="introduction">소개글</Label>
        <Textarea
          id="introduction"
          {...register('introduction')}
          placeholder="공방이나 사업에 대해 소개해주세요 (최대 1000자)"
          rows={4}
        />
      </div>

      <div>
        <Label>
          전문분야 <span className="text-destructive">*</span>
        </Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpecialty(s)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                selectedSpecialties.includes(s)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted hover:border-primary/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {errors.specialty && (
          <p className="mt-1 text-sm text-destructive">{errors.specialty.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <div>
          <Label htmlFor="address">주소</Label>
          <Input id="address" {...register('address')} placeholder="시/군/구" />
        </div>
        <div>
          <Label htmlFor="addressDetail">상세주소</Label>
          <Input id="addressDetail" {...register('addressDetail')} placeholder="상세주소" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <div>
          <Label htmlFor="phone">전화번호</Label>
          <Input id="phone" type="tel" {...register('phone')} placeholder="01012345678" />
          {errors.phone && (
            <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="website">웹사이트</Label>
          <Input id="website" {...register('website')} placeholder="https://" />
          {errors.website && (
            <p className="mt-1 text-sm text-destructive">{errors.website.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label>포트폴리오 이미지</Label>
        <div className="mt-2 flex flex-wrap gap-3">
          {portfolioImages.map((url, i) => (
            <div key={i} className="h-24 w-24 overflow-hidden rounded-lg border border-border">
              <img src={url} alt={`포트폴리오 ${i + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
          {portfolioImages.length < 10 && (
            <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border text-muted hover:border-primary/50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading ? '...' : '+'}
            </label>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">최대 10장, 5MB 이하 (JPG, PNG, WebP)</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">저장되었습니다!</div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? '저장 중...' : '프로필 저장'}
      </Button>
    </form>
  );
}
