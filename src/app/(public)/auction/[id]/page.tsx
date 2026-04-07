export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Props { params: { id: string } }

export default async function AuctionDetailPage({ params }: Props) {
  const req = await prisma.auctionRequest.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true } }, bids: { include: { bidder: { select: { name: true, businessProfile: { select: { shopName: true, averageRating: true, reviewCount: true } } } } }, orderBy: { price: 'asc' } } },
  });
  if (!req) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge>{req.category}</Badge>
            <span className="text-sm text-muted">{req.region} {req.district || ''}</span>
          </div>
          <h1 className="mb-4 text-2xl font-bold text-foreground">{req.title}</h1>
          <div className="mb-4 whitespace-pre-wrap text-foreground">{req.description}</div>
          {req.images.length > 0 && <div className="mb-4 grid grid-cols-3 gap-2">{req.images.map((url, i) => <img key={i} src={url} className="rounded-lg" />)}</div>}
          <div className="grid grid-cols-2 gap-4 text-sm tablet:grid-cols-4">
            <div><span className="text-muted">예산</span><p className="font-medium">₩{req.budgetMin?.toLocaleString() || '?'} ~ ₩{req.budgetMax?.toLocaleString() || '?'}</p></div>
            {req.deadline && <div><span className="text-muted">마감일</span><p className="font-medium">{new Date(req.deadline).toLocaleDateString('ko-KR')}</p></div>}
            <div><span className="text-muted">의뢰인</span><p className="font-medium">{req.user?.name}</p></div>
            <div><span className="text-muted">입찰</span><p className="font-medium">{req.bids.length}건</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>입찰 현황 ({req.bids.length}건)</CardTitle></CardHeader>
        <CardContent>
          {req.bids.length === 0 ? <p className="py-4 text-center text-sm text-muted">아직 입찰이 없습니다</p> : (
            <div className="space-y-3">
              {req.bids.map((bid, i) => (
                <div key={bid.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">{bid.bidder?.businessProfile?.shopName || bid.bidder?.name || '익명'}</p>
                    <p className="text-sm text-muted">
                      {bid.bidder?.businessProfile?.averageRating ? `⭐ ${bid.bidder.businessProfile.averageRating.toFixed(1)}` : '신규'}
                      {bid.estimatedDays && ` · ${bid.estimatedDays}일 소요`}
                    </p>
                    {bid.message && <p className="mt-1 text-sm text-muted">{bid.message}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">₩{bid.price.toLocaleString()}</p>
                    {i === 0 && <Badge variant="success">최저가</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
