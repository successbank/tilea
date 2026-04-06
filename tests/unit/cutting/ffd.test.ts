import { ffdOptimize, type LinearPart } from '../../../src/lib/cutting/ffd';

describe('FFD 1D 각재 절단', () => {
  const STOCK = 3600;
  const KERF = 3;

  test('기본: 여러 부재 절단', () => {
    const parts: LinearPart[] = [
      { name: '세로대', length: 900, qty: 4 },
      { name: '가로대', length: 500, qty: 6 },
    ];
    const result = ffdOptimize(STOCK, parts, KERF);
    expect(result.stocksUsed).toBeGreaterThanOrEqual(1);
    const total = result.layouts.reduce((s, l) => s + l.placements.length, 0);
    expect(total).toBe(10);
  });

  test('빈 부재 → 0 stocks', () => {
    const result = ffdOptimize(STOCK, [], KERF);
    expect(result.stocksUsed).toBe(0);
  });

  test('단가 계산', () => {
    const parts: LinearPart[] = [{ name: 'A', length: 1000, qty: 5 }];
    const result = ffdOptimize(STOCK, parts, KERF, 15000);
    expect(result.totalCost).toBe(result.stocksUsed * 15000);
  });

  test('원재보다 긴 부재 → 배치 불가', () => {
    const parts: LinearPart[] = [{ name: '초장', length: 4000, qty: 1 }];
    const result = ffdOptimize(STOCK, parts, KERF);
    expect(result.stocksUsed).toBe(0);
  });

  test('자투리율 합리적 범위', () => {
    const parts: LinearPart[] = [{ name: 'B', length: 800, qty: 10 }];
    const result = ffdOptimize(STOCK, parts, KERF);
    expect(result.wastePercent).toBeGreaterThan(0);
    expect(result.wastePercent).toBeLessThan(50);
  });
});
