'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CuttingLayoutSVG } from '@/components/cutting/cutting-layout-svg';
import { PartsTable, type PartRow } from '@/components/cutting/parts-table';
import type { CuttingResult } from '@/lib/cutting/guillotine';
import type { LinearCuttingResult } from '@/lib/cutting/ffd';
import { CuttingPDFButton } from '@/components/cutting/cutting-pdf';

type TabMode = '2d' | '1d';

export default function CuttingOptimizerPage() {
  const [tab, setTab] = useState<TabMode>('2d');

  // 2D State
  const [sheetWidth, setSheetWidth] = useState(2440);
  const [sheetHeight, setSheetHeight] = useState(1220);
  const [sheetPrice, setSheetPrice] = useState<number | ''>('');
  const [kerf, setKerf] = useState(3);
  const [grainEnabled, setGrainEnabled] = useState(false);
  const [parts, setParts] = useState<PartRow[]>([
    { name: '상판', w: 800, h: 400, qty: 2, grain: false },
    { name: '측판', w: 600, h: 300, qty: 4, grain: false },
  ]);
  const [result, setResult] = useState<CuttingResult | null>(null);

  // 1D State
  const [stockLength, setStockLength] = useState(3600);
  const [stockPrice, setStockPrice] = useState<number | ''>('');
  const [linearParts, setLinearParts] = useState<{ name: string; length: number; qty: number }[]>([
    { name: '세로대', length: 900, qty: 4 },
    { name: '가로대', length: 500, qty: 6 },
  ]);
  const [linearResult, setLinearResult] = useState<LinearCuttingResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ usage: number; limit: number } | null>(null);

  const handleOptimize2D = async () => {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/cutting/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetWidth,
        sheetHeight,
        sheetPrice: sheetPrice || undefined,
        parts: parts.map((p) => ({ ...p, grain: grainEnabled ? p.grain : undefined })),
        kerf,
        grainEnabled,
      }),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      if (data.usage) setUsage({ usage: data.usage, limit: data.limit });
      return;
    }

    setResult(data);
    setUsage({ usage: data.usage, limit: data.limit });
  };

  const handleOptimize1D = async () => {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/cutting/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: '1d',
        stockLength,
        stockPrice: stockPrice || undefined,
        parts: linearParts,
        kerf,
      }),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setLinearResult(data);
    setUsage({ usage: data.usage, limit: data.limit });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">재단 계산기</h1>
        {usage && (
          <Badge variant={usage.usage >= usage.limit ? 'destructive' : 'outline'}>
            이번 달 {usage.usage}/{usage.limit}회 사용
          </Badge>
        )}
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={tab === '2d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('2d')}
        >
          📐 2D 판재
        </Button>
        <Button
          variant={tab === '1d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('1d')}
        >
          📏 1D 각재
        </Button>
      </div>

      {tab === '2d' ? (
        <div className="grid grid-cols-1 gap-6 desktop:grid-cols-2">
          {/* Input panel */}
          <Card>
            <CardHeader>
              <CardTitle>원판 설정 + 부재 목록</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>원판 가로 (mm)</Label>
                  <Input
                    type="number"
                    value={sheetWidth}
                    onChange={(e) => setSheetWidth(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>원판 세로 (mm)</Label>
                  <Input
                    type="number"
                    value={sheetHeight}
                    onChange={(e) => setSheetHeight(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>원판 단가 (원)</Label>
                  <Input
                    type="number"
                    value={sheetPrice}
                    onChange={(e) => setSheetPrice(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="선택"
                  />
                </div>
                <div>
                  <Label>톱날 두께 (mm)</Label>
                  <Input
                    type="number"
                    value={kerf}
                    onChange={(e) => setKerf(parseFloat(e.target.value) || 0)}
                    step={0.5}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={grainEnabled}
                  onChange={(e) => setGrainEnabled(e.target.checked)}
                />
                결 방향 고려 (체크된 부재는 회전하지 않음)
              </label>

              <PartsTable parts={parts} grainEnabled={grainEnabled} onChange={setParts} />

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>
              )}

              <Button onClick={handleOptimize2D} disabled={loading || parts.length === 0} className="w-full">
                {loading ? '계산 중...' : '최적화 실행'}
              </Button>
            </CardContent>
          </Card>

          {/* Result panel */}
          <div className="space-y-4">
            {result && result.layouts.length > 0 ? (
              <>
                {/* Summary */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-3 flex justify-end">
                      <CuttingPDFButton
                        result={result}
                        sheetWidth={sheetWidth}
                        sheetHeight={sheetHeight}
                        sheetPrice={typeof sheetPrice === 'number' ? sheetPrice : undefined}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{result.sheetsUsed}</p>
                        <p className="text-xs text-muted">필요 원판</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-accent">{result.wastePercent}%</p>
                        <p className="text-xs text-muted">자투리율</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {result.totalCost
                            ? `₩${result.totalCost.toLocaleString()}`
                            : '-'}
                        </p>
                        <p className="text-xs text-muted">총 재료비</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sheet layouts */}
                {result.layouts.map((layout, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        원판 #{i + 1} ({layout.placements.length}개 부재)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CuttingLayoutSVG
                        layout={layout}
                        sheetWidth={sheetWidth}
                        sheetHeight={sheetHeight}
                      />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <Card>
                <CardContent className="py-20 text-center">
                  <p className="text-4xl mb-4">📐</p>
                  <p className="text-muted">
                    원판 규격과 부재를 입력한 후
                    <br />
                    &ldquo;최적화 실행&rdquo;을 클릭하세요
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* 1D Tab */
        <div className="grid grid-cols-1 gap-6 desktop:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>원재 설정 + 필요 길이</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>원재 길이 (mm)</Label>
                  <Input
                    type="number"
                    value={stockLength}
                    onChange={(e) => setStockLength(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>원재 단가 (원)</Label>
                  <Input
                    type="number"
                    value={stockPrice}
                    onChange={(e) => setStockPrice(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="선택"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">필요 길이 목록</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setLinearParts([
                        ...linearParts,
                        { name: `부재 ${linearParts.length + 1}`, length: 300, qty: 1 },
                      ])
                    }
                  >
                    + 추가
                  </Button>
                </div>
                <div className="space-y-2">
                  {linearParts.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-border bg-gray-50 p-2"
                    >
                      <Input
                        value={p.name}
                        onChange={(e) => {
                          const u = [...linearParts];
                          u[i] = { ...u[i], name: e.target.value };
                          setLinearParts(u);
                        }}
                        className="w-24 bg-white text-xs"
                      />
                      <Input
                        type="number"
                        value={p.length}
                        onChange={(e) => {
                          const u = [...linearParts];
                          u[i] = { ...u[i], length: parseInt(e.target.value) || 0 };
                          setLinearParts(u);
                        }}
                        className="w-24 bg-white text-xs"
                        placeholder="길이(mm)"
                      />
                      <span className="text-xs text-muted">mm ×</span>
                      <Input
                        type="number"
                        value={p.qty}
                        onChange={(e) => {
                          const u = [...linearParts];
                          u[i] = { ...u[i], qty: parseInt(e.target.value) || 1 };
                          setLinearParts(u);
                        }}
                        className="w-16 bg-white text-xs"
                        min={1}
                      />
                      <button
                        type="button"
                        onClick={() => setLinearParts(linearParts.filter((_, j) => j !== i))}
                        className="ml-auto text-sm text-muted hover:text-destructive"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>
              )}

              <Button onClick={handleOptimize1D} disabled={loading || linearParts.length === 0} className="w-full">
                {loading ? '계산 중...' : '최적화 실행'}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {linearResult ? (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{linearResult.stocksUsed}</p>
                        <p className="text-xs text-muted">필요 원재</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-accent">{linearResult.wastePercent}%</p>
                        <p className="text-xs text-muted">자투리율</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {linearResult.totalCost
                            ? `₩${linearResult.totalCost.toLocaleString()}`
                            : '-'}
                        </p>
                        <p className="text-xs text-muted">총 재료비</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {linearResult.layouts.map((stock, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        원재 #{i + 1} (자투리: {stock.wasteLength}mm)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <svg viewBox={`0 0 ${stockLength} 60`} className="w-full" style={{ height: '50px' }}>
                        <rect x={0} y={10} width={stockLength} height={40} fill="#f5f0e8" stroke="#8B6914" strokeWidth={1} />
                        {stock.placements.map((p, j) => (
                          <g key={j}>
                            <rect
                              x={p.position}
                              y={10}
                              width={p.length}
                              height={40}
                              fill={['#E8D5B7', '#C4A882', '#D4A843', '#B8956A', '#A0845E'][j % 5]}
                              stroke="#5a4a2a"
                              strokeWidth={1}
                            />
                            <text
                              x={p.position + p.length / 2}
                              y={35}
                              textAnchor="middle"
                              fontSize={Math.min(10, p.length * 0.05)}
                              fill="#2C2C2C"
                            >
                              {p.name} ({p.length})
                            </text>
                          </g>
                        ))}
                      </svg>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <Card>
                <CardContent className="py-20 text-center">
                  <p className="text-4xl mb-4">📏</p>
                  <p className="text-muted">
                    원재 길이와 필요 부재를 입력한 후
                    <br />
                    &ldquo;최적화 실행&rdquo;을 클릭하세요
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
