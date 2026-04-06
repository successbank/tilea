'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const TiptapEditor = dynamic(() => import('@/components/editor/tiptap-editor').then((m) => ({ default: m.TiptapEditor })), { ssr: false, loading: () => <div className="h-[250px] rounded-lg border border-border bg-gray-50" /> });

export default function WritePostPage() {
  const router = useRouter();
  const params = useParams();
  const board = params.board as string;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board, title, content, tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [], images: [] }),
    });

    setLoading(false);
    if (!res.ok) { const data = await res.json(); setError(data.error || '작성에 실패했습니다'); return; }
    const post = await res.json();
    router.push(`/community/${board}/${post.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader><CardTitle>글쓰기</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>제목</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" /></div>
          <div><Label>내용</Label><TiptapEditor content={content} onChange={setContent} /></div>
          <div><Label>태그</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="쉼표로 구분 (예: CNC, 원목가구, 재단)" /></div>
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>}
          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={loading || !title || !content} className="flex-1">{loading ? '작성 중...' : '게시하기'}</Button>
            <Button variant="outline" onClick={() => router.back()}>취소</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
