import { z } from 'zod';

export const partSchema = z.object({
  name: z.string().min(1, '부재 이름을 입력하세요'),
  w: z.number().min(1, '가로 크기는 1mm 이상'),
  h: z.number().min(1, '세로 크기는 1mm 이상'),
  qty: z.number().int().min(1, '수량은 1개 이상'),
  grain: z.boolean().optional(),
});

export const optimizeSchema = z.object({
  sheetWidth: z.number().min(100, '원판 가로는 100mm 이상'),
  sheetHeight: z.number().min(100, '원판 세로는 100mm 이상'),
  sheetPrice: z.number().min(0).optional(),
  parts: z.array(partSchema).min(1, '부재를 1개 이상 추가하세요'),
  kerf: z.number().min(0).max(10).default(3),
  grainEnabled: z.boolean().default(false),
});

export const linearPartSchema = z.object({
  name: z.string().min(1),
  length: z.number().min(1),
  qty: z.number().int().min(1),
});

export const linearOptimizeSchema = z.object({
  stockLength: z.number().min(100),
  stockPrice: z.number().min(0).optional(),
  parts: z.array(linearPartSchema).min(1),
  kerf: z.number().min(0).max(10).default(3),
});

export const cuttingProjectSchema = z.object({
  name: z.string().min(1).max(100),
  sheetWidth: z.number().min(100),
  sheetHeight: z.number().min(100),
  sheetPrice: z.number().min(0).optional().nullable(),
  kerf: z.number().min(0).max(10).default(3),
  grainEnabled: z.boolean().default(false),
  parts: z.array(partSchema),
  result: z.any().optional().nullable(),
});

export type OptimizeInput = z.infer<typeof optimizeSchema>;
export type LinearOptimizeInput = z.infer<typeof linearOptimizeSchema>;
export type CuttingProjectInput = z.infer<typeof cuttingProjectSchema>;
