export interface LinearPart {
  name: string;
  length: number;
  qty: number;
}

export interface LinearPlacement {
  name: string;
  length: number;
  position: number;
}

export interface StockLayout {
  stockIndex: number;
  placements: LinearPlacement[];
  wasteLength: number;
}

export interface LinearCuttingResult {
  layouts: StockLayout[];
  stocksUsed: number;
  wastePercent: number;
  totalCost: number | null;
}

export function ffdOptimize(
  stockLength: number,
  parts: LinearPart[],
  kerf: number = 3,
  stockPrice?: number
): LinearCuttingResult {
  // Expand parts by quantity
  const expanded: { name: string; length: number }[] = [];
  for (const p of parts) {
    for (let i = 0; i < p.qty; i++) {
      expanded.push({ name: p.name, length: p.length });
    }
  }

  // Sort by length descending (FFD)
  expanded.sort((a, b) => b.length - a.length);

  const totalPartLength = expanded.reduce((sum, p) => sum + p.length, 0);

  // Bins: each bin tracks remaining space and placements
  const bins: { remaining: number; placements: LinearPlacement[] }[] = [];

  for (const part of expanded) {
    if (part.length > stockLength) continue; // 원재보다 긴 부재 스킵

    const partWithKerf = part.length + kerf;
    let placed = false;

    // First Fit: try existing bins
    for (const bin of bins) {
      if (bin.remaining >= partWithKerf || bin.remaining >= part.length) {
        const actualSize = bin.remaining >= partWithKerf ? partWithKerf : part.length;
        const position = stockLength - bin.remaining;
        bin.placements.push({
          name: part.name,
          length: part.length,
          position,
        });
        bin.remaining -= actualSize;
        placed = true;
        break;
      }
    }

    if (!placed) {
      // New bin
      const position = 0;
      bins.push({
        remaining: stockLength - partWithKerf,
        placements: [{ name: part.name, length: part.length, position }],
      });
    }
  }

  const layouts: StockLayout[] = bins.map((bin, i) => ({
    stockIndex: i,
    placements: bin.placements,
    wasteLength: bin.remaining,
  }));

  const stocksUsed = layouts.length;
  const totalStockLength = stocksUsed * stockLength;
  const wastePercent =
    totalStockLength > 0
      ? Math.round(((totalStockLength - totalPartLength) / totalStockLength) * 1000) / 10
      : 0;

  const totalCost = stockPrice ? stocksUsed * stockPrice : null;

  return { layouts, stocksUsed, wastePercent, totalCost };
}
