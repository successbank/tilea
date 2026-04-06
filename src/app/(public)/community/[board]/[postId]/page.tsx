import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  params: { board: string; postId: string };
}

export default async function PostDetailPage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    include: {
      user: { select: { name: true, image: true, points: true } },
      comments: {
        where: { parentId: null },
        include: {
          user: { select: { name: true } },
          replies: { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!post || post.status !== 'ACTIVE') notFound();

  // Increment views
  await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });

  const levelName = (points: number) => {
    if (points >= 5000) return '대목';
    if (points >= 2000) return '장인';
    if (points >= 500) return '숙련';
    if (points >= 100) return '견습';
    return '새싹';
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">#{tag}</Badge>
            ))}
          </div>
          <h1 className="mb-4 text-2xl font-bold text-foreground">{post.title}</h1>
          <div className="mb-6 flex items-center gap-3 text-sm text-muted">
            <span>{post.user.name || '익명'}</span>
            <Badge size-sm variant="default">{levelName(post.user.points)}</Badge>
            <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
            <span>조회 {post.views + 1}</span>
            <span>좋아요 {post.likes}</span>
          </div>
          <div className="prose max-w-none whitespace-pre-wrap text-foreground">
            {post.content}
          </div>
          {post.images.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {post.images.map((url, i) => (
                <img key={i} src={url} alt={`이미지 ${i + 1}`} className="rounded-lg" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            댓글 {post.comments.length}개
          </h2>
          {post.comments.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">아직 댓글이 없습니다</p>
          ) : (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id}>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground">{comment.user.name || '익명'}</span>
                      <span className="text-xs text-muted">
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>
                  {comment.replies.length > 0 && (
                    <div className="ml-6 mt-2 space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="rounded-lg border border-border p-3">
                          <div className="mb-1 flex items-center gap-2 text-sm">
                            <span className="font-medium text-foreground">{reply.user.name || '익명'}</span>
                            <span className="text-xs text-muted">
                              {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
