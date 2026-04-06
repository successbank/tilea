'use client';

import type { SheetLayout } from '@/lib/cutting/guillotine';

const COLORS = [
  '#E8D5B7', '#C4A882', '#D4A843', '#B8956A', '#A0845E',
  '#8B7355', '#C9B896', '#DBC7A0', '#E5CFA9', '#BFA77A',
  '#D2B48C', '#C8AD7F',
];

interface Props {
  layout: SheetLayout;
  sheetWidth: number;
  sheetHeight: number;
  className?: string;
}

export function CuttingLayoutSVG({ layout, sheetWidth, sheetHeight, className }: Props) {
  const padding = 2;

  return (
    <svg
      viewBox={`-${padding} -${padding} ${sheetWidth + padding * 2} ${sheetHeight + padding * 2}`}
      className={className}
      style={{ width: '100%', height: 'auto', maxHeight: '500px' }}
    >
      {/* Sheet background */}
      <rect
        x={0}
        y={0}
        width={sheetWidth}
        height={sheetHeight}
        fill="#f5f0e8"
        stroke="#8B6914"
        strokeWidth={2}
      />

      {/* Grid lines */}
      {Array.from({ length: Math.floor(sheetWidth / 200) }, (_, i) => (
        <line
          key={`vg-${i}`}
          x1={(i + 1) * 200}
          y1={0}
          x2={(i + 1) * 200}
          y2={sheetHeight}
          stroke="#e0d5c0"
          strokeWidth={0.5}
          strokeDasharray="4 4"
        />
      ))}
      {Array.from({ length: Math.floor(sheetHeight / 200) }, (_, i) => (
        <line
          key={`hg-${i}`}
          x1={0}
          y1={(i + 1) * 200}
          x2={sheetWidth}
          y2={(i + 1) * 200}
          stroke="#e0d5c0"
          strokeWidth={0.5}
          strokeDasharray="4 4"
        />
      ))}

      {/* Placed parts */}
      {layout.placements.map((p, i) => {
        const color = COLORS[i % COLORS.length];
        const fontSize = Math.min(p.w, p.h) * 0.15;
        const minFontSize = 10;
        const textSize = Math.max(fontSize, minFontSize);

        return (
          <g key={i}>
            <rect
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              fill={color}
              stroke="#5a4a2a"
              strokeWidth={1.5}
              rx={2}
            />
            {/* Part name */}
            {p.w > 40 && p.h > 20 && (
              <text
                x={p.x + p.w / 2}
                y={p.y + p.h / 2 - textSize * 0.3}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={textSize}
                fontWeight="600"
                fill="#2C2C2C"
              >
                {p.name}
              </text>
            )}
            {/* Dimensions */}
            {p.w > 60 && p.h > 35 && (
              <text
                x={p.x + p.w / 2}
                y={p.y + p.h / 2 + textSize * 0.7}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={textSize * 0.75}
                fill="#666"
              >
                {p.w}×{p.h}
                {p.rotated ? ' ↻' : ''}
              </text>
            )}
          </g>
        );
      })}

      {/* Sheet dimensions */}
      <text x={sheetWidth / 2} y={-5} textAnchor="middle" fontSize={14} fill="#8B6914">
        {sheetWidth}mm
      </text>
      <text
        x={-5}
        y={sheetHeight / 2}
        textAnchor="middle"
        fontSize={14}
        fill="#8B6914"
        transform={`rotate(-90, -5, ${sheetHeight / 2})`}
      >
        {sheetHeight}mm
      </text>
    </svg>
  );
}
