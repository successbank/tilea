# tilea.kr 인증 시스템 설계 문서 (prd1)

> **작성일**: 2026-04-06 | **범위**: prd1 전체 (F1-1, F1-2, F1-3)
> **PM**: 이수진(기술) | **개발**: 오지훈(보안) + 김태현(BE) + 신예진(FE)
> **의존**: prd0 완료 (Next.js 14 + Docker 환경)

---

## 1. 목표

Auth.js v5 기반 인증 시스템을 구현하여 소셜 로그인(카카오/네이버/구글), 이메일/비밀번호 로그인, 세션 관리, 보호 라우트 미들웨어를 완성한다.

## 2. 핵심 설계 결정

| 결정 | 선택 | 근거 |
|------|------|------|
| 세션 전략 | Auth.js JWT (`strategy: "jwt"`) | 서버리스 호환, DB 부하 없음 |
| DB 동기화 | PrismaAdapter | User/Account 자동 관리 |
| Refresh Token | Auth.js 자체 JWT 갱신 사용 | 별도 Redis RT 관리 불필요 (복잡도 제거) |
| Redis 용도 | 로그인 실패 잠금만 | `login_attempts:{email}` TTL 기반 |
| 이메일 발송 | Resend | 트랜잭션 이메일 (인증, 비밀번호 재설정) |
| 폼 검증 | React Hook Form + Zod | 클라이언트/서버 동일 스키마 |
| 비밀번호 해싱 | bcryptjs (saltRounds: 12) | 표준, 순수 JS (Alpine 호환) |

## 3. 파일 구조

### 신규 생성

| File | Responsibility |
|------|----------------|
| `src/lib/auth.ts` | Auth.js 설정 (providers, adapter, callbacks, pages) |
| `src/lib/auth.config.ts` | Provider 설정 분리 (Edge Runtime 미들웨어 호환) |
| `src/lib/validations/auth.ts` | Zod 스키마 (login, register, forgot-password, reset-password) |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js API 핸들러 (GET/POST) |
| `src/app/api/auth/register/route.ts` | 이메일 회원가입 API |
| `src/app/api/auth/forgot-password/route.ts` | 비밀번호 찾기 API |
| `src/app/api/auth/reset-password/route.ts` | 비밀번호 재설정 API |
| `src/app/api/auth/verify-email/route.ts` | 이메일 인증 확인 API |
| `src/app/(auth)/login/page.tsx` | 로그인 페이지 (소셜 + 이메일) |
| `src/app/(auth)/register/page.tsx` | 회원가입 페이지 |
| `src/app/(auth)/forgot-password/page.tsx` | 비밀번호 찾기 페이지 |
| `src/app/(auth)/reset-password/page.tsx` | 비밀번호 재설정 페이지 |
| `src/app/(auth)/verify-email/page.tsx` | 이메일 인증 완료 페이지 |
| `src/app/(auth)/error/page.tsx` | 인증 에러 페이지 |
| `src/middleware.ts` | 보호 라우트 미들웨어 |
| `src/components/auth/social-login-buttons.tsx` | 소셜 로그인 버튼 그룹 |
| `src/components/auth/login-form.tsx` | 이메일 로그인 폼 |
| `src/components/auth/register-form.tsx` | 회원가입 폼 |
| `src/components/auth/forgot-password-form.tsx` | 비밀번호 찾기 폼 |
| `src/types/next-auth.d.ts` | Auth.js 타입 확장 (role, id) |

### 수정

| File | Change |
|------|--------|
| `src/prisma/schema.prisma` | User 확장 + Account/Session/VerificationToken 추가 |
| `src/app/(auth)/layout.tsx` | 인증 상태에 따른 리다이렉트 로직 추가 |
| `src/app/(dashboard)/layout.tsx` | 세션 기반 사용자 정보 표시 |
| `src/package.json` | 신규 의존성 추가 |
| `.env` | OAuth 키, NEXTAUTH_SECRET, RESEND_API_KEY 추가 |

## 4. DB 스키마

```prisma
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

## 5. Auth.js 설정 구조

### auth.config.ts (Edge 호환 - 미들웨어에서 import)

```typescript
// providers만 정의 (Prisma 등 Node.js API 미포함)
export const authConfig = {
  pages: { signIn: "/auth/login", error: "/auth/error" },
  callbacks: {
    authorized({ auth, request }) {
      // 보호 라우트 체크 로직
    },
    jwt({ token, user }) {
      if (user) { token.role = user.role; token.id = user.id; }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    },
  },
  providers: [], // auth.ts에서 확장
};
```

### auth.ts (Node.js 전용 - API 핸들러에서 import)

```typescript
// PrismaAdapter, 모든 Provider 포함
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [Kakao, Naver, Google, Credentials],
});
```

### middleware.ts

```typescript
// auth.config.ts만 import (Edge Runtime)
// 보호 경로: /dashboard/*, /admin/*
// 공개 경로: /, /auth/*, /api/auth/*, /api/health
```

## 6. API 엔드포인트

### Auth.js 자동 생성

| Method | Path | 기능 |
|--------|------|------|
| GET/POST | `/api/auth/[...nextauth]` | Auth.js 전체 핸들러 |

### 커스텀 API

| Method | Path | 기능 | 입력 | 출력 |
|--------|------|------|------|------|
| POST | `/api/auth/register` | 이메일 회원가입 | `{email, password, name, phone, agreedTerms, agreedPrivacy}` | `{user}` 201 |
| POST | `/api/auth/forgot-password` | 비밀번호 찾기 | `{email}` | `{message}` 200 |
| POST | `/api/auth/reset-password` | 비밀번호 재설정 | `{token, newPassword}` | `{success}` 200 |
| GET | `/api/auth/verify-email?token=xxx` | 이메일 인증 | query: token | redirect /auth/login |

## 7. 페이지 & 컴포넌트

### 페이지

| Path | 컴포넌트 | 기능 |
|------|---------|------|
| `/auth/login` | SocialLoginButtons + LoginForm | 소셜 3종 + 이메일 로그인 |
| `/auth/register` | RegisterForm | 이메일, 비밀번호, 이름, 전화번호, 약관 동의 |
| `/auth/forgot-password` | ForgotPasswordForm | 이메일 입력 → 재설정 링크 발송 |
| `/auth/reset-password?token=xxx` | ResetPasswordForm | 새 비밀번호 입력 |
| `/auth/verify-email?token=xxx` | 인증 결과 표시 | 성공/실패 메시지 + 로그인 링크 |
| `/auth/error` | 에러 메시지 | Auth.js 에러 코드별 메시지 |

### 컴포넌트

**SocialLoginButtons**: 카카오(#FEE500), 네이버(#03C75A), Google(white border) 버튼 3개. `signIn("kakao")` 등 Auth.js signIn 호출.

**LoginForm**: 이메일 + 비밀번호 입력, Zod 검증, Auth.js Credentials signIn 호출, 에러 표시(잠금 포함).

**RegisterForm**: 이메일, 비밀번호(확인), 이름, 전화번호, 약관 동의(필수2+선택1) 체크박스, Zod 검증, POST /api/auth/register 호출.

**ForgotPasswordForm**: 이메일 입력, POST /api/auth/forgot-password 호출, 성공 메시지 표시.

## 8. Zod 검증 스키마

```typescript
// 로그인
loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  password: z.string().min(1, "비밀번호를 입력하세요"),
});

// 회원가입
registerSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, "8자 이상")
    .regex(/[a-zA-Z]/, "영문 포함")
    .regex(/[0-9]/, "숫자 포함")
    .regex(/[^a-zA-Z0-9]/, "특수문자 포함"),
  confirmPassword: z.string(),
  name: z.string().min(2, "2자 이상"),
  phone: z.string().regex(/^01[0-9]-?\d{3,4}-?\d{4}$/).optional(),
  agreedTerms: z.literal(true, { errorMap: () => ({ message: "필수 동의" }) }),
  agreedPrivacy: z.literal(true, { errorMap: () => ({ message: "필수 동의" }) }),
  agreedMarketing: z.boolean().default(false),
}).refine(d => d.password === d.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

// 비밀번호 찾기
forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// 비밀번호 재설정
resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});
```

## 9. 로그인 실패 잠금 (Redis)

```
키: login_attempts:{email}
값: 실패 횟수 (number)
TTL: 1800초 (30분)

로직:
1. 로그인 시도 시 Redis에서 현재 실패 횟수 조회
2. 5 이상이면 → 즉시 "30분 후 다시 시도하세요" 반환
3. 로그인 실패 시 → INCR + EXPIRE 1800
4. 로그인 성공 시 → DEL
```

## 10. 환경변수 추가

```env
# Auth.js
NEXTAUTH_URL=http://localhost:5679
NEXTAUTH_SECRET=(openssl rand -base64 32로 생성)

# 카카오
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

# 네이버
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# 구글
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Resend
RESEND_API_KEY=
```

로컬 개발 시 OAuth 키가 없어도 이메일/비밀번호 로그인과 보호 라우트는 동작해야 한다. 소셜 로그인 버튼은 키 미설정 시 비활성화 처리.

## 11. 보호 라우트 정책

| 경로 패턴 | 접근 조건 |
|----------|----------|
| `/` | 공개 |
| `/auth/*` | 공개 (로그인 상태면 /dashboard로 리다이렉트) |
| `/api/auth/*` | 공개 (Auth.js 핸들러) |
| `/api/health` | 공개 |
| `/dashboard/*` | 인증 필수 |
| `/admin/*` | ADMIN 역할 필수 |

## 12. 검증 기준

```
F1-1 소셜 로그인:
  ✅ 카카오 버튼 → 카카오 인증 → /dashboard 이동
  ✅ 네이버 버튼 → 네이버 인증 → /dashboard 이동
  ✅ 구글 버튼 → 구글 인증 → /dashboard 이동
  ✅ 동일 이메일 다른 Provider → 계정 연동

F1-2 이메일/비밀번호:
  ✅ 회원가입 → 인증 이메일 수신 → 인증 → 로그인 성공
  ✅ 비밀번호 정책 미충족 → Zod 에러 표시
  ✅ 비밀번호 찾기 → 이메일 수신 → 재설정 → 로그인 성공

F1-3 세션/미들웨어:
  ✅ 비로그인 /dashboard 접근 → /auth/login 리다이렉트
  ✅ 로그아웃 → 세션 삭제 → /auth/login 이동
  ✅ 5회 실패 → "30분 후 다시 시도" 메시지
  ✅ 서버/브라우저 콘솔 에러 0건
```
