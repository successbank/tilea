import { z } from 'zod';

export const estimateItemSchema = z.object({
  category: z.enum(['재료비', '인건비', '부자재', '운반비', '기타']),
  name: z.string().min(1, '품명을 입력하세요'),
  spec: z.string().optional().default(''),
  quantity: z.number().min(0.01, '수량을 입력하세요'),
  unitPrice: z.number().min(0, '단가를 입력하세요'),
  amount: z.number(),
});

export const createEstimateSchema = z.object({
  customerName: z.string().min(1, '고객명을 입력하세요'),
  customerPhone: z.string().optional().default(''),
  customerEmail: z.string().email('유효한 이메일을 입력하세요').optional().or(z.literal('')),
  customerAddress: z.string().optional().default(''),
  items: z.array(estimateItemSchema).min(1, '항목을 1개 이상 추가하세요'),
  subtotal: z.number(),
  marginRate: z.number().min(0).max(100).default(10),
  marginAmount: z.number(),
  totalAmount: z.number(),
  validUntil: z.string().optional(),
  notes: z.string().optional().default(''),
  templateType: z.string().optional(),
});

export type EstimateItem = z.infer<typeof estimateItemSchema>;
export type CreateEstimateInput = z.infer<typeof createEstimateSchema>;
