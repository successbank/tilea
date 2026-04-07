'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const BOARD_NAMES: Record<string, string> = {
  free: '자유게시판', tech: '기술/노하우', qna: '질문/답변',
  gallery: '작품갤러리', jobs: '구인/구직', promo: '업체홍보', notice: '공지사항',
};

interface PostItem {
  id: string;
  title: string;
  views: number;
  likes: number;
  tags: string[];
  createdAt: string;
  user: { name: string | null };
  _count?: { comments: number };
}

export default function BoardPage() {
  const params = useParams();
  const board = params.board as string;
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [sort, setSort] = useState('latest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts?board=${board}&sort=${sort}`)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []))
      .finally(() => setLoading(false));
  }, [board, sort]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{BOARD_NAMES[board] || board}</h1>
        <Link href={`/community/${board}/write`}>
          <Button>글쓰기</Button>
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        {['latest', 'popular'].map((s) => (
          <Button key={s} size="sm" variant={sort === s ? 'default' : 'outline'} onClick={() => setSort(s)}>
            {s === 'latest' ? '최신순' : '인기순'}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-muted">불러오는 중...</p>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="mb-4 text-muted">아직 게시글이 없습니다</p>
            <Link href={`/community/${board}/write`}>
              <Button>첫 글 작성하기</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/community/${board}/${post.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-sm">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-foreground">{post.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {post.user?.name || '익명'} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      {post.tags?.length > 0 && ` · ${post.tags.map((t) => `#${t}`).join(' ')}`}
                    </p>
                  </div>
                  <div className="flex gap-4 text-xs text-muted">
                    <span>👁 {post.views}</span>
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post._count?.comments || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
