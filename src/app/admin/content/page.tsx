import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AdminContentPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const [recentPosts, hiddenPosts] = await Promise.all([
    prisma.post.findMany({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { name: true, email: true } } } }),
    prisma.post.findMany({ where: { status: 'HIDDEN' }, orderBy: { updatedAt: 'desc' }, take: 10, include: { user: { select: { name: true } } } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">콘텐츠 관리</h1>
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>최근 게시글 ({recentPosts.length})</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">{recentPosts.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded border border-border p-2 text-sm">
              <div><p className="font-medium">{p.title}</p><p className="text-xs text-muted">{p.user?.name} · {p.board} · {new Date(p.createdAt).toLocaleDateString('ko-KR')}</p></div>
              <Badge variant="outline">{p.board}</Badge>
            </div>
          ))}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>숨김 게시글 ({hiddenPosts.length})</CardTitle></CardHeader>
          <CardContent>{hiddenPosts.length === 0 ? <p className="py-4 text-center text-sm text-muted">숨김 게시글 없음</p> : (
            <div className="space-y-2">{hiddenPosts.map((p) => (
              <div key={p.id} className="rounded border border-border p-2 text-sm"><p className="font-medium text-muted">{p.title}</p><p className="text-xs text-muted">{p.user?.name}</p></div>
            ))}</div>
          )}</CardContent>
        </Card>
      </div>
    </div>
  );
}
