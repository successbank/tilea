import type { EstimateItem } from '@/lib/validations/estimate';

interface Template {
  name: string;
  description: string;
  items: Omit<EstimateItem, 'amount'>[];
}

export const ESTIMATE_TEMPLATES: Record<string, Template> = {
  furniture: {
    name: '가구 제작',
    description: '식탁, 책상, 수납장 등 맞춤 가구',
    items: [
      { category: '재료비', name: '원목 판재', spec: '2440×1220×18mm', quantity: 2, unitPrice: 85000 },
      { category: '재료비', name: '경첩', spec: '35mm 소프트클로즈', quantity: 4, unitPrice: 3500 },
      { category: '부자재', name: '목공 접착제', spec: '타이트본드 III', quantity: 1, unitPrice: 15000 },
      { category: '부자재', name: '사포 세트', spec: '#120~#400', quantity: 1, unitPrice: 8000 },
      { category: '인건비', name: '제작 인건비', spec: '', quantity: 1, unitPrice: 200000 },
      { category: '부자재', name: '마감 오일', spec: '천연 오스모', quantity: 1, unitPrice: 45000 },
    ],
  },
  interior: {
    name: '인테리어 시공',
    description: '몰딩, 붙박이장, 데크 시공',
    items: [
      { category: '재료비', name: 'MDF 판재', spec: '2440×1220×15mm', quantity: 5, unitPrice: 35000 },
      { category: '재료비', name: '몰딩', spec: '크라운 몰딩 2.4m', quantity: 10, unitPrice: 12000 },
      { category: '부자재', name: '피스/나사', spec: '세트', quantity: 1, unitPrice: 15000 },
      { category: '인건비', name: '시공 인건비', spec: '1일', quantity: 2, unitPrice: 250000 },
      { category: '운반비', name: '자재 운반', spec: '', quantity: 1, unitPrice: 50000 },
    ],
  },
  cnc: {
    name: '재단 가공',
    description: 'CNC 가공, 일반 재단',
    items: [
      { category: '재료비', name: '합판', spec: '2440×1220×18mm', quantity: 3, unitPrice: 42000 },
      { category: '인건비', name: 'CNC 가공비', spec: '시간당', quantity: 2, unitPrice: 80000 },
      { category: '인건비', name: '재단비', spec: '컷당', quantity: 20, unitPrice: 2000 },
      { category: '부자재', name: '엣지 마감', spec: 'PVC 엣지밴딩', quantity: 10, unitPrice: 3000 },
    ],
  },
  blank: {
    name: '빈 템플릿',
    description: '직접 구성',
    items: [],
  },
};

export const CATEGORIES = ['재료비', '인건비', '부자재', '운반비', '기타'] as const;
