# 인증 시스템 구현 계획 (prd1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auth.js v5 기반 소셜/이메일 인증, 세션 관리, 보호 라우트 미들웨어를 구현한다.

**Architecture:** Auth.js v5(NextAuth)로 카카오/네이버/구글 OAuth + Credentials(이메일/비밀번호) 인증을 처리한다. PrismaAdapter가 User/Account를 DB에 동기화하고, JWT 세션 전략으로 서버리스 호환성을 확보한다. Redis는 로그인 실패 잠금에만 사용한다.

**Tech Stack:** Auth.js v5, @auth/prisma-adapter, bcryptjs, zod, react-hook-form, resend, ioredis

---

## File Map

### Create

| File | Responsibility |
|------|----------------|
| `src/lib/auth.config.ts` | Auth.js 설정 (Edge 호환 - providers 제외) |
| `src/lib/auth.ts` | Auth.js 메인 설정 (providers, adapter, callbacks) |
| `src/lib/validations/auth.ts` | Zod 검증 스키마 (login, register, forgot/reset password) |
| `src/types/next-auth.d.ts` | Auth.js 타입 확장 (role, id를 session에 추가) |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js API 핸들러 |
| `src/app/api/auth/register/route.ts` | 이메일 회원가입 API |
| `src/app/api/auth/forgot-password/route.ts` | 비밀번호 찾기 API |
| `src/app/api/auth/reset-password/route.ts` | 비밀번호 재설정 API |
| `src/app/api/auth/verify-email/route.ts` | 이메일 인증 확인 API |
| `src/components/auth/social-login-buttons.tsx` | 소셜 로그인 버튼 그룹 컴포넌트 |
| `src/components/auth/login-form.tsx` | 이메일 로그인 폼 컴포넌트 |
| `src/components/auth/register-form.tsx` | 회원가입 폼 컴포넌트 |
| `src/components/auth/forgot-password-form.tsx` | 비밀번호 찾기 폼 컴포넌트 |
| `src/app/(auth)/register/page.tsx` | 회원가입 페이지 |
| `src/app/(auth)/forgot-password/page.tsx` | 비밀번호 찾기 페이지 |
| `src/app/(auth)/reset-password/page.tsx` | 비밀번호 재설정 페이지 |
| `src/app/(auth)/verify-email/page.tsx` | 이메일 인증 완료 페이지 |
| `src/app/(auth)/error/page.tsx` | 인증 에러 페이지 |
| `src/middleware.ts` | 보호 라우트 미들웨어 |

### Modify

| File | Change |
|------|--------|
| `src/prisma/schema.prisma` | User 확장, Account/Session/VerificationToken 추가 |
| `src/package.json` | 인증 관련 의존성 추가 |
| `src/app/(auth)/login/page.tsx` | 플레이스홀더 → 실제 로그인 UI |
| `src/app/(auth)/layout.tsx` | 로그인 상태 리다이렉트 추가 |
| `src/app/(dashboard)/layout.tsx` | 세션 기반 사용자 정보 표시 |
| `.env` | AUTH 관련 환경변수 추가 |

---

## Task 1: 의존성 추가 + 환경변수 설정

**담당:** 오지훈(보안) + 임동혁(인프라)

**Files:**
- Modify: `src/package.json`
- Modify: `.env`

- [ ] **Step 1: package.json에 인증 의존성 추가**

`src/package.json`의 dependencies에 추가:
```json
"next-auth": "^5.0.0-beta.25",
"@auth/prisma-adapter": "^2.7.4",
"bcryptjs": "^2.4.3",
"zod": "^3.23.8",
"react-hook-form": "^7.53.2",
"@hookform/resolvers": "^3.9.1",
"resend": "^4.0.1"
```

devDependencies에 추가:
```json
"@types/bcryptjs": "^2.4.6"
```

- [ ] **Step 2: .env에 인증 환경변수 추가**

`.env` 파일 끝에 추가:
```env
# Auth.js
NEXTAUTH_URL=http://localhost:5679
NEXTAUTH_SECRET=tilea_dev_secret_key_change_in_production_2026

# 카카오 (https://developers.kakao.com 에서 발급)
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

# 네이버 (https://developers.naver.com 에서 발급)
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# 구글 (https://console.cloud.google.com 에서 발급)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Resend (https://resend.com 에서 발급)
RESEND_API_KEY=
```

- [ ] **Step 3: Docker 컨테이너에서 npm install 실행**

```bash
docker exec tilea.kr_app sh -c "npm install"
```

Expected: 신규 패키지 설치 완료, 에러 없음

- [ ] **Step 4: docker-compose.yml의 app 환경변수에 AUTH 변수 추가**

`docker-compose.yml`의 app service environment에 추가:
```yaml
- NEXTAUTH_URL=http://localhost:5679
- NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
- KAKAO_CLIENT_ID=${KAKAO_CLIENT_ID}
- KAKAO_CLIENT_SECRET=${KAKAO_CLIENT_SECRET}
- NAVER_CLIENT_ID=${NAVER_CLIENT_ID}
- NAVER_CLIENT_SECRET=${NAVER_CLIENT_SECRET}
- GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
- GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
- RESEND_API_KEY=${RESEND_API_KEY}
```

- [ ] **Step 5: 커밋**

```bash
git add src/package.json .env docker-compose.yml
git commit -m "chore: 인증 시스템 의존성 + 환경변수 추가 [검증:대기]"
```

---

## Task 2: Prisma 스키마 확장

**담당:** 한승우(DB)

**Files:**
- Modify: `src/prisma/schema.prisma`

- [ ] **Step 1: schema.prisma 전체 교체**

Replace `src/prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  emailVerified DateTime?  @map("email_verified")
  name          String?
  phone         String?
  image         String?
  password      String?
  role          UserRole   @default(GENERAL)
  status        UserStatus @default(ACTIVE)

  agreedTerms     Boolean @default(false) @map("agreed_terms")
  agreedPrivacy   Boolean @default(false) @map("agreed_privacy")
  agreedMarketing Boolean @default(false) @map("agreed_marketing")

  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  lastLoginAt DateTime? @map("last_login_at")

  accounts Account[]
  sessions Session[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

enum UserRole {
  GENERAL
  BUSINESS
  INSTRUCTOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  WITHDRAWN
}
```

- [ ] **Step 2: Prisma DB push + generate 실행**

```bash
docker exec tilea.kr_app sh -c "npx prisma db push && npx prisma generate"
```

Expected: `Your database is now in sync with your Prisma schema.` + `Generated Prisma Client`

- [ ] **Step 3: 커밋**

```bash
git add src/prisma/schema.prisma
git commit -m "feat: User/Account/Session/VerificationToken 스키마 확장 (#prd1) [검증:통과]"
```

---

## Task 3: Auth.js 설정 + 타입 확장

**담당:** 오지훈(보안)

**Files:**
- Create: `src/types/next-auth.d.ts`
- Create: `src/lib/auth.config.ts`
- Create: `src/lib/auth.ts`
- Create: `src/lib/validations/auth.ts`

- [ ] **Step 1: Auth.js 타입 확장 생성**

Create `src/types/next-auth.d.ts`:

```typescript
import { UserRole } from '@prisma/client';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
```

- [ ] **Step 2: Auth.js Edge 호환 설정 생성**

Create `src/lib/auth.config.ts`:

```typescript
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnAuth = nextUrl.pathname.startsWith('/auth');

      if (isOnDashboard || isOnAdmin) {
        return isLoggedIn;
      }

      if (isOnAuth && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
```

- [ ] **Step 3: Auth.js 메인 설정 생성**

Create `src/lib/auth.ts`:

```typescript
import NextAuth from 'next-auth';
import Kakao from 'next-auth/providers/kakao';
import Naver from 'next-auth/providers/naver';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/lib/auth.config';
import { loginSchema } from '@/lib/validations/auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
    }),
    Naver({
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        if (!user.emailVerified) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }
    },
  },
});
```

- [ ] **Step 4: Zod 검증 스키마 생성**

Create `src/lib/validations/auth.ts`:

```typescript
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

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
```

- [ ] **Step 5: 커밋**

```bash
git add src/types/next-auth.d.ts src/lib/auth.config.ts src/lib/auth.ts src/lib/validations/
git commit -m "feat: Auth.js 설정 + Zod 스키마 + 타입 확장 (#prd1) [검증:대기]"
```

---

## Task 4: Auth.js API 핸들러 + 미들웨어

**담당:** 오지훈(보안)

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/middleware.ts`

- [ ] **Step 1: Auth.js API route handler 생성**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

- [ ] **Step 2: 미들웨어 생성**

Create `src/middleware.ts` (프로젝트 루트 = `src/` 디렉토리):

```typescript
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api/health|_next/static|_next/image|favicon.ico|fonts|images).*)'],
};
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/auth/\[...nextauth\]/route.ts src/middleware.ts
git commit -m "feat: Auth.js API 핸들러 + 보호 라우트 미들웨어 (#prd1) [검증:대기]"
```

---

## Task 5: 회원가입 API + 이메일 인증 API + 비밀번호 찾기/재설정 API

**담당:** 오지훈(보안)

**Files:**
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/app/api/auth/verify-email/route.ts`
- Create: `src/app/api/auth/forgot-password/route.ts`
- Create: `src/app/api/auth/reset-password/route.ts`

- [ ] **Step 1: 회원가입 API 생성**

Create `src/app/api/auth/register/route.ts`:

```typescript
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

    // 이메일 인증 토큰 생성
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Resend로 인증 이메일 발송 (API 키가 없으면 로그만)
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
```

- [ ] **Step 2: 이메일 인증 API 생성**

Create `src/app/api/auth/verify-email/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=missing_token', request.url));
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=invalid_token', request.url));
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.redirect(new URL('/auth/verify-email?error=expired_token', request.url));
  }

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(new URL('/auth/verify-email?success=true', request.url));
}
```

- [ ] **Step 3: 비밀번호 찾기 API 생성**

Create `src/app/api/auth/forgot-password/route.ts`:

```typescript
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

    // 보안: 이메일 존재 여부와 관계없이 동일 응답
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.password) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1시간

      // 기존 토큰 삭제 후 새로 생성
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
```

- [ ] **Step 4: 비밀번호 재설정 API 생성**

Create `src/app/api/auth/reset-password/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, newPassword } = parsed.data;

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      if (verificationToken) {
        await prisma.verificationToken.delete({ where: { token } });
      }
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 토큰입니다' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
```

- [ ] **Step 5: 커밋**

```bash
git add src/app/api/auth/register/ src/app/api/auth/verify-email/ src/app/api/auth/forgot-password/ src/app/api/auth/reset-password/
git commit -m "feat: 회원가입/이메일인증/비밀번호찾기/재설정 API (#prd1) [검증:대기]"
```

---

## Task 6: 로그인 실패 잠금 (Redis)

**담당:** 오지훈(보안)

**Files:**
- Modify: `src/lib/auth.ts` (Credentials authorize에 잠금 로직 추가)

- [ ] **Step 1: auth.ts의 Credentials authorize 함수를 잠금 로직으로 교체**

`src/lib/auth.ts`에서 Credentials provider의 `authorize` 함수를 다음으로 교체:

```typescript
Credentials({
  async authorize(credentials) {
    const parsed = loginSchema.safeParse(credentials);
    if (!parsed.success) return null;

    const { email, password } = parsed.data;

    // Redis 로그인 잠금 체크
    const { redis } = await import('@/lib/redis');
    const attemptsKey = `login_attempts:${email}`;
    const attempts = await redis.get(attemptsKey);

    if (attempts && parseInt(attempts) >= 5) {
      throw new Error('ACCOUNT_LOCKED');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      // 실패 카운트 증가
      await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, 1800); // 30분
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, 1800);
      return null;
    }

    if (!user.emailVerified) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    // 로그인 성공 → 실패 카운트 삭제
    await redis.del(attemptsKey);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
  },
}),
```

- [ ] **Step 2: 커밋**

```bash
git add src/lib/auth.ts
git commit -m "feat: Redis 기반 로그인 실패 잠금 (5회/30분) (#prd1) [검증:대기]"
```

---

## Task 7: 인증 UI 컴포넌트

**담당:** 신예진(FE)

**Files:**
- Create: `src/components/auth/social-login-buttons.tsx`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/register-form.tsx`
- Create: `src/components/auth/forgot-password-form.tsx`

- [ ] **Step 1: 소셜 로그인 버튼 컴포넌트 생성**

Create `src/components/auth/social-login-buttons.tsx`:

```tsx
'use client';

import { signIn } from 'next-auth/react';

export function SocialLoginButtons() {
  return (
    <div className="space-y-3">
      <button
        onClick={() => signIn('kakao', { callbackUrl: '/dashboard' })}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] px-4 py-3 font-medium text-[#191919] transition-opacity hover:opacity-90"
      >
        카카오로 시작하기
      </button>
      <button
        onClick={() => signIn('naver', { callbackUrl: '/dashboard' })}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#03C75A] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
      >
        네이버로 시작하기
      </button>
      <button
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-3 font-medium text-foreground transition-opacity hover:opacity-90"
      >
        Google로 시작하기
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 이메일 로그인 폼 컴포넌트 생성**

Create `src/components/auth/login-form.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      if (result.error.includes('ACCOUNT_LOCKED')) {
        setError('로그인 시도가 5회 초과되었습니다. 30분 후 다시 시도해주세요.');
      } else if (result.error.includes('EMAIL_NOT_VERIFIED')) {
        setError('이메일 인증을 완료해주세요. 가입 시 받은 인증 메일을 확인하세요.');
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
          이메일
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="이메일을 입력하세요"
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="비밀번호를 입력하세요"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: 회원가입 폼 컴포넌트 생성**

Create `src/components/auth/register-form.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';

export function RegisterForm() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreedMarketing: false },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setIsLoading(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || '회원가입에 실패했습니다');
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-xl font-bold text-foreground">인증 이메일을 확인하세요</h2>
        <p className="text-muted">
          입력하신 이메일로 인증 링크를 발송했습니다.
          <br />
          이메일을 확인하여 가입을 완료해주세요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
          이름 <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="이름을 입력하세요"
        />
        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-foreground">
          이메일 <span className="text-destructive">*</span>
        </label>
        <input
          id="reg-email"
          type="email"
          {...register('email')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="이메일을 입력하세요"
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-foreground">
          비밀번호 <span className="text-destructive">*</span>
        </label>
        <input
          id="reg-password"
          type="password"
          {...register('password')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="8자 이상, 영문+숫자+특수문자"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          비밀번호 확인 <span className="text-destructive">*</span>
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="비밀번호를 다시 입력하세요"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-foreground">
          전화번호
        </label>
        <input
          id="phone"
          type="tel"
          {...register('phone')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="01012345678 (선택)"
        />
        {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2 pt-2">
        <label className="flex items-start gap-2">
          <input type="checkbox" {...register('agreedTerms')} className="mt-1" />
          <span className="text-sm">
            <span className="text-destructive">[필수]</span> 이용약관에 동의합니다
          </span>
        </label>
        {errors.agreedTerms && (
          <p className="text-sm text-destructive">{errors.agreedTerms.message}</p>
        )}

        <label className="flex items-start gap-2">
          <input type="checkbox" {...register('agreedPrivacy')} className="mt-1" />
          <span className="text-sm">
            <span className="text-destructive">[필수]</span> 개인정보처리방침에 동의합니다
          </span>
        </label>
        {errors.agreedPrivacy && (
          <p className="text-sm text-destructive">{errors.agreedPrivacy.message}</p>
        )}

        <label className="flex items-start gap-2">
          <input type="checkbox" {...register('agreedMarketing')} className="mt-1" />
          <span className="text-sm">[선택] 마케팅 정보 수신에 동의합니다</span>
        </label>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? '가입 처리 중...' : '회원가입'}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: 비밀번호 찾기 폼 컴포넌트 생성**

Create `src/components/auth/forgot-password-form.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth';

export function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setIsLoading(false);

    if (!res.ok) {
      setError('요청 처리에 실패했습니다');
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-xl font-bold text-foreground">이메일을 확인하세요</h2>
        <p className="text-muted">
          비밀번호 재설정 링크를 발송했습니다.
          <br />
          이메일을 확인해주세요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="fp-email" className="mb-1 block text-sm font-medium text-foreground">
          이메일
        </label>
        <input
          id="fp-email"
          type="email"
          {...register('email')}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="가입한 이메일을 입력하세요"
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? '처리 중...' : '비밀번호 재설정 링크 보내기'}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: 커밋**

```bash
git add src/components/auth/
git commit -m "feat: 인증 UI 컴포넌트 (소셜버튼/로그인폼/회원가입폼/비밀번호찾기) (#prd1) [검증:대기]"
```

---

## Task 8: 인증 페이지 조립

**담당:** 신예진(FE)

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(auth)/forgot-password/page.tsx`
- Create: `src/app/(auth)/reset-password/page.tsx`
- Create: `src/app/(auth)/verify-email/page.tsx`
- Create: `src/app/(auth)/error/page.tsx`

- [ ] **Step 1: 로그인 페이지 교체**

Replace `src/app/(auth)/login/page.tsx`:

```tsx
import Link from 'next/link';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-primary">tilea</h1>
        <p className="text-muted">목공·목재 산업 종합 플랫폼</p>
      </div>

      <SocialLoginButtons />

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted">또는</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <LoginForm />

      <div className="mt-6 space-y-2 text-center text-sm">
        <Link href="/auth/forgot-password" className="text-muted hover:text-primary">
          비밀번호를 잊으셨나요?
        </Link>
        <p className="text-muted">
          아직 회원이 아니신가요?{' '}
          <Link href="/auth/register" className="font-medium text-primary hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 회원가입 페이지 생성**

Create `src/app/(auth)/register/page.tsx`:

```tsx
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-primary">회원가입</h1>
        <p className="text-muted">tilea에 오신 것을 환영합니다</p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-muted">
        이미 회원이신가요?{' '}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: 비밀번호 찾기 페이지 생성**

Create `src/app/(auth)/forgot-password/page.tsx`:

```tsx
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-primary">비밀번호 찾기</h1>
        <p className="text-muted">가입한 이메일로 재설정 링크를 보내드립니다</p>
      </div>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/auth/login" className="text-primary hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: 비밀번호 재설정 페이지 생성**

Create `src/app/(auth)/reset-password/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token || '' },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setIsLoading(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || '비밀번호 재설정에 실패했습니다');
      return;
    }

    setSuccess(true);
  };

  if (!token) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <p className="text-destructive">유효하지 않은 링크입니다.</p>
        <Link href="/auth/login" className="mt-4 inline-block text-primary hover:underline">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-foreground">비밀번호가 변경되었습니다</h2>
        <p className="mb-4 text-muted">새 비밀번호로 로그인해주세요.</p>
        <Link
          href="/auth/login"
          className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white"
        >
          로그인
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-primary">비밀번호 재설정</h1>
        <p className="text-muted">새로운 비밀번호를 입력해주세요</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('token')} />

        <div>
          <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-foreground">
            새 비밀번호
          </label>
          <input
            id="newPassword"
            type="password"
            {...register('newPassword')}
            className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="8자 이상, 영문+숫자+특수문자"
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-destructive">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="rp-confirm"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            비밀번호 확인
          </label>
          <input
            id="rp-confirm"
            type="password"
            {...register('confirmPassword')}
            className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="비밀번호를 다시 입력하세요"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? '처리 중...' : '비밀번호 변경'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: 이메일 인증 결과 페이지 생성**

Create `src/app/(auth)/verify-email/page.tsx`:

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    missing_token: '인증 링크가 올바르지 않습니다.',
    invalid_token: '유효하지 않은 인증 링크입니다.',
    expired_token: '인증 링크가 만료되었습니다. 다시 회원가입해주세요.',
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
      {success ? (
        <>
          <h2 className="mb-4 text-xl font-bold text-success">이메일 인증 완료</h2>
          <p className="mb-6 text-muted">이메일 인증이 완료되었습니다. 로그인해주세요.</p>
          <Link
            href="/auth/login"
            className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white"
          >
            로그인
          </Link>
        </>
      ) : (
        <>
          <h2 className="mb-4 text-xl font-bold text-destructive">인증 실패</h2>
          <p className="mb-6 text-muted">
            {error ? errorMessages[error] || '알 수 없는 오류가 발생했습니다.' : '인증 처리 중...'}
          </p>
          <Link
            href="/auth/register"
            className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white"
          >
            다시 가입하기
          </Link>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6: 인증 에러 페이지 생성**

Create `src/app/(auth)/error/page.tsx`:

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: '서버 설정 오류가 발생했습니다.',
    AccessDenied: '접근이 거부되었습니다.',
    Verification: '인증 토큰이 만료되었거나 이미 사용되었습니다.',
    Default: '인증 처리 중 오류가 발생했습니다.',
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-destructive">인증 오류</h2>
      <p className="mb-6 text-muted">
        {error ? errorMessages[error] || errorMessages.Default : errorMessages.Default}
      </p>
      <Link
        href="/auth/login"
        className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white"
      >
        로그인으로 돌아가기
      </Link>
    </div>
  );
}
```

- [ ] **Step 7: 커밋**

```bash
git add src/app/\(auth\)/
git commit -m "feat: 인증 페이지 조립 (로그인/회원가입/비밀번호찾기/재설정/인증/에러) (#prd1) [검증:대기]"
```

---

## Task 9: 대시보드 레이아웃 세션 통합 + Auth Provider

**담당:** 신예진(FE)

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: 루트 레이아웃에 SessionProvider 추가**

`src/app/layout.tsx`를 수정하여 next-auth SessionProvider를 감싸야 하지만, App Router에서는 Server Component에서 직접 SessionProvider를 못 쓰므로 별도 클라이언트 래퍼가 필요.

Create `src/components/auth/session-provider.tsx`:

```tsx
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

Modify `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { SessionProvider } from '@/components/auth/session-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | tilea',
    default: 'tilea - 목공·목재 산업 종합 플랫폼',
  },
  description:
    '재단 계산, 견적 관리, 재고 관리, 커뮤니티, 마켓플레이스까지. 목공·목재 산업을 위한 올인원 SaaS 플랫폼.',
  keywords: ['목공', '목재', '재단계산기', '견적서', '재고관리', '목공커뮤니티'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 대시보드 레이아웃에 세션 기반 사용자 정보 표시**

Replace `src/app/(dashboard)/layout.tsx`:

```tsx
import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            tilea
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <span className="text-muted">{session.user.name || session.user.email}</span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/auth/login' });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-gray-50"
              >
                로그아웃
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/components/auth/session-provider.tsx src/app/layout.tsx src/app/\(dashboard\)/layout.tsx
git commit -m "feat: SessionProvider + 대시보드 세션 통합 + 로그아웃 (#prd1) [검증:대기]"
```

---

## Task 10: Docker 재기동 + 전체 검증

**담당:** 전체 팀

- [ ] **Step 1: Docker 컨테이너 재생성 (npm install 반영)**

```bash
cd /data/successbank/projects/tilea.kr
docker-compose stop app && docker-compose rm -f app && docker-compose up -d app
```

- [ ] **Step 2: npm install + prisma 완료 대기 (2분)**

```bash
sleep 120 && docker-compose logs app 2>&1 | tail -10
```

Expected: `Ready in Xms`

- [ ] **Step 3: Prisma DB push (스키마 적용)**

```bash
docker exec tilea.kr_app sh -c "apk add --no-cache openssl && npx prisma db push"
```

Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 4: 페이지 접속 확인**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5679
curl -s -o /dev/null -w "%{http_code}" http://localhost:5679/auth/login
curl -s -o /dev/null -w "%{http_code}" http://localhost:5679/auth/register
curl -s -o /dev/null -w "%{http_code}" http://localhost:5679/auth/forgot-password
curl -s http://localhost:5679/api/health
```

Expected: 모두 200, health API 정상 응답

- [ ] **Step 5: 미들웨어 동작 확인 (비로그인 → 리다이렉트)**

```bash
curl -s -o /dev/null -w "%{http_code}" -L http://localhost:5679/dashboard
```

Expected: 200 (로그인 페이지로 리다이렉트되어 로그인 페이지 렌더링)

- [ ] **Step 6: 회원가입 API 테스트**

```bash
curl -s -X POST http://localhost:5679/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@tilea.kr","password":"Test1234!","confirmPassword":"Test1234!","name":"테스터","agreedTerms":true,"agreedPrivacy":true,"agreedMarketing":false}'
```

Expected: 201 응답, `{"user":{"id":"...","email":"test@tilea.kr","name":"테스터"}}`

- [ ] **Step 7: Lint + TypeScript 체크**

```bash
docker exec tilea.kr_app sh -c "npx next lint && npx tsc --noEmit"
```

Expected: 에러 0건

- [ ] **Step 8: 검증 통과 시 최종 커밋**

```bash
git add -A
git commit -m "verify: prd1 인증 시스템 전체 검증 완료 [검증:통합통과]"
```

---

## 검증 체크리스트

| # | 검증 항목 | Task |
|---|----------|------|
| ✅-1~3 | 소셜 로그인 (카카오/네이버/구글) | Task 3-4 (OAuth 키 설정 시) |
| ✅-4 | 이메일 회원가입 | Task 5, 10 |
| ✅-5 | 이메일 인증 후 로그인 | Task 5 |
| ✅-6 | 비밀번호 찾기 | Task 5 |
| ✅-7 | 비밀번호 재설정 | Task 5 |
| ✅-8 | 로그아웃 | Task 9 |
| ✅-9 | 미들웨어 동작 | Task 4, 10 |
| ✅-10 | 로그인 잠금 | Task 6 |
| ✅-11 | 서버 에러 0건 | Task 10 |
| ✅-12 | 브라우저 에러 0건 | Task 10 |
