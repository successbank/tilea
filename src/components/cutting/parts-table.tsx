'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface PartRow {
  name: string;
  w: number;
  h: number;
  qty: number;
  grain: boolean;
}

interface Props {
  parts: PartRow[];
  grainEnabled: boolean;
  onChange: (parts: PartRow[]) => void;
}

export function PartsTable({ parts, grainEnabled, onChange }: Props) {
  const addPart = () => {
    onChange([...parts, { name: `부재 ${parts.length + 1}`, w: 300, h: 200, qty: 1, grain: false }]);
  };

  const removePart = (index: number) => {
    onChange(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof PartRow, value: string | number | boolean) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">부재 목록</h3>
        <Button type="button" size="sm" variant="outline" onClick={addPart}>
          + 추가
        </Button>
      </div>

      <div className="space-y-2">
        {parts.map((part, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-border bg-gray-50 p-2"
          >
            <Input
              value={part.name}
              onChange={(e) => updatePart(i, 'name', e.target.value)}
              placeholder="이름"
              className="w-24 bg-white text-xs"
            />
            <Input
              type="number"
              value={part.w}
              onChange={(e) => updatePart(i, 'w', parseInt(e.target.value) || 0)}
              placeholder="가로"
              className="w-20 bg-white text-xs"
            />
            <span className="text-xs text-muted">×</span>
            <Input
              type="number"
              value={part.h}
              onChange={(e) => updatePart(i, 'h', parseInt(e.target.value) || 0)}
              placeholder="세로"
              className="w-20 bg-white text-xs"
            />
            <Input
              type="number"
              value={part.qty}
              onChange={(e) => updatePart(i, 'qty', parseInt(e.target.value) || 1)}
              min={1}
              className="w-16 bg-white text-xs"
            />
            {grainEnabled && (
              <label className="flex items-center gap-1 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={part.grain}
                  onChange={(e) => updatePart(i, 'grain', e.target.checked)}
                />
                결
              </label>
            )}
            <button
              type="button"
              onClick={() => removePart(i)}
              className="ml-auto text-sm text-muted hover:text-destructive"
            >
              ✕
            </button>
          </div>
        ))}

        {parts.length === 0 && (
          <p className="py-4 text-center text-sm text-muted">
            부재를 추가하세요
          </p>
        )}
      </div>
    </div>
  );
}
