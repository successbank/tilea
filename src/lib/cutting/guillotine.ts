export interface Part {
  name: string;
  w: number;
  h: number;
  qty: number;
  grain?: boolean; // true = 결 방향 고정, 회전 금지
}

export interface Placement {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  rotated: boolean;
}

export interface SheetLayout {
  sheetIndex: number;
  placements: Placement[];
}

export interface CuttingResult {
  layouts: SheetLayout[];
  sheetsUsed: number;
  wastePercent: number;
  totalCost: number | null;
}

interface FreeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ExpandedPart {
  name: string;
  w: number;
  h: number;
  grain: boolean;
}

function expandParts(parts: Part[]): ExpandedPart[] {
  const expanded: ExpandedPart[] = [];
  for (const p of parts) {
    for (let i = 0; i < p.qty; i++) {
      expanded.push({ name: p.name, w: p.w, h: p.h, grain: !!p.grain });
    }
  }
  // Sort by area descending for better packing
  return expanded.sort((a, b) => b.w * b.h - a.w * a.h);
}

function findBestFit(
  freeRects: FreeRect[],
  pw: number,
  ph: number,
  kerf: number
): { rectIndex: number; rotated: boolean } | null {
  const kw = pw + kerf;
  const kh = ph + kerf;

  let bestIndex = -1;
  let bestRotated = false;
  let bestAreaDiff = Infinity;

  for (let i = 0; i < freeRects.length; i++) {
    const r = freeRects[i];
    const area = r.w * r.h;

    // Try original orientation
    if (kw <= r.w && kh <= r.h) {
      const diff = area - pw * ph;
      if (diff < bestAreaDiff) {
        bestAreaDiff = diff;
        bestIndex = i;
        bestRotated = false;
      }
    }

    // Try rotated (90°)
    if (kh <= r.w && kw <= r.h) {
      const diff = area - pw * ph;
      if (diff < bestAreaDiff) {
        bestAreaDiff = diff;
        bestIndex = i;
        bestRotated = true;
      }
    }
  }

  if (bestIndex === -1) return null;
  return { rectIndex: bestIndex, rotated: bestRotated };
}

function guillotineSplit(
  freeRects: FreeRect[],
  rectIndex: number,
  pw: number,
  ph: number,
  kerf: number
): void {
  const rect = freeRects[rectIndex];
  const kw = pw + kerf;
  const kh = ph + kerf;

  // Remove the used rect
  freeRects.splice(rectIndex, 1);

  // Split right
  const rightW = rect.w - kw;
  if (rightW > kerf) {
    freeRects.push({
      x: rect.x + kw,
      y: rect.y,
      w: rightW,
      h: rect.h,
    });
  }

  // Split bottom
  const bottomH = rect.h - kh;
  if (bottomH > kerf) {
    freeRects.push({
      x: rect.x,
      y: rect.y + kh,
      w: kw, // Only the width of the placed part
      h: bottomH,
    });
  }
}

function packSheet(
  sheetW: number,
  sheetH: number,
  parts: ExpandedPart[],
  kerf: number,
  startIndex: number
): { placements: Placement[]; usedCount: number } {
  const freeRects: FreeRect[] = [{ x: 0, y: 0, w: sheetW, h: sheetH }];
  const placements: Placement[] = [];
  let used = 0;

  for (let i = startIndex; i < parts.length; i++) {
    const part = parts[i];

    // If grain direction is fixed, don't allow rotation
    let fit: { rectIndex: number; rotated: boolean } | null;

    if (part.grain) {
      // Only try original orientation
      fit = findBestFitNoRotation(freeRects, part.w, part.h, kerf);
    } else {
      fit = findBestFit(freeRects, part.w, part.h, kerf);
    }

    if (!fit) continue;

    const pw = fit.rotated ? part.h : part.w;
    const ph = fit.rotated ? part.w : part.h;
    const rect = freeRects[fit.rectIndex];

    placements.push({
      x: rect.x,
      y: rect.y,
      w: pw,
      h: ph,
      name: part.name,
      rotated: fit.rotated,
    });

    guillotineSplit(freeRects, fit.rectIndex, pw, ph, kerf);
    used++;

    // Mark as placed
    parts[i] = { ...parts[i], w: -1 }; // Flag as used
  }

  return { placements, usedCount: used };
}

function findBestFitNoRotation(
  freeRects: FreeRect[],
  pw: number,
  ph: number,
  kerf: number
): { rectIndex: number; rotated: boolean } | null {
  const kw = pw + kerf;
  const kh = ph + kerf;

  let bestIndex = -1;
  let bestAreaDiff = Infinity;

  for (let i = 0; i < freeRects.length; i++) {
    const r = freeRects[i];
    if (kw <= r.w && kh <= r.h) {
      const diff = r.w * r.h - pw * ph;
      if (diff < bestAreaDiff) {
        bestAreaDiff = diff;
        bestIndex = i;
      }
    }
  }

  if (bestIndex === -1) return null;
  return { rectIndex: bestIndex, rotated: false };
}

export function guillotineOptimize(
  sheetW: number,
  sheetH: number,
  parts: Part[],
  kerf: number = 3,
  sheetPrice?: number
): CuttingResult {
  const expanded = expandParts(parts);
  const totalPartArea = expanded.reduce((sum, p) => sum + p.w * p.h, 0);
  const layouts: SheetLayout[] = [];
  let remaining = [...expanded];
  let sheetIndex = 0;

  while (remaining.some((p) => p.w > 0)) {
    const toPlace = remaining.filter((p) => p.w > 0);
    const { placements } = packSheet(sheetW, sheetH, remaining, kerf, 0);

    if (placements.length === 0) {
      // Some parts couldn't fit — skip unfittable parts
      break;
    }

    layouts.push({ sheetIndex, placements });
    remaining = remaining.filter((p) => p.w > 0);
    sheetIndex++;
  }

  const sheetsUsed = layouts.length;
  const totalSheetArea = sheetsUsed * sheetW * sheetH;
  const wastePercent = totalSheetArea > 0
    ? Math.round(((totalSheetArea - totalPartArea) / totalSheetArea) * 1000) / 10
    : 0;

  const totalCost = sheetPrice ? sheetsUsed * sheetPrice : null;

  return { layouts, sheetsUsed, wastePercent, totalCost };
}
