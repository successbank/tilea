import { guillotineOptimize, type Part } from '../../../src/lib/cutting/guillotine';

describe('Guillotine 2D Bin Packing', () => {
  const SHEET_W = 2440;
  const SHEET_H = 1220;
  const KERF = 3;

  test('기본: 5개 부재 배치', () => {
    const parts: Part[] = [
      { name: '상판', w: 800, h: 400, qty: 2 },
      { name: '측판', w: 600, h: 300, qty: 3 },
    ];
    const result = guillotineOptimize(SHEET_W, SHEET_H, parts, KERF);

    expect(result.sheetsUsed).toBeGreaterThanOrEqual(1);
    expect(result.wastePercent).toBeGreaterThan(0);
    expect(result.wastePercent).toBeLessThan(100);
    expect(result.layouts.length).toBe(result.sheetsUsed);

    const totalPlacements = result.layouts.reduce((sum, l) => sum + l.placements.length, 0);
    expect(totalPlacements).toBe(5);
  });

  test('빈 부재 목록 → 0 sheets', () => {
    const result = guillotineOptimize(SHEET_W, SHEET_H, [], KERF);
    expect(result.sheetsUsed).toBe(0);
    expect(result.wastePercent).toBe(0);
  });

  test('단일 대형 부재', () => {
    const parts: Part[] = [{ name: '대형판', w: 2400, h: 1200, qty: 1 }];
    const result = guillotineOptimize(SHEET_W, SHEET_H, parts, KERF);
    expect(result.sheetsUsed).toBe(1);
    expect(result.layouts[0].placements.length).toBe(1);
  });

  test('원판보다 큰 부재 → 배치 불가', () => {
    const parts: Part[] = [{ name: '초대형', w: 3000, h: 1500, qty: 1 }];
    const result = guillotineOptimize(SHEET_W, SHEET_H, parts, KERF);
    expect(result.sheetsUsed).toBe(0);
  });

  test('kerf 반영: 부재 간 간격', () => {
    const parts: Part[] = [
      { name: 'A', w: 1200, h: 600, qty: 1 },
      { name: 'B', w: 1200, h: 600, qty: 1 },
    ];
    const result = guillotineOptimize(SHEET_W, SHEET_H, parts, KERF);
    expect(result.sheetsUsed).toBe(1);

    const placements = result.layouts[0].placements;
    expect(placements.length).toBe(2);

    // 두 부재 사이에 최소 kerf 만큼 간격
    if (placements[0].x === placements[1].x) {
      const gap = Math.abs(placements[1].y - (placements[0].y + placements[0].h));
      expect(gap).toBeGreaterThanOrEqual(KERF);
    }
  });

  test('결 방향 ON → 회전 금지', () => {
    const parts: Part[] = [
      { name: '결고정', w: 1000, h: 200, qty: 1, grain: true },
    ];
    const result = guillotineOptimize(SHEET_W, SHEET_H, parts, KERF);
    expect(result.layouts[0].placements[0].rotated).toBe(false);
  });

  test('단가 입력 시 총 비용 계산', () => {
    const parts: Part[] = [{ name: '판', w: 800, h: 600, qty: 4 }];
    const result = guillotineOptimize(SHEET_W, SHEET_H, parts, KERF, 45000);
    expect(result.totalCost).toBe(result.sheetsUsed * 45000);
  });

  test('단가 미입력 시 totalCost = null', () => {
    const parts: Part[] = [{ name: '판', w: 800, h: 600, qty: 1 }];
    const result = guillotineOptimize(SHEET_W, SHEET_H, parts, KERF);
    expect(result.totalCost).toBeNull();
  });

  test('다수 부재 (20개) → 여러 원판', () => {
    const parts: Part[] = [{ name: '선반', w: 500, h: 300, qty: 20 }];
    const result = guillotineOptimize(SHEET_W, SHEET_H, parts, KERF);
    expect(result.sheetsUsed).toBeGreaterThanOrEqual(2);
    const total = result.layouts.reduce((s, l) => s + l.placements.length, 0);
    expect(total).toBe(20);
  });

  test('자투리율 정확성', () => {
    const parts: Part[] = [{ name: '큰판', w: 2400, h: 1200, qty: 1 }];
    const result = guillotineOptimize(SHEET_W, SHEET_H, parts, KERF);
    const expectedWaste = ((SHEET_W * SHEET_H - 2400 * 1200) / (SHEET_W * SHEET_H)) * 100;
    expect(Math.abs(result.wastePercent - Math.round(expectedWaste * 10) / 10)).toBeLessThan(1);
  });
});
