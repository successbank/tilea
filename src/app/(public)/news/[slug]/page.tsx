import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Props { params: { slug: string } }

export default async function ArticlePage({ params }: Props) {
  const article = await prisma.article.findUnique({ where: { slug: params.slug }, include: { author: { select: { name: true } } } });
  if (!article || !article.isPublished) notFound();
  await prisma.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardContent className="pt-6">
          {article.coverImage && <img src={article.coverImage} alt={article.title} className="mb-6 w-full rounded-lg" />}
          <Badge variant="outline" className="mb-3">{article.category}</Badge>
          <h1 className="mb-4 text-3xl font-bold text-foreground">{article.title}</h1>
          <p className="mb-6 text-sm text-muted">{article.author?.name} · {article.publishedAt?.toLocaleDateString('ko-KR')} · 조회 {article.views + 1}</p>
          <div className="prose max-w-none whitespace-pre-wrap text-foreground">{article.content}</div>
          {article.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">{article.tags.map((t) => <Badge key={t} variant="outline">#{t}</Badge>)}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
