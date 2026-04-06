import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: '이메일을 입력하세요' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified) {
      return NextResponse.json({ message: '인증 메일이 발송되었습니다' });
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'tilea <noreply@tilea.kr>',
        to: email,
        subject: '[tilea] 이메일 인증을 완료해주���요',
        html: `
          <h2>tilea 이메일 인증</h2>
          <p>${user.name}님, 아래 링크를 클릭하여 이메일 ��증을 완료해주세요.</p>
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#8B6914;color:white;text-decoration:none;border-radius:8px;">이메일 인증하기</a>
          <p>이 링크는 24시간 후 만료됩니��.</p>
        `,
      });
    } else {
      console.warn(`[DEV] 이메일 인증 링크: ${verifyUrl}`);
    }

    return NextResponse.json({ message: '인증 메��이 발송되었습니다' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
