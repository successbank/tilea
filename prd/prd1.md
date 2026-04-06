# PRD 1: 인증 시스템 & 회원 관리

> **프로젝트**: tilea.kr | **담당PM**: 이수진(기술) | **품질PM**: 박준혁  
> **개발**: 오지훈(보안) + 김태현(BE) + 신예진(FE) | **설계**: 이동진(시스템)  
> **의존관계**: prd0 완료 필수 | **후속**: prd2(사업자 프로필)

---

## 1.1 기능 명세

### F1-1. 소셜 로그인 (카카오/네이버/구글)

```yaml
기능ID: F1-1
기능명: 소셜 로그인
담당: 오지훈(BE) + 신예진(FE)
우선순위: P0

설명: |
  Auth.js v5를 사용하여 카카오, 네이버, 구글 OAuth 로그인 구현.
  로그인 시 신규 회원이면 자동 가입, 기존 회원이면 세션 생성.

입력:
  - OAuth Provider 선택 (카카오/네이버/구글)
  - Provider 인증 후 콜백 데이터 (email, name, image)

출력:
  - JWT 세션 토큰
  - User 레코드 (신규 시 생성)
  - 리다이렉트: /dashboard (기존회원) 또는 /auth/onboarding (신규)

API:
  - GET /api/auth/signin → Auth.js 기본
  - GET /api/auth/callback/kakao → 카카오 콜백
  - GET /api/auth/callback/naver → 네이버 콜백
  - GET /api/auth/callback/google → 구글 콜백
  - GET /api/auth/session → 현재 세션 조회
  - POST /api/auth/signout → 로그아웃

화면:
  - /auth/login: 로그인 페이지
  - /auth/onboarding: 신규 회원 추가 정보 입력

완료기준:
  - 카카오 로그인 → 세션 생성 → 대시보드 이동
  - 네이버 로그인 → 동일
  - 구글 로그인 → 동일
  - 로그아웃 → 세션 삭제 → 로그인 페이지 이동
  - 동일 이메일 다른 Provider로 로그인 시 계정 연동
```

### F1-2. 이메일/비밀번호 로그인

```yaml
기능ID: F1-2
기능명: 이메일/비밀번호 로그인
담당: 오지훈(BE) + 신예진(FE)
우선순위: P1

API:
  - POST /api/auth/register
    요청: { email, password, name, phone }
    응답: { user, session }
  - POST /api/auth/credentials/login
    요청: { email, password }
    응답: { session }
  - POST /api/auth/forgot-password
    요청: { email }
    응답: { message: "이메일 발송됨" }
  - POST /api/auth/reset-password
    요청: { token, newPassword }
    응답: { success }

화면:
  - /auth/register: 회원가입
  - /auth/forgot-password: 비밀번호 찾기
  - /auth/reset-password: 비밀번호 재설정

보안:
  - bcrypt 해싱 (saltRounds: 12)
  - 비밀번호 정책: 최소 8자, 영문+숫자+특수문자
  - 로그인 실패 5회 → 30분 잠금 (Redis)
  - 이메일 인증 필수 (Resend)

완료기준:
  - 회원가입 → 이메일 인증 → 로그인 성공
  - 비밀번호 찾기 → 이메일 수신 → 재설정 완료
  - 잘못된 비밀번호 5회 → 계정 잠금 확인
```

### F1-3. 세션 관리

```yaml
기능ID: F1-3
기능명: 세션 관리
담당: 오지훈(BE)

설명: JWT + Redis 기반 세션 관리

구현:
  - JWT Access Token: 15분 만료
  - Refresh Token: 7일 만료 (Redis 저장)
  - 미들웨어: 보호된 라우트 접근 시 세션 확인
  - 다중 기기 로그인 지원

완료기준:
  - 보호된 페이지 비로그인 접근 → /auth/login 리다이렉트
  - 토큰 만료 → 자동 갱신 → 사용자 경험 무단절
  - 로그아웃 → Redis에서 Refresh Token 삭제
```

---

## 1.2 DB 스키마

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  phone         String?
  image         String?
  password      String?   // 이메일 가입 시만
  role          UserRole  @default(GENERAL)
  status        UserStatus @default(ACTIVE)
  
  // 약관 동의
  agreedTerms       Boolean @default(false)
  agreedPrivacy     Boolean @default(false)
  agreedMarketing   Boolean @default(false)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  accounts      Account[]
  sessions      Session[]
  
  // 관계
  businessProfile  BusinessProfile?
  projects         Project[]
  estimates        Estimate[]
  posts            Post[]
  reviews          Review[]
  
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
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
  GENERAL      // 일반 회원
  BUSINESS     // 사업자 회원
  INSTRUCTOR   // 강사
  ADMIN        // 관리자
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  WITHDRAWN
}
```

---

## 1.3 Auth.js 설정 코드 가이드

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth"
import Kakao from "next-auth/providers/kakao"
import Naver from "next-auth/providers/naver" 
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    // Naver, Google, Credentials 동일 패턴
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      session.user.id = token.id
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
})
```

---

## 1.4 오픈소스 활용

| 패키지 | 용도 | npm 주간 다운로드 |
|--------|------|-----------------|
| `next-auth` (Auth.js v5) | OAuth + 세션 | 2M+ |
| `bcryptjs` | 비밀번호 해싱 | 3M+ |
| `zod` | 입력값 검증 | 5M+ |
| `resend` | 이메일 발송 | 200K+ |
| `@prisma/client` | DB ORM | 4M+ |

---

## 1.5 개발 태스크 (TDD 포함)

| # | 태스크 | 담당 | 테스트 | 예상 시간 |
|---|--------|------|--------|-----------|
| T1-1 | Auth.js 설정 + 카카오 Provider | 오지훈 | 카카오 로그인 → 세션 확인 | 4h |
| T1-2 | 네이버 Provider 추가 | 오지훈 | 네이버 로그인 → 세션 확인 | 2h |
| T1-3 | 구글 Provider 추가 | 오지훈 | 구글 로그인 → 세션 확인 | 2h |
| T1-4 | User Prisma 모델 + 마이그레이션 | 한승우 | DB push → 테이블 확인 | 2h |
| T1-5 | 이메일/비밀번호 회원가입 API | 오지훈 | POST /api/auth/register → 201 | 4h |
| T1-6 | 이메일 인증 (Resend) | 오지훈 | 인증 이메일 수신 확인 | 3h |
| T1-7 | 비밀번호 찾기/재설정 API | 오지훈 | 재설정 플로우 전체 통과 | 3h |
| T1-8 | 로그인 UI (카카오/네이버/구글/이메일) | 신예진 | 각 버튼 클릭 → 인증 플로우 | 4h |
| T1-9 | 회원가입 UI + 폼 유효성 | 신예진 | 유효성 에러 표시, 제출 성공 | 4h |
| T1-10 | 미들웨어 (보호 라우트) | 오지훈 | 비로그인 접근 → 리다이렉트 | 2h |
| T1-11 | 로그인 실패 잠금 (Redis) | 오지훈 | 5회 실패 → 잠금 확인 | 2h |
| T1-12 | 통합 테스트 | 전체 | 전체 인증 플로우 E2E | 3h |

---

## 1.6 개발 완료 체크리스트

| # | 검증 항목 | 검증 방법 | 상태 |
|---|----------|-----------|------|
| ✅-1 | 카카오 로그인 성공 | 카카오 버튼 → 인증 → /dashboard 이동 | ⬜ |
| ✅-2 | 네이버 로그인 성공 | 네이버 버튼 → 인증 → /dashboard 이동 | ⬜ |
| ✅-3 | 구글 로그인 성공 | 구글 버튼 → 인증 → /dashboard 이동 | ⬜ |
| ✅-4 | 이메일 회원가입 성공 | 이메일+비밀번호 입력 → 인증 이메일 수신 | ⬜ |
| ✅-5 | 이메일 인증 후 로그인 | 인증 링크 클릭 → 로그인 성공 | ⬜ |
| ✅-6 | 비밀번호 찾기 | 이메일 입력 → 재설정 이메일 수신 | ⬜ |
| ✅-7 | 비밀번호 재설정 | 새 비밀번호 설정 → 로그인 성공 | ⬜ |
| ✅-8 | 로그아웃 | 로그아웃 버튼 → 세션 삭제 → 로그인 페이지 | ⬜ |
| ✅-9 | 미들웨어 동작 | 비로그인으로 /dashboard 접근 → /auth/login 리다이렉트 | ⬜ |
| ✅-10 | 로그인 잠금 | 5회 실패 → "30분 후 다시 시도" 메시지 | ⬜ |
| ✅-11 | 서버 에러 로그 0건 | 전체 플로우 진행 후 서버 콘솔 확인 | ⬜ |
| ✅-12 | 브라우저 콘솔 에러 0건 | 전체 UI 확인 후 콘솔 확인 | ⬜ |

---

> **다음 문서**: [prd2.md] 사업자 프로필 & 역할 시스템
