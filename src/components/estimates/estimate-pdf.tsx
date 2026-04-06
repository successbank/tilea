'use client';

import dynamic from 'next/dynamic';

const PDFContent = dynamic(() => import('./estimate-pdf-content'), { ssr: false });

interface EstimateData {
  estimateNo: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: Array<{
    category: string;
    name: string;
    spec: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  marginRate: number;
  marginAmount: number;
  totalAmount: number;
  validUntil?: string;
  notes?: string;
  businessName?: string;
  businessNumber?: string;
  ownerName?: string;
}

export function EstimatePDFButton({ data }: { data: EstimateData }) {
  return <PDFContent data={data} />;
}

export type { EstimateData };
