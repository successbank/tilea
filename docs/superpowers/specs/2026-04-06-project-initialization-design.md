# tilea.kr 프로젝트 초기화 설계 문서

> **작성일**: 2026-04-06 | **범위**: prd0 체크리스트 12개 항목 전체  
> **PM 총괄**: 강민호 | **기술PM**: 이수진 | **Git PM**: 김현태

---

## 1. 목표

prd0에 정의된 프로젝트 초기화 체크리스트 12개 항목을 완료하여, Next.js 14 + TypeScript 기반 개발 환경을 구축하고 Docker 기동 확인까지 완료한다.

## 2. 현재 상태

- `src/index.js`: Express 플레이스홀더 1개 (제거 대상)
- `docker-compose.yml`: Postgres 15 + Redis 7 + Adminer (수정 필요)
- `docker/Dockerfile`: Node 18 Alpine 멀티스테이지 (수정 필요)
- `.env`: 포트 5679~5682 할당 완료
- Git 미초기화 (`.git` 없음)
- PRD 20개 작성 완료

## 3. 디렉토리 구조

```
tilea.kr/
├── .claude/                    # 페르소나 시스템 (기존 유지)
├── .github/
│   ├── workflows/
│   │   └── ci.yml              # CI/CD 파이프라인 초안
│   └── PULL_REQUEST_TEMPLATE.md
├── backups/                    # DB 백업 (기존 유지)
├── docker/
│   └── Dockerfile              # 멀티스테이지 빌드 (수정)
├── logs/                       # 로그 (기존 유지)
├── prd/                        # PRD 문서 (기존 유지)
├── src/                        # Next.js 프로젝트 루트 (Docker /app 마운트)
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── public/
│   │   └── fonts/              # Pretendard 폰트
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/
│   │   │   └── layout.tsx
│   │   ├── (public)/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   ├── api/
│   │   │   └── health/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── layouts/
│   │   └── features/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── utils.ts
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   └── styles/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker-compose.yml
├── .env
├── .gitignore
└── CLAUDE.md
```

### 핵심 결정

- `src/` = Next.js 프로젝트 루트 = Docker `/app` 마운트 포인트
- `src/app/` = App Router (Next.js `src` 디렉토리 옵션 미사용)
- `prisma/`는 `src/` 내부 (컨테이너에서 `npx prisma` 실행 용이)
- `tests/`는 프로젝트 루트 (Docker 외부에서도 실행 가능)

## 4. Docker Compose 구성

### 서비스 (5개)

| 서비스 | 이미지 | 포트 | 비고 |
|--------|--------|------|------|
| app | node:18-alpine | 5679:3000 | Next.js 14 dev server |
| database | postgres:16-alpine | 5680:5432 | prd0 명세 반영 (15→16) |
| redis | redis:7-alpine | 5681:6379 | 기존 유지 |
| meilisearch | getmeili/meilisearch:v1.7 | 5683:7700 | 신규 추가 |
| adminer | adminer | 5682:8080 | 기존 유지 |

### app 컨테이너 변경사항

- 커맨드: `sh -c "npm install && npx prisma generate && npm run dev"`
- 볼륨: `./src:/app:cached`, `/app/node_modules`, `/app/.next` (익명)
- 환경변수: `WATCHPACK_POLLING=true`, `NEXT_TELEMETRY_DISABLED=1` 추가

### .env 추가 항목

```env
MEILISEARCH_PORT=5683
MEILISEARCH_MASTER_KEY=(자동 생성)
```

## 5. 패키지 의존성

### dependencies (런타임)

```json
{
  "next": "14.2.5",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "@prisma/client": "^5.22.0",
  "ioredis": "^5.4.1"
}
```

### devDependencies (개발)

```json
{
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
  "prettier-plugin-tailwindcss": "^0.6.8"
}
```

## 6. Prisma 초기 스키마

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  image     String?
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum UserRole {
  USER
  BUSINESS
  ADMIN
}
```

- prd1에서 Account, Session, VerificationToken 추가 예정
- prd2에서 BusinessProfile 추가 예정

## 7. ESLint + Prettier 설정

### ESLint (.eslintrc.json)

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error"
  }
}
```

### Prettier (.prettierrc)

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

## 8. 디자인 토큰

### CSS 변수 (globals.css)

```css
:root {
  --color-primary: #8B6914;
  --color-secondary: #D4A843;
  --color-accent: #2E7D32;
  --color-background: #FAFAF5;
  --color-text: #2C2C2C;
  --color-text-muted: #6B7280;
  --color-border: #E5E7EB;
  --color-error: #DC2626;
  --color-success: #16A34A;
  --color-warning: #F59E0B;
}
```

### Tailwind 매핑 (tailwind.config.ts)

```typescript
theme: {
  extend: {
    colors: {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      accent: 'var(--color-accent)',
      background: 'var(--color-background)',
      // ...
    },
    fontFamily: {
      sans: ['Pretendard', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
  },
}
```

### 폰트

- Pretendard: `next/font/local`로 로드 (CDN 또는 로컬)
- 루트 레이아웃에서 `<body className={pretendard.className}>` 적용

## 9. CI/CD 파이프라인 초안

```yaml
name: CI
on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18 }
      - run: cd src && npm ci
      - run: cd src && npm run lint
      - run: cd src && npx tsc --noEmit
      - run: cd src && npm run build
```

## 10. 실행 순서

| 순서 | prd0 항목 | 담당 | 내용 |
|------|-----------|------|------|
| 1 | 0-11 | 김태현 | 디렉토리 구조 생성 |
| 2 | 0-3 | 김태현 | Next.js 14 초기화 (package.json, configs) |
| 3 | 0-4 | 신예진 | Tailwind CSS + Pretendard 설정 |
| 4 | 0-8 | 정대훈 | ESLint + Prettier 설정 |
| 5 | 0-9 | 김서현 | 디자인 토큰 CSS 변수 |
| 6 | 0-7 | 임동혁 | Docker Compose 업데이트 (Meilisearch 추가) |
| 7 | 0-5 | 한승우 | Prisma 설정 + PostgreSQL 연결 |
| 8 | 0-6 | 정민수 | Redis 연결 설정 |
| 9 | 0-12 | 전체 | npm run dev 기동 + 검증 |
| 10 | 0-1 | 김현태 | Git 저장소 초기화 |
| 11 | 0-2 | 김현태 | main/develop 브랜치 생성 |
| 12 | 0-10 | 임동혁 | CI/CD 파이프라인 초안 |

## 11. 검증 기준

```
✅ docker-compose up → 5개 서비스 정상 기동
✅ http://localhost:5679 → Next.js 기본 페이지 렌더링
✅ GET /api/health → { status: "ok" } 응답
✅ Prisma DB push → 스키마 적용 성공
✅ Redis PING → PONG 응답
✅ Meilisearch health → 정상 응답
✅ npm run lint → 에러 0건
✅ npx tsc --noEmit → 타입 에러 0건
✅ 콘솔 에러 0건
```
