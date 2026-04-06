import { z } from 'zod';

export const businessVerifySchema = z.object({
  businessNumber: z
    .string()
    .regex(/^\d{10}$/, '사업자등록번호는 숫자 10자리입니다 (하이픈 제외)'),
  businessName: z.string().min(1, '상호명을 입력하세요'),
  ownerName: z.string().min(1, '대표자명을 입력하세요'),
  businessType: z.string().optional(),
});

export const businessProfileSchema = z.object({
  shopName: z.string().min(1, '공방/가게명을 입력하세요'),
  introduction: z.string().max(1000, '1000자 이내로 입력하세요').optional(),
  specialty: z.array(z.string()).min(1, '전문분야를 1개 이상 선택하세요'),
  address: z.string().optional(),
  addressDetail: z.string().optional(),
  phone: z
    .string()
    .regex(/^01[0-9]\d{7,8}$/, '유효한 전화번호를 입력하세요')
    .optional()
    .or(z.literal('')),
  website: z.string().url('유효한 URL을 입력하세요').optional().or(z.literal('')),
});

export type BusinessVerifyInput = z.infer<typeof businessVerifySchema>;
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
