'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';

const CAT_LABELS: Record<string, string> = { PANEL: '판재', TIMBER: '각재', HARDWARE: '하드웨어', PAINT: '도료', ACCESSORY: '부자재', OTHER: '기타' };

interface Item { id: string; name: string; category: string; spec: string | null; unit: string; quantity: number; minQuantity: number | null; location: string | null; }

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (category) p.set('category', category);
    fetch(`/api/inventory?${p}`).then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, [category]);

  const lowStock = items.filter((i) => i.minQuantity && i.quantity <= i.minQuantity);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">재고 관리</h1>
        <Button>+ 자재 등록</Button>
      </div>
      {lowStock.length > 0 && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-destructive">⚠️ 안전재고 이하: {lowStock.map((i) => i.name).join(', ')}</div>
      )}
      <div className="mb-4">
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-40">
          <option value="">전체 카테고리</option>
          {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </div>
      {loading ? <p className="py-10 text-center text-muted">불러오는 중...</p> : items.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted">등록된 자재가 없습니다</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted">{CAT_LABELS[item.category]} {item.spec && `· ${item.spec}`} {item.location && `· ${item.location}`}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-foreground">{item.quantity} {item.unit}</span>
                  {item.minQuantity && item.quantity <= item.minQuantity && <Badge variant="destructive">부족</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
