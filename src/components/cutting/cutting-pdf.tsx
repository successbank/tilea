'use client';

import dynamic from 'next/dynamic';
import type { CuttingResult } from '@/lib/cutting/guillotine';

const PDFContent = dynamic(() => import('./cutting-pdf-content'), { ssr: false });

interface Props {
  result: CuttingResult;
  sheetWidth: number;
  sheetHeight: number;
  sheetPrice?: number;
}

export function CuttingPDFButton(props: Props) {
  return <PDFContent {...props} />;
}
