import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const TYPE_LABELS: Record<string, string> = { SELL: '판매', BUY: '구매', EXCHANGE: '교환', FREE: '나눔' };

interface Props { params: { id: string } }

export default async function TradeDetailPage({ params }: Props) {
  const post = await prisma.tradePost.findUnique({ where: { id: params.id }, include: { user: { select: { name: true, image: true } } } });
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {post.images.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3">{post.images.map((url, i) => <img key={i} src={url} alt={`사진 ${i + 1}`} className="rounded-lg" />)}</div>
      )}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge>{TYPE_LABELS[post.tradeType]}</Badge>
            <Badge variant="outline">{post.category}</Badge>
            <span className="text-sm text-muted">{post.region} {post.district || ''}</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">{post.title}</h1>
          <p className="mb-4 text-2xl font-bold text-primary">{post.price ? `₩${post.price.toLocaleString()}` : '가격 협의'}</p>
          <div className="mb-4 whitespace-pre-wrap text-foreground">{post.description}</div>
          <div className="border-t border-border pt-4 text-sm text-muted">
            <span>{post.user?.name || '익명'}</span> · <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
