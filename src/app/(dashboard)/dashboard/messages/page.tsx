export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Conversation { id: string; content: string; createdAt: string; sender: { id: string; name: string | null; image: string | null }; receiver: { id: string; name: string | null; image: string | null }; isRead: boolean; }

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/messages/conversations').then((r) => r.json()).then(setConversations).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">메시지</h1>
      <Card>
        <CardHeader><CardTitle>대화 목록</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-muted">불러오는 중...</p> : conversations.length === 0 ? (
            <p className="py-8 text-center text-muted">아직 대화가 없습니다</p>
          ) : (
            <div className="space-y-2">{conversations.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-gray-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {(c.sender.name || c.receiver.name || '?')[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{c.sender.name || c.receiver.name}</p>
                  <p className="text-sm text-muted line-clamp-1">{c.content}</p>
                </div>
                <div className="text-xs text-muted">{new Date(c.createdAt).toLocaleDateString('ko-KR')}</div>
                {!c.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
