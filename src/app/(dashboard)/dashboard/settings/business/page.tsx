import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BusinessProfileForm } from '@/components/business/business-profile-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function BusinessSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-foreground">사업자 정보</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-muted">아직 사업자 인증을 하지 않았습니다.</p>
            <Link
              href="/auth/verify-business"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-white hover:opacity-90"
            >
              사업자 인증하기
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusMap = {
    PENDING: { label: '심사 대기', variant: 'warning' as const },
    APPROVED: { label: '승인됨', variant: 'success' as const },
    REJECTED: { label: '거절됨', variant: 'destructive' as const },
  };

  const status = statusMap[profile.verificationStatus];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">사업자 정보</h1>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>사업자 등록 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted">사업자등록번호</dt>
              <dd className="font-medium text-foreground">{profile.businessNumber}</dd>
            </div>
            <div>
              <dt className="text-muted">상호명</dt>
              <dd className="font-medium text-foreground">{profile.businessName}</dd>
            </div>
            <div>
              <dt className="text-muted">대표자</dt>
              <dd className="font-medium text-foreground">{profile.ownerName}</dd>
            </div>
            {profile.businessType && (
              <div>
                <dt className="text-muted">업종</dt>
                <dd className="font-medium text-foreground">{profile.businessType}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {profile.verificationStatus === 'APPROVED' && (
        <Card>
          <CardHeader>
            <CardTitle>공개 프로필 편집</CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessProfileForm
              defaultValues={{
                shopName: profile.shopName || '',
                introduction: profile.introduction || '',
                specialty: profile.specialty,
                address: profile.address || '',
                addressDetail: profile.addressDetail || '',
                phone: profile.phone || '',
                website: profile.website || '',
                portfolioImages: profile.portfolioImages,
              }}
            />
          </CardContent>
        </Card>
      )}

      {profile.verificationStatus === 'PENDING' && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted">
              관리자가 사업자 정보를 검토 중입니다. 승인 후 프로필을 편집할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      )}

      {profile.verificationStatus === 'REJECTED' && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="mb-4 text-destructive">사업자 인증이 거절되었습니다.</p>
            <Link
              href="/auth/verify-business"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-white hover:opacity-90"
            >
              다시 인증하기
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
