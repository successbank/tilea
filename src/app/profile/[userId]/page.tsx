export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Props {
  params: { userId: string };
}

export default async function PublicProfilePage({ params }: Props) {
  const profile = await prisma.businessProfile.findUnique({
    where: { userId: params.userId },
    include: { user: { select: { name: true, image: true } } },
  });

  if (!profile || profile.verificationStatus !== 'APPROVED') {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
              {(profile.shopName || profile.user.name || '?')[0]}
            </div>
            <div className="flex-1">
              <h1 className="mb-1 text-2xl font-bold text-foreground">
                {profile.shopName || profile.businessName}
              </h1>
              <p className="mb-3 text-sm text-muted">
                {profile.ownerName} · {profile.address || '지역 미설정'}
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.specialty.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
              {profile.averageRating > 0 && (
                <p className="mt-2 text-sm text-muted">
                  ⭐ {profile.averageRating.toFixed(1)} ({profile.reviewCount}개 리뷰)
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {profile.introduction && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>소개</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-foreground">{profile.introduction}</p>
          </CardContent>
        </Card>
      )}

      {profile.portfolioImages.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>포트폴리오</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
              {profile.portfolioImages.map((url, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg border border-border">
                  <img src={url} alt={`작품 ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(profile.phone || profile.website) && (
        <Card>
          <CardHeader>
            <CardTitle>연락처</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {profile.phone && (
                <div className="flex gap-4">
                  <dt className="w-20 text-muted">전화번호</dt>
                  <dd className="text-foreground">{profile.phone}</dd>
                </div>
              )}
              {profile.website && (
                <div className="flex gap-4">
                  <dt className="w-20 text-muted">웹사이트</dt>
                  <dd>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.website}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
