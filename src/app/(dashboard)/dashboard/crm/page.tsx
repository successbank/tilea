export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Tab = 'customers' | 'finance' | 'receivables';

export default function CRMPage() {
  const [tab, setTab] = useState<Tab>('customers');
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; phone: string | null; tags: string[]; memo: string | null }>>([]);
  const [expenses, setExpenses] = useState<{ expenses: Array<{ id: string; type: string; category: string; amount: number; description: string | null; date: string }>; totals: { income: number; expense: number } }>({ expenses: [], totals: { income: 0, expense: 0 } });
  const [receivables, setReceivables] = useState<Array<{ id: string; amount: number; description: string | null; dueDate: string; status: string }>>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (tab === 'customers') fetch(`/api/customers${search ? `?search=${search}` : ''}`).then((r) => r.json()).then(setCustomers);
    if (tab === 'finance') fetch('/api/expenses').then((r) => r.json()).then(setExpenses);
    if (tab === 'receivables') fetch('/api/receivables').then((r) => r.json()).then(setReceivables);
  }, [tab, search]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">CRM & 매출관리</h1>
      <div className="mb-6 flex gap-2">
        {(['customers', 'finance', 'receivables'] as Tab[]).map((t) => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} size="sm" onClick={() => setTab(t)}>
            {t === 'customers' ? '👥 고객' : t === 'finance' ? '💰 매출/지출' : '📄 미수금'}
          </Button>
        ))}
      </div>

      {tab === 'customers' && (
        <div>
          <div className="mb-4 flex gap-2"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="고객명 검색" className="max-w-sm" /><Button>+ 고객 추가</Button></div>
          {customers.length === 0 ? <Card><CardContent className="py-10 text-center text-muted">고객이 없습니다</CardContent></Card> : (
            <div className="space-y-2">{customers.map((c) => (
              <Card key={c.id}><CardContent className="flex items-center justify-between py-4">
                <div><p className="font-medium text-foreground">{c.name}</p><p className="text-xs text-muted">{c.phone || '연락처 없음'} {c.tags?.length > 0 && `· ${c.tags.join(', ')}`}</p></div>
              </CardContent></Card>
            ))}</div>
          )}
        </div>
      )}

      {tab === 'finance' && (
        <div>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-green-600">₩{expenses.totals.income.toLocaleString()}</p><p className="text-xs text-muted">수입</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-red-600">₩{expenses.totals.expense.toLocaleString()}</p><p className="text-xs text-muted">지출</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-foreground">₩{(expenses.totals.income - expenses.totals.expense).toLocaleString()}</p><p className="text-xs text-muted">손익</p></CardContent></Card>
          </div>
          <div className="space-y-2">{expenses.expenses.map((e) => (
            <Card key={e.id}><CardContent className="flex items-center justify-between py-3">
              <div><p className="text-sm font-medium text-foreground">{e.description || e.category}</p><p className="text-xs text-muted">{e.category} · {new Date(e.date).toLocaleDateString('ko-KR')}</p></div>
              <span className={`font-bold ${e.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>{e.type === 'INCOME' ? '+' : '-'}₩{e.amount.toLocaleString()}</span>
            </CardContent></Card>
          ))}</div>
        </div>
      )}

      {tab === 'receivables' && (
        <div className="space-y-2">{receivables.length === 0 ? <Card><CardContent className="py-10 text-center text-muted">미수금이 없습니다</CardContent></Card> : receivables.map((r) => (
          <Card key={r.id}><CardContent className="flex items-center justify-between py-4">
            <div><p className="font-medium text-foreground">₩{r.amount.toLocaleString()}</p><p className="text-xs text-muted">{r.description} · 만기 {new Date(r.dueDate).toLocaleDateString('ko-KR')}</p></div>
            <Badge variant={r.status === 'PAID' ? 'success' : r.status === 'OVERDUE' ? 'destructive' : 'warning'}>{r.status === 'PAID' ? '입금완료' : r.status === 'OVERDUE' ? '연체' : '대기'}</Badge>
          </CardContent></Card>
        ))}</div>
      )}
    </div>
  );
}
