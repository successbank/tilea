export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Props { params: { id: string } }

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { category: true, seller: { select: { name: true, businessProfile: { select: { shopName: true, averageRating: true } } } }, reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 5 } } });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2">
        <div>{product.images.length > 0 ? (
          <div className="space-y-2">{product.images.map((url, i) => <img key={i} src={url} alt={`${product.title} ${i + 1}`} className="w-full rounded-lg" />)}</div>
        ) : <div className="flex h-80 items-center justify-center rounded-lg bg-gray-100 text-muted">이미지 없음</div>}</div>
        <div>
          <Badge variant="outline" className="mb-2">{product.category?.name}</Badge>
          <h1 className="mb-2 text-2xl font-bold text-foreground">{product.title}</h1>
          <div className="mb-4 flex items-center gap-2 text-sm text-muted">{product.averageRating > 0 && <span>⭐ {product.averageRating.toFixed(1)} ({product.reviewCount})</span>}<span>{product.salesCount}건 판매</span></div>
          {product.salePrice ? (
            <div className="mb-4"><span className="text-lg text-muted line-through">₩{product.price.toLocaleString()}</span> <span className="text-3xl font-bold text-primary">₩{product.salePrice.toLocaleString()}</span></div>
          ) : <p className="mb-4 text-3xl font-bold text-primary">₩{product.price.toLocaleString()}</p>}
          <p className="mb-4 text-sm text-muted">재고: {product.stock}개 {product.brand && `· 브랜드: ${product.brand}`}</p>
          <p className="text-sm text-muted">판매자: {product.seller?.businessProfile?.shopName || product.seller?.name}</p>
        </div>
      </div>
      <Card className="mt-8"><CardHeader><CardTitle>상품 설명</CardTitle></CardHeader><CardContent><div className="whitespace-pre-wrap text-foreground">{product.description}</div></CardContent></Card>
      {product.reviews.length > 0 && (
        <Card className="mt-6"><CardHeader><CardTitle>리뷰 ({product.reviewCount})</CardTitle></CardHeader><CardContent><div className="space-y-3">{product.reviews.map((r) => (
          <div key={r.id} className="border-b border-border pb-3"><div className="mb-1 flex items-center gap-2 text-sm"><span className="font-medium">{r.user?.name}</span><span className="text-muted">⭐ {r.rating}</span><span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString('ko-KR')}</span></div>{r.content && <p className="text-sm text-foreground">{r.content}</p>}</div>
        ))}</div></CardContent></Card>
      )}
    </div>
  );
}
