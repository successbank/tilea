export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: '유효한 이메일을 입력하세요' }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.password) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
      await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'tilea <noreply@tilea.kr>',
          to: email,
          subject: '[tilea] 비밀번호를 재설정해주세요',
          html: `
            <h2>비밀번호 재설정</h2>
            <p>아래 링크를 클릭하여 비밀번호를 재설정해주세요.</p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#8B6914;color:white;text-decoration:none;border-radius:8px;">비밀번호 재설정</a>
            <p>이 링크는 1시간 후 만료됩니다.</p>
          `,
        });
      } else {
        console.warn(`[DEV] 비밀번호 재설정 링크: ${resetUrl}`);
      }
    }

    return NextResponse.json({ message: '이메일이 발송되었습니다' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
