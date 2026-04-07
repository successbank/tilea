export const dynamic = 'force-dynamic';
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ESTIMATE_TEMPLATES, CATEGORIES } from '@/lib/estimate-templates';

interface ItemRow {
  category: string;
  name: string;
  spec: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function NewEstimatePage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState<ItemRow[]>([]);
  const [marginRate, setMarginRate] = useState(10);
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const marginAmount = Math.round(subtotal * (marginRate / 100));
  const totalAmount = subtotal + marginAmount;

  const applyTemplate = (key: string) => {
    const template = ESTIMATE_TEMPLATES[key];
    if (!template) return;
    setTemplateType(key);
    setItems(
      template.items.map((item) => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      }))
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      { category: '재료비', name: '', spec: '', quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  };

  const updateItem = (index: number, field: keyof ItemRow, value: string | number) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = Math.round(Number(item.quantity) * Number(item.unitPrice));
    }

    updated[index] = item;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        items,
        subtotal,
        marginRate,
        marginAmount,
        totalAmount,
        validUntil: validUntil || undefined,
        notes,
        templateType,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || '저장에 실패했습니다');
      return;
    }

    router.push('/dashboard/estimates');
    router.refresh();
  };

  const fmt = (n: number) => `₩${n.toLocaleString()}`;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-foreground">새 견적서</h1>

      {/* Template Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>템플릿 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
            {Object.entries(ESTIMATE_TEMPLATES).map(([key, tmpl]) => (
              <button
                key={key}
                onClick={() => applyTemplate(key)}
                className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                  templateType === key
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="font-medium">{tmpl.name}</p>
                <p className="text-xs text-muted">{tmpl.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>고객 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            <div>
              <Label>고객명 *</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="고객 이름 또는 상호" />
            </div>
            <div>
              <Label>연락처</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="01012345678" />
            </div>
            <div>
              <Label>이메일</Label>
              <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="이메일 (견적서 발송용)" />
            </div>
            <div>
              <Label>주소</Label>
              <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="시공/배송 주소" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>항목</CardTitle>
            <Button size="sm" variant="outline" onClick={addItem}>
              + 항목 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              템플릿을 선택하거나 항목을 추가하세요
            </p>
          ) : (
            <div className="space-y-3">
              <div className="hidden grid-cols-12 gap-2 text-xs font-medium text-muted tablet:grid">
                <span className="col-span-2">카테고리</span>
                <span className="col-span-3">품명</span>
                <span className="col-span-2">규격</span>
                <span className="col-span-1">수량</span>
                <span className="col-span-2">단가</span>
                <span className="col-span-1">금액</span>
                <span className="col-span-1"></span>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2">
                  <Select
                    value={item.category}
                    onChange={(e) => updateItem(i, 'category', e.target.value)}
                    className="col-span-12 tablet:col-span-2 text-xs"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(i, 'name', e.target.value)}
                    placeholder="품명"
                    className="col-span-6 tablet:col-span-3 text-xs"
                  />
                  <Input
                    value={item.spec}
                    onChange={(e) => updateItem(i, 'spec', e.target.value)}
                    placeholder="규격"
                    className="col-span-6 tablet:col-span-2 text-xs"
                  />
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                    className="col-span-3 tablet:col-span-1 text-xs"
                    min={0}
                  />
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, 'unitPrice', parseInt(e.target.value) || 0)}
                    className="col-span-4 tablet:col-span-2 text-xs"
                    min={0}
                  />
                  <span className="col-span-4 tablet:col-span-1 text-right text-xs font-medium text-foreground">
                    {fmt(item.amount)}
                  </span>
                  <button
                    onClick={() => removeItem(i)}
                    className="col-span-1 text-center text-sm text-muted hover:text-destructive"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary + Options */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label>마진율 (%)</Label>
                <Input
                  type="number"
                  value={marginRate}
                  onChange={(e) => setMarginRate(parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <Label>유효기간</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
              <div>
                <Label>비고</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="추가 안내사항"
                  rows={3}
                />
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-6">
              <h3 className="mb-4 font-semibold text-foreground">금액 요약</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">소계</span>
                  <span className="font-medium">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">마진 ({marginRate}%)</span>
                  <span className="font-medium">{fmt(marginAmount)}</span>
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">합계</span>
                    <span className="text-primary">{fmt(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={loading || !customerName || items.length === 0} className="flex-1">
          {loading ? '저장 중...' : '견적서 저장'}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </div>
  );
}
