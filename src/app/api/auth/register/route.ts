import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name, phone, agreedTerms, agreedPrivacy, agreedMarketing } =
      parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: '이미 가입된 이메일입니다' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        agreedTerms,
        agreedPrivacy,
        agreedMarketing,
      },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'tilea <noreply@tilea.kr>',
        to: email,
        subject: '[tilea] 이메일 인증을 완료해주세요',
        html: `
          <h2>tilea 이메일 인증</h2>
          <p>${name}님, 아래 링크를 클릭하여 이메일 인증을 완료해주세요.</p>
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#8B6914;color:white;text-decoration:none;border-radius:8px;">이메일 인증하기</a>
          <p>이 링크는 24시간 후 만료됩니다.</p>
        `,
      });
    } else {
      console.warn(`[DEV] 이메일 인증 링크: ${verifyUrl}`);
    }

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
