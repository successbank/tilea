# tilea.kr 프로젝트 초기화 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** prd0 체크리스트 12개 항목을 완료하여 Next.js 14 + TypeScript 기반 Docker 개발 환경을 구축한다.

**Architecture:** src/ 디렉토리가 Next.js 프로젝트 루트이자 Docker 컨테이너 /app 마운트 포인트. App Router(src/app/)로 페이지를 구성하고, Prisma+PostgreSQL 16, Redis 7, Meilisearch 1.7을 Docker Compose로 오케스트레이션한다.

**Tech Stack:** Next.js 14.2.5, TypeScript 5.x, Tailwind CSS 3.x, Prisma 5.x, PostgreSQL 16, Redis 7, Meilisearch 1.7, ESLint 8, Prettier 3, Docker Compose

---

## File Map

### Create (신규 생성)

| File | Responsibility |
|------|----------------|
| `src/package.json` | Node 의존성, scripts 정의 |
| `src/next.config.js` | Next.js 설정 |
| `src/tsconfig.json` | TypeScript 설정 |
| `src/tailwind.config.ts` | Tailwind CSS 테마 + 디자인 토큰 매핑 |
| `src/postcss.config.js` | PostCSS 플러그인 (Tailwind) |
| `src/.eslintrc.json` | ESLint 규칙 |
| `src/.prettierrc` | Prettier 포맷 규칙 |
| `src/app/layout.tsx` | 루트 레이아웃 (Pretendard 폰트, 메타데이터) |
| `src/app/page.tsx` | 메인 페이지 (랜딩으로 리다이렉트) |
| `src/app/globals.css` | 글로벌 스타일 + CSS 변수 디자인 토큰 |
| `src/app/(public)/page.tsx` | 공개 랜딩 페이지 |
| `src/app/(public)/layout.tsx` | 공개 영역 레이아웃 |
| `src/app/(auth)/login/page.tsx` | 로그인 페이지 플레이스홀더 |
| `src/app/(auth)/layout.tsx` | 인증 영역 레이아웃 |
| `src/app/(dashboard)/layout.tsx` | 대시보드 레이아웃 플레이스홀더 |
| `src/app/(dashboard)/page.tsx` | 대시보드 메인 플레이스홀더 |
| `src/app/api/health/route.ts` | 헬스체크 API |
| `src/lib/prisma.ts` | Prisma 클라이언트 싱글턴 |
| `src/lib/redis.ts` | Redis 클라이언트 (ioredis) |
| `src/lib/utils.ts` | cn() 유틸리티 (clsx + tailwind-merge) |
| `src/prisma/schema.prisma` | DB 스키마 (User + UserRole) |
| `src/prisma/seed.ts` | 시드 데이터 스크립트 |
| `.gitignore` | Git 무시 파일 |
| `.github/workflows/ci.yml` | CI/CD 파이프라인 초안 |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR 템플릿 |

### Modify (기존 파일 수정)

| File | Change |
|------|--------|
| `docker-compose.yml` | Postgres 16, Meilisearch 추가, app 커맨드 변경 |
| `docker/Dockerfile` | Next.js 개발/프로덕션 빌드로 변경 |
| `.env` | Meilisearch 포트/키, DATABASE_URL 추가 |

### Delete (삭제)

| File | Reason |
|------|--------|
| `src/index.js` | Express 플레이스홀더, Next.js로 대체됨 |

---

## Task 1: 디렉토리 구조 생성 (prd0 항목 0-11)

**담당:** 김태현 (개발1팀 백엔드 리드)

**Files:**
- Delete: `src/index.js`
- Create: 디렉토리들 (빈 디렉토리에 `.gitkeep`)

- [ ] **Step 1: 기존 Express 플레이스홀더 삭제**

```bash
rm /data/successbank/projects/tilea.kr/src/index.js
```

- [ ] **Step 2: Next.js App Router 디렉토리 구조 생성**

```bash
cd /data/successbank/projects/tilea.kr

# App Router 라우트 그룹
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(dashboard\)
mkdir -p src/app/\(public\)
mkdir -p src/app/admin
mkdir -p src/app/api/health

# 컴포넌트
mkdir -p src/components/ui
mkdir -p src/components/forms
mkdir -p src/components/layouts
mkdir -p src/components/features

# 라이브러리/유틸
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/stores
mkdir -p src/types
mkdir -p src/styles

# Prisma
mkdir -p src/prisma

# 정적 파일
mkdir -p src/public/fonts
mkdir -p src/public/images

# 테스트
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e

# GitHub
mkdir -p .github/workflows
```

- [ ] **Step 3: 빈 디렉토리에 .gitkeep 생성**

```bash
cd /data/successbank/projects/tilea.kr
for dir in src/components/ui src/components/forms src/components/layouts src/components/features src/hooks src/stores src/types src/styles src/public/fonts src/public/images tests/unit tests/integration tests/e2e src/app/admin; do
  touch "$dir/.gitkeep"
done
```

- [ ] **Step 4: 디렉토리 구조 확인**

```bash
find /data/successbank/projects/tilea.kr/src -type d | sort
```

Expected: `app/(auth)/login`, `app/(dashboard)`, `app/(public)`, `app/admin`, `app/api/health`, `components/ui`, `components/forms`, `components/layouts`, `components/features`, `lib`, `hooks`, `stores`, `types`, `styles`, `prisma`, `public/fonts`, `public/images` 디렉토리 존재

---

## Task 2: Next.js 14 프로젝트 초기화 (prd0 항목 0-3)

**담당:** 김태현 (개발1팀 백엔드 리드)

**Files:**
- Create: `src/package.json`
- Create: `src/next.config.js`
- Create: `src/tsconfig.json`

- [ ] **Step 1: package.json 생성**

Create `src/package.json`:

```json
{
  "name": "tilea.kr",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@prisma/client": "^5.22.0",
    "ioredis": "^5.4.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "prisma": "^5.22.0",
    "@types/node": "^20.17.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "tailwindcss": "^3.4.14",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "14.2.5",
    "prettier": "^3.3.3",
    "prettier-plugin-tailwindcss": "^0.6.8",
    "tsx": "^4.19.0"
  }
}
```

- [ ] **Step 2: next.config.js 생성**

Create `src/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: '*.pstatic.net',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 3: tsconfig.json 생성**

Create `src/tsconfig.json`:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: 파일 존재 확인**

```bash
ls -la /data/successbank/projects/tilea.kr/src/package.json /data/successbank/projects/tilea.kr/src/next.config.js /data/successbank/projects/tilea.kr/src/tsconfig.json
```

Expected: 3개 파일 모두 존재

---

## Task 3: Tailwind CSS + Pretendard 폰트 설정 (prd0 항목 0-4)

**담당:** 신예진 (개발1팀 프론트엔드)

**Files:**
- Create: `src/tailwind.config.ts`
- Create: `src/postcss.config.js`

- [ ] **Step 1: tailwind.config.ts 생성**

Create `src/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-secondary)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
        },
        background: 'var(--color-background)',
        foreground: 'var(--color-text)',
        muted: {
          DEFAULT: 'var(--color-text-muted)',
          foreground: 'var(--color-text-muted)',
        },
        border: 'var(--color-border)',
        destructive: {
          DEFAULT: 'var(--color-error)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        base: ['16px', { lineHeight: '1.6' }],
      },
      screens: {
        tablet: '768px',
        desktop: '1024px',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: postcss.config.js 생성**

Create `src/postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: 파일 존재 확인**

```bash
ls -la /data/successbank/projects/tilea.kr/src/tailwind.config.ts /data/successbank/projects/tilea.kr/src/postcss.config.js
```

Expected: 2개 파일 존재

---

## Task 4: ESLint + Prettier 설정 (prd0 항목 0-8)

**담당:** 정대훈 (PM팀 코드 일관성)

**Files:**
- Create: `src/.eslintrc.json`
- Create: `src/.prettierrc`
- Create: `src/.prettierignore`

- [ ] **Step 1: .eslintrc.json 생성**

Create `src/.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
    ],
    "prefer-const": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

- [ ] **Step 2: .prettierrc 생성**

Create `src/.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 3: .prettierignore 생성**

Create `src/.prettierignore`:

```
node_modules
.next
prisma/migrations
```

- [ ] **Step 4: 파일 존재 확인**

```bash
ls -la /data/successbank/projects/tilea.kr/src/.eslintrc.json /data/successbank/projects/tilea.kr/src/.prettierrc /data/successbank/projects/tilea.kr/src/.prettierignore
```

Expected: 3개 파일 존재

---

## Task 5: 디자인 토큰 + 글로벌 스타일 + 루트 레이아웃 (prd0 항목 0-9)

**담당:** 김서현 (디자인팀) + 신예진 (개발1팀 프론트엔드)

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: globals.css 생성 (디자인 토큰 포함)**

Create `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');

:root {
  /* Primary Colors */
  --color-primary: #8B6914;
  --color-secondary: #D4A843;
  --color-accent: #2E7D32;

  /* Background */
  --color-background: #FAFAF5;

  /* Text */
  --color-text: #2C2C2C;
  --color-text-muted: #6B7280;

  /* Border */
  --color-border: #E5E7EB;

  /* Status */
  --color-error: #DC2626;
  --color-success: #16A34A;
  --color-warning: #F59E0B;
}

@layer base {
  body {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: var(--color-text);
    background-color: var(--color-background);
  }

  * {
    border-color: var(--color-border);
  }
}
```

- [ ] **Step 2: 루트 레이아웃 생성**

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: 메인 페이지 생성 (랜딩 페이지)**

Create `src/app/page.tsx`:

```tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-primary">tilea</h1>
        <p className="mb-8 text-lg text-muted">목공·목재 산업 종합 플랫폼</p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:opacity-90"
          >
            로그인
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-primary px-6 py-3 text-primary transition-colors hover:bg-primary hover:text-white"
          >
            대시보드
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: 파일 존재 확인**

```bash
ls -la /data/successbank/projects/tilea.kr/src/app/globals.css /data/successbank/projects/tilea.kr/src/app/layout.tsx /data/successbank/projects/tilea.kr/src/app/page.tsx
```

Expected: 3개 파일 존재

---

## Task 6: 라우트 그룹 페이지 + Health API

**담당:** 신예진 (프론트엔드) + 김태현 (백엔드)

**Files:**
- Create: `src/app/(public)/layout.tsx`
- Create: `src/app/(public)/page.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/page.tsx`
- Create: `src/app/api/health/route.ts`

- [ ] **Step 1: 공개 영역 레이아웃 + 페이지**

Create `src/app/(public)/layout.tsx`:

```tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
```

Create `src/app/(public)/page.tsx`:

```tsx
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-6 text-5xl font-bold text-primary">
          목공·목재 산업의
          <br />
          <span className="text-accent">디지털 전환</span>
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted">
          재단 계산, 견적 관리, 재고 관리, 프로젝트 관리, 커뮤니티, 마켓플레이스까지.
          목공·목재 산업을 위한 올인원 SaaS 플랫폼.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:opacity-90"
          >
            시작하기
          </Link>
          <Link
            href="#features"
            className="rounded-lg border border-border px-8 py-3 font-medium text-foreground transition-colors hover:bg-gray-50"
          >
            기능 살펴보기
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white px-4 py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 tablet:grid-cols-2 desktop:grid-cols-3">
          {[
            { title: '재단 계산기', desc: '2D 최적 배치로 자재 낭비를 최소화' },
            { title: '견적 관리', desc: '전문 견적서를 빠르게 작성하고 전송' },
            { title: '재고 관리', desc: 'QR 스캔으로 실시간 재고 파악' },
            { title: '프로젝트 관리', desc: '칸반보드로 작업 진행 상황 추적' },
            { title: '커뮤니티', desc: '목공인들의 기술 공유와 소통' },
            { title: '마켓플레이스', desc: '장비·자재 거래의 새로운 채널' },
          ].map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border p-6">
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: 인증 영역 레이아웃 + 로그인 페이지**

Create `src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
```

Create `src/app/(auth)/login/page.tsx`:

```tsx
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-primary">tilea</h1>
        <p className="text-muted">목공·목재 산업 종합 플랫폼</p>
      </div>

      <div className="space-y-3">
        {/* 소셜 로그인 버튼 플레이스홀더 (prd1에서 구현) */}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] px-4 py-3 font-medium text-[#191919]"
          disabled
        >
          카카오로 시작하기
        </button>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#03C75A] px-4 py-3 font-medium text-white"
          disabled
        >
          네이버로 시작하기
        </button>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-3 font-medium text-foreground"
          disabled
        >
          Google로 시작하기
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        prd1에서 인증 시스템 구현 예정
      </p>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-primary hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 대시보드 영역 레이아웃 + 페이지**

Create `src/app/(dashboard)/layout.tsx`:

```tsx
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* 상단 네비게이션 */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            tilea
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted">
            <span>대시보드 (prd1 인증 후 활성화)</span>
          </nav>
        </div>
      </header>
      {/* 본문 */}
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
```

Create `src/app/(dashboard)/page.tsx`:

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">대시보드</h1>
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
        {[
          { title: '재단 계산기', desc: 'prd3에서 구현', status: 'Phase 1' },
          { title: '견적 관리', desc: 'prd4에서 구현', status: 'Phase 1' },
          { title: '재고 관리', desc: 'prd5에서 구현', status: 'Phase 2' },
          { title: '프로젝트 관리', desc: 'prd6에서 구현', status: 'Phase 2' },
          { title: 'CRM', desc: 'prd7에서 구현', status: 'Phase 2' },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border bg-white p-6 opacity-60"
          >
            <div className="mb-1 text-xs text-muted">{item.status}</div>
            <h3 className="mb-2 font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Health API 엔드포인트 생성**

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'tilea.kr',
    version: '0.1.0',
  };

  return NextResponse.json(health);
}
```

- [ ] **Step 5: 파일 존재 확인**

```bash
find /data/successbank/projects/tilea.kr/src/app -name "*.tsx" -o -name "*.ts" -o -name "*.css" | sort
```

Expected: `globals.css`, `layout.tsx`, `page.tsx`, `(public)/layout.tsx`, `(public)/page.tsx`, `(auth)/layout.tsx`, `(auth)/login/page.tsx`, `(dashboard)/layout.tsx`, `(dashboard)/page.tsx`, `api/health/route.ts`

---

## Task 7: Prisma 설정 + PostgreSQL 연결 (prd0 항목 0-5)

**담당:** 한승우 (개발1팀 DB)

**Files:**
- Create: `src/prisma/schema.prisma`
- Create: `src/prisma/seed.ts`
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Prisma 스키마 생성**

Create `src/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  image     String?
  role      UserRole @default(USER)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}

enum UserRole {
  USER
  BUSINESS
  ADMIN
}
```

- [ ] **Step 2: 시드 스크립트 생성**

Create `src/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tilea.kr' },
    update: {},
    create: {
      email: 'admin@tilea.kr',
      name: '관리자',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.id);
  console.log('Seeding complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 3: Prisma 클라이언트 싱글턴 생성**

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: 파일 존재 확인**

```bash
ls -la /data/successbank/projects/tilea.kr/src/prisma/schema.prisma /data/successbank/projects/tilea.kr/src/prisma/seed.ts /data/successbank/projects/tilea.kr/src/lib/prisma.ts
```

Expected: 3개 파일 존재

---

## Task 8: Redis 연결 설정 (prd0 항목 0-6)

**담당:** 정민수 (개발1팀 인프라)

**Files:**
- Create: `src/lib/redis.ts`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Redis 클라이언트 생성**

Create `src/lib/redis.ts`:

```typescript
import Redis from 'ioredis';

const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
};

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? getRedisClient();

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
```

- [ ] **Step 2: utils.ts 생성 (cn 유틸리티)**

Create `src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: 파일 존재 확인**

```bash
ls -la /data/successbank/projects/tilea.kr/src/lib/redis.ts /data/successbank/projects/tilea.kr/src/lib/utils.ts
```

Expected: 2개 파일 존재

---

## Task 9: Docker Compose 업데이트 (prd0 항목 0-7)

**담당:** 임동혁 (개발1팀 인프라/배포)

**Files:**
- Modify: `docker-compose.yml`
- Modify: `docker/Dockerfile`
- Modify: `.env`

- [ ] **Step 1: docker-compose.yml 전체 교체**

Replace `docker-compose.yml` with:

```yaml
version: '3.8'

x-logging: &default-logging
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

services:
  app:
    image: node:18-alpine
    container_name: ${PROJECT_NAME}_app
    restart: unless-stopped
    working_dir: /app
    environment:
      - NODE_ENV=${NODE_ENV}
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@database:5432/${DB_NAME}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - MEILISEARCH_HOST=http://meilisearch:7700
      - MEILISEARCH_API_KEY=${MEILISEARCH_MASTER_KEY}
      - PORT=3000
      - WATCHPACK_POLLING=true
      - NEXT_TELEMETRY_DISABLED=1
    volumes:
      - ./src:/app:cached
      - /app/node_modules
      - /app/.next
    ports:
      - "${WEB_PORT}:3000"
    networks:
      - app-network
    depends_on:
      database:
        condition: service_healthy
      redis:
        condition: service_started
    logging: *default-logging
    command: sh -c "npm install && npx prisma generate && npm run dev"

  database:
    image: postgres:16-alpine
    container_name: ${PROJECT_NAME}_db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "${DB_PORT}:5432"
    networks:
      - app-network
    logging: *default-logging
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: ${PROJECT_NAME}_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "${REDIS_PORT}:6379"
    networks:
      - app-network
    logging: *default-logging

  meilisearch:
    image: getmeili/meilisearch:v1.7
    container_name: ${PROJECT_NAME}_meilisearch
    restart: unless-stopped
    environment:
      - MEILI_MASTER_KEY=${MEILISEARCH_MASTER_KEY}
      - MEILI_ENV=development
    volumes:
      - meilisearch_data:/meili_data
    ports:
      - "${MEILISEARCH_PORT}:7700"
    networks:
      - app-network
    logging: *default-logging

  adminer:
    image: adminer
    container_name: ${PROJECT_NAME}_adminer
    restart: unless-stopped
    ports:
      - "${ADMINER_PORT}:8080"
    networks:
      - app-network
    environment:
      - ADMINER_DEFAULT_SERVER=database
    logging: *default-logging

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:
```

- [ ] **Step 2: Dockerfile 교체 (Next.js 용)**

Replace `docker/Dockerfile` with:

```dockerfile
FROM node:18-alpine AS base

# Development stage
FROM base AS dev
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 nodejs && \
    adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

- [ ] **Step 3: .env 업데이트**

Append to `.env`:

```env
# Meilisearch
MEILISEARCH_PORT=5683
MEILISEARCH_MASTER_KEY=tilea_meili_dev_key_2026
```

- [ ] **Step 4: 파일 변경 확인**

```bash
grep -c "meilisearch" /data/successbank/projects/tilea.kr/docker-compose.yml
grep "MEILISEARCH" /data/successbank/projects/tilea.kr/.env
```

Expected: meilisearch 관련 설정이 docker-compose.yml과 .env에 존재

---

## Task 10: .gitignore + Git 저장소 초기화 (prd0 항목 0-1, 0-2)

**담당:** 김현태 (PM팀 Git PM)

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: .gitignore 생성**

Create `.gitignore`:

```gitignore
# Dependencies
src/node_modules/
node_modules/

# Next.js
src/.next/
src/out/

# Production
src/build/

# Prisma
src/prisma/migrations/

# Environment
.env.local
.env.production
.env.*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker volumes (local)
postgres_data/
redis_data/
meilisearch_data/

# Logs
logs/*.log

# Backups (sensitive)
backups/*.sql
backups/*.dump

# Test coverage
coverage/

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Docs build artifacts
docs/superpowers/plans/*.draft.md
```

- [ ] **Step 2: Git 저장소 초기화**

```bash
cd /data/successbank/projects/tilea.kr
git init
git add .
git commit -m "chore: 프로젝트 초기화 - Next.js 14 + TypeScript + Docker 환경 구성 [검증:대기]"
```

- [ ] **Step 3: develop 브랜치 생성**

```bash
cd /data/successbank/projects/tilea.kr
git branch develop
```

- [ ] **Step 4: Git 상태 확인**

```bash
cd /data/successbank/projects/tilea.kr
git log --oneline
git branch
```

Expected: 초기 커밋 1개, `main`과 `develop` 브랜치 존재

---

## Task 11: CI/CD 파이프라인 + PR 템플릿 (prd0 항목 0-10)

**담당:** 임동혁 (인프라/배포)

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`

- [ ] **Step 1: CI 파이프라인 생성**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./src

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: src/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: "postgresql://test:test@localhost:5432/test"
          REDIS_URL: "redis://localhost:6379"
```

- [ ] **Step 2: PR 템플릿 생성**

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## 변경 사항

-

## 검증 결과

| 항목 | 결과 |
|------|------|
| 단위 검증 (에러 0건) | Pass / Fail |
| 통합 검증 (기존 기능 깨짐 없음) | Pass / Fail |
| 화면 확인 (UI 기능인 경우) | Pass / Fail / N/A |
| lint + type-check | Pass / Fail |

## 테스트

-

## 관련 이슈

Closes #
```

- [ ] **Step 3: 파일 존재 확인**

```bash
ls -la /data/successbank/projects/tilea.kr/.github/workflows/ci.yml /data/successbank/projects/tilea.kr/.github/PULL_REQUEST_TEMPLATE.md
```

Expected: 2개 파일 존재

---

## Task 12: Docker 기동 + 전체 검증 (prd0 항목 0-12)

**담당:** 전체 팀

- [ ] **Step 1: 기존 Docker 컨테이너 정리**

```bash
cd /data/successbank/projects/tilea.kr
docker-compose down -v 2>/dev/null || true
```

- [ ] **Step 2: Docker Compose 기동**

```bash
cd /data/successbank/projects/tilea.kr
docker-compose up -d
```

Expected: 5개 서비스(app, database, redis, meilisearch, adminer) 모두 시작

- [ ] **Step 3: 서비스 상태 확인 (30초 대기 후)**

```bash
sleep 30 && docker-compose ps
```

Expected: 5개 컨테이너 모두 `Up` 상태

- [ ] **Step 4: app 컨테이너 로그 확인**

```bash
docker-compose logs app 2>&1 | tail -30
```

Expected: `npm install` 완료, `prisma generate` 완료, `ready` 메시지 (Next.js dev server)

- [ ] **Step 5: Next.js 페이지 접속 확인**

```bash
curl -s http://localhost:5679 | head -20
```

Expected: HTML 응답 (tilea 랜딩 페이지)

- [ ] **Step 6: Health API 확인**

```bash
curl -s http://localhost:5679/api/health | python3 -m json.tool
```

Expected: `{ "status": "ok", "service": "tilea.kr", "version": "0.1.0", ... }`

- [ ] **Step 7: Prisma DB push (스키마 적용)**

```bash
docker exec -it tilea.kr_app sh -c "npx prisma db push"
```

Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 8: Redis PING 확인**

```bash
docker exec -it tilea.kr_redis redis-cli -a unitRuzXCx0NV30X PING
```

Expected: `PONG`

- [ ] **Step 9: Meilisearch 헬스체크**

```bash
curl -s http://localhost:5683/health
```

Expected: `{"status":"available"}`

- [ ] **Step 10: Lint + Type check**

```bash
docker exec -it tilea.kr_app sh -c "npm run lint && npx tsc --noEmit"
```

Expected: 에러 0건

- [ ] **Step 11: 검증 결과 정리 및 커밋 태그 업데이트**

모든 검증 통과 시:

```bash
cd /data/successbank/projects/tilea.kr
git add .
git commit -m "verify: prd0 프로젝트 초기화 전체 검증 완료 [검증:통합통과]"
```

---

## 검증 체크리스트 (prd0 기준)

| # | 항목 | 검증 방법 | Task |
|---|------|----------|------|
| 0-1 | Git 저장소 초기화 | `git log --oneline` | Task 10 |
| 0-2 | main/develop 브랜치 | `git branch` | Task 10 |
| 0-3 | Next.js 14 초기화 | `curl localhost:5679` | Task 12 |
| 0-4 | Tailwind + Pretendard | 페이지 렌더링 확인 | Task 12 |
| 0-5 | Prisma + PostgreSQL | `prisma db push` 성공 | Task 12 |
| 0-6 | Redis 연결 | `redis-cli PING → PONG` | Task 12 |
| 0-7 | Docker Compose | `docker-compose ps` 5개 Up | Task 12 |
| 0-8 | ESLint + Prettier | `npm run lint` 에러 0건 | Task 12 |
| 0-9 | 디자인 토큰 | globals.css CSS 변수 확인 | Task 5 |
| 0-10 | CI/CD 초안 | `.github/workflows/ci.yml` 존재 | Task 11 |
| 0-11 | 디렉토리 구조 | `find src -type d` | Task 1 |
| 0-12 | npm run dev 기동 | Health API `{"status":"ok"}` | Task 12 |
