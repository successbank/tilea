'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

interface UserItem { id: string; email: string; name: string | null; role: string; status: string; createdAt: string; points: number; businessProfile: { shopName: string; verificationStatus: string } | null; }

const ROLE_LABEL: Record<string, string> = { GENERAL: '일반', BUSINESS: '사업자', INSTRUCTOR: '강사', ADMIN: '관리자' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    const res = await fetch(`/api/admin/users?${p}`);
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">회원 관리</h1>
      <div className="mb-4 flex gap-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이메일 또는 이름 검색" className="max-w-sm" onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} />
        <Button variant="outline" onClick={fetchUsers}>검색</Button>
      </div>
      {loading ? <p className="py-10 text-center text-muted">불러오는 중...</p> : (
        <div className="space-y-2">{users.map((u) => (
          <Card key={u.id}><CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-foreground">{u.name || '이름없음'} <span className="text-sm text-muted">{u.email}</span></p>
              <p className="text-xs text-muted">가입일: {new Date(u.createdAt).toLocaleDateString('ko-KR')} · {u.points}P{u.businessProfile ? ` · ${u.businessProfile.shopName}` : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={u.role === 'ADMIN' ? 'destructive' : u.role === 'BUSINESS' ? 'success' : 'outline'}>{ROLE_LABEL[u.role]}</Badge>
              {u.businessProfile?.verificationStatus === 'PENDING' && <Badge variant="warning">인증대기</Badge>}
            </div>
          </CardContent></Card>
        ))}</div>
      )}
    </div>
  );
}
