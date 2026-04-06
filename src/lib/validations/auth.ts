import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

export const registerSchema = z
  .object({
    email: z.string().email('유효한 이메일을 입력하세요'),
    password: z
      .string()
      .min(8, '8자 이상 입력하세요')
      .regex(/[a-zA-Z]/, '영문을 포함하세요')
      .regex(/[0-9]/, '숫자를 포함하세요')
      .regex(/[^a-zA-Z0-9]/, '특수문자를 포함하세요'),
    confirmPassword: z.string(),
    name: z.string().min(2, '2자 이상 입력하세요'),
    phone: z
      .string()
      .regex(/^01[0-9]\d{7,8}$/, '유효한 전화번호를 입력하세요')
      .optional()
      .or(z.literal('')),
    agreedTerms: z.literal(true, {
      errorMap: () => ({ message: '이용약관에 동의해주세요' }),
    }),
    agreedPrivacy: z.literal(true, {
      errorMap: () => ({ message: '개인정보처리방침에 동의해주세요' }),
    }),
    agreedMarketing: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z
      .string()
      .min(8, '8자 이상 입력하세요')
      .regex(/[a-zA-Z]/, '영문을 포함하세요')
      .regex(/[0-9]/, '숫자를 포함하세요')
      .regex(/[^a-zA-Z0-9]/, '특수문자를 포함하세요'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

export const onboardingSchema = z.object({
  name: z.string().min(2, '2자 이상 입력하세요'),
  phone: z
    .string()
    .regex(/^01[0-9]\d{7,8}$/, '유효한 전화번호를 입력하세요')
    .optional()
    .or(z.literal('')),
  agreedTerms: z.literal(true, {
    errorMap: () => ({ message: '이용약관에 동의해주세요' }),
  }),
  agreedPrivacy: z.literal(true, {
    errorMap: () => ({ message: '개인정보처리방침에 동의해주세요' }),
  }),
  agreedMarketing: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
