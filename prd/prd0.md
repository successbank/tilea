# PRD 0: 프로젝트 총괄 — 아키텍처, Git, 프로젝트 초기화

> **프로젝트**: tilea.kr — 목공·목재 산업 종합 SaaS  
> **버전**: v1.0 | **작성일**: 2026-04-06  
> **PM 총괄**: 강민호 | **기술PM**: 이수진  
> **Git PM**: 김현태 | **품질PM**: 박준혁  
> **도메인**: tilea.kr | **저장소**: https://github.com/successbank/tilea.git

---

## 0.1 프로젝트 비전

"대한민국 목공·목재 산업의 디지털 전환을 이끄는 올인원 플랫폼"

### 6대 핵심 서비스

| # | 서비스 | PRD 범위 | 핵심 가치 |
|---|--------|---------|-----------|
| 1 | 업무 관리 SaaS | prd3~prd7 | 재단 계산, 견적, 재고, 프로젝트, CRM |
| 2 | 커뮤니티 | prd8~prd9 | 기술 공유, 중고거래, 소통 |
| 3 | 역경매 | prd10 | 의뢰인↔사업자 매칭 |
| 4 | 마켓플레이스 | prd11~prd12 | 장비·자재 판매 |
| 5 | 뉴스/정보 | prd13 | 업계 뉴스, 지원사업 |
| 6 | 온라인 클래스 | prd14~prd15 | VOD/라이브 강의 |

---

## 0.2 기술 스택

### 코어 스택

| 구분 | 기술 | 버전 | 선정 이유 |
|------|------|------|-----------|
| 프레임워크 | Next.js (App Router) | 14.x | SSR/SSG, SEO, API Routes |
| 언어 | TypeScript | 5.x | 타입 안전성 |
| 스타일링 | Tailwind CSS | 3.x | 빠른 UI, 반응형 |
| 상태관리 | Zustand | 4.x | 경량, 직관적 |
| DB | PostgreSQL | 16.x | 관계형, 트랜잭션 |
| ORM | Prisma | 5.x | 타입 안전 쿼리 |
| 캐싱 | Redis | 7.x | 세션, 검색 캐시 |
| 인증 | Auth.js (NextAuth v5) | 5.x | 카카오/네이버/구글 |
| 파일 저장 | Cloudflare R2 | - | S3 호환, 이그레스 무료 |
| 검색 | Meilisearch | 1.x | 한국어 지원, 자체 호스팅 |
| 결제 | 토스페이먼츠 SDK | 2.x | 국내 결제 최적화 |
| 이메일 | Resend | - | 트랜잭션 이메일 |
| 실시간 | Socket.IO | 4.x | 채팅, 알림 |
| 배포 | Coolify + Docker | - | 자체 호스팅 |
| 모니터링 | Sentry + Umami | - | 에러 추적 + 분석 |

### 오픈소스 활용 계획

| 영역 | 라이브러리 | GitHub Stars | 용도 |
|------|-----------|-------------|------|
| 2D Bin Packing | `rectangle-packer` (TypeScript) | - | 재단 계산기 코어 |
| 에디터 | Tiptap / Plate | 30k+ | 커뮤니티 게시글 에디터 |
| 차트 | Recharts | 24k+ | 대시보드 시각화 |
| 폼 관리 | React Hook Form + Zod | 42k+ | 폼 유효성 검증 |
| 테이블 | TanStack Table | 26k+ | 관리자 데이터 테이블 |
| PDF | @react-pdf/renderer | 15k+ | 견적서/수료증 PDF |
| 동영상 | Cloudflare Stream / Mux | - | HLS 스트리밍 |
| 바코드 | html5-qrcode | 5k+ | 재고 QR 스캔 |
| DnD | @dnd-kit/core | 13k+ | 칸반보드, 정렬 |

---

## 0.3 프로젝트 디렉토리 구조

```
tilea/
├── .github/
│   ├── workflows/           # CI/CD
│   └── PULL_REQUEST_TEMPLATE.md
├── prisma/
│   ├── schema.prisma        # DB 스키마
│   ├── migrations/          # 마이그레이션
│   └── seed.ts              # 시드 데이터
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # 인증 라우트 그룹
│   │   ├── (dashboard)/     # 대시보드 라우트 그룹
│   │   ├── (public)/        # 공개 라우트 그룹
│   │   ├── admin/           # 관리자
│   │   ├── api/             # API Routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/              # 기본 UI 컴포넌트
│   │   ├── forms/           # 폼 컴포넌트
│   │   ├── layouts/         # 레이아웃 컴포넌트
│   │   └── features/        # 기능별 컴포넌트
│   ├── lib/
│   │   ├── auth.ts          # Auth.js 설정
│   │   ├── prisma.ts        # Prisma 클라이언트
│   │   ├── redis.ts         # Redis 클라이언트
│   │   ├── r2.ts            # Cloudflare R2
│   │   ├── meilisearch.ts   # 검색 클라이언트
│   │   ├── toss.ts          # 토스페이먼츠
│   │   └── utils.ts         # 유틸리티
│   ├── hooks/               # 커스텀 훅
│   ├── stores/              # Zustand 스토어
│   ├── types/               # TypeScript 타입
│   └── styles/              # 글로벌 스타일
├── public/                  # 정적 파일
├── tests/                   # 테스트
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 0.4 Git 초기화 및 저장소 설정

### 초기 커맨드

```bash
echo "# tilea" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/successbank/tilea.git
git push -u origin main
```

### 브랜치 전략 (김현태 Git PM 관리)

```yaml
branches:
  main: 프로덕션 (보호됨, release에서만 머지)
  develop: 개발 통합 (보호됨, 검증 통과 PR만 머지)
  feature/{이슈번호}-{기능명}: 기능 개발 (1기능 = 1브랜치)
  hotfix/{이슈번호}-{설명}: 긴급 수정
  release/{버전}: 릴리즈 준비

branch_protection:
  main:
    - PR 필수
    - 최소 2명 승인 (김현태 + 강민호)
    - CI 전체 통과
  develop:
    - PR 필수
    - 최소 1명 승인
    - 검증 결과 섹션 작성 완료
    - 단위검증 + 통합검증 Pass
```

### 커밋 컨벤션

```
[타입] 설명 (#이슈번호) [검증:태그]

타입: feat | fix | docs | style | refactor | test | chore | verify
검증태그: [검증:대기] | [검증:통과] | [검증:통합통과] | [검증:실패]

예시:
feat: 카카오 소셜 로그인 구현 (#3) [검증:통과]
feat: 재단 계산기 2D 최적화 알고리즘 (#15) [검증:통합통과]
```

---

## 0.5 개발 로드맵 & PRD 매핑

### Phase 1: MVP (3~4개월)

| PRD | 기능 | 우선순위 | 담당팀 |
|-----|------|---------|--------|
| prd1 | 인증 시스템 (카카오/네이버/구글/이메일) | P0 | 개발1팀 |
| prd2 | 사업자 프로필 & 역할 | P0 | 개발1팀 |
| prd3 | 재단 계산기 (킬러 기능) | P0 | 개발1팀 |
| prd4 | 견적서 관리 (기본) | P1 | 개발1팀 |
| prd8 | 커뮤니티 게시판 (3종) | P1 | 개발1팀 |
| prd13 | 뉴스 (기본) | P2 | 개발2팀 |

### Phase 2: 코어 비즈니스 (2~3개월)

| PRD | 기능 | 우선순위 | 담당팀 |
|-----|------|---------|--------|
| prd10 | 역경매 시스템 | P0 | 개발1팀 |
| prd5 | 재고 관리 | P1 | 개발1팀 |
| prd6 | 프로젝트 관리 | P1 | 개발1팀 |
| prd7 | CRM & 매출/회계 | P1 | 개발2팀 |
| prd9 | 중고거래 | P2 | 개발1팀 |

### Phase 3: 마켓 + 교육 (3~4개월)

| PRD | 기능 | 우선순위 | 담당팀 |
|-----|------|---------|--------|
| prd11 | 마켓 상품/카테고리 | P0 | 개발1팀 |
| prd12 | 주문/결제/배송 | P0 | 개발1팀 |
| prd14 | 온라인 클래스 강의/수강 | P1 | 개발1팀 |
| prd15 | 강사/정산 | P1 | 개발2팀 |
| prd16 | 메시징/알림 | P1 | 개발1팀 |

### Phase 4: 고도화 (지속)

| PRD | 기능 | 담당팀 |
|-----|------|--------|
| prd17 | 관리자 대시보드 | 개발2팀 |
| prd18 | 배포/인프라/모니터링 | 개발1팀 + 모니터링팀 |
| prd19 | QA/테스트/사용자 검증 가이드 | QA팀 + 시뮬레이션팀 |

---

## 0.6 PRD 문서 인덱스 (전체 20파트)

| PRD | 제목 | 핵심 기능 |
|-----|------|-----------|
| **prd0** | 프로젝트 총괄 | 아키텍처, Git, 로드맵 (본 문서) |
| **prd1** | 인증 시스템 | 소셜 로그인, 회원 가입, 세션 |
| **prd2** | 사업자 프로필 & 역할 | 사업자 인증, 역할 관리 |
| **prd3** | 재단 계산기 | 2D Bin Packing, 시각화, PDF |
| **prd4** | 견적서 관리 | 견적 생성, 템플릿, PDF/전송 |
| **prd5** | 재고 관리 | 입출고, QR 스캔, 안전재고 |
| **prd6** | 프로젝트 관리 | 진행 상태, 작업 일지, 고객 공유 |
| **prd7** | CRM & 매출/회계 | 고객 DB, 미수금, 손익 리포트 |
| **prd8** | 커뮤니티 게시판 | 7종 게시판, 태그, 포인트 |
| **prd9** | 중고거래 | 거래 상태, 지역 필터, 채팅 |
| **prd10** | 역경매 시스템 | 의뢰 등록, 입찰, 리뷰 |
| **prd11** | 마켓 상품/카테고리 | 상품 등록, 비교, 검색 |
| **prd12** | 주문/결제/배송 | 토스페이먼츠, 배송 추적, 정산 |
| **prd13** | 뉴스/정보 서비스 | 뉴스, 지원사업, 뉴스레터 |
| **prd14** | 온라인 클래스 (수강) | VOD, 진도, 수료증 |
| **prd15** | 온라인 클래스 (강사/정산) | 강사 대시보드, 수익 분배 |
| **prd16** | 메시징/알림 | 1:1 채팅, 알림톡, 이메일 |
| **prd17** | 관리자 대시보드 | 회원/콘텐츠/정산 관리 |
| **prd18** | 배포/인프라/모니터링 | Coolify, Docker, CI/CD, Sentry |
| **prd19** | QA/테스트/사용자 검증 가이드 | 테스트 전략, 사용자 검증 매뉴얼 |

---

## 0.7 환경 변수 설정 (Coolify 배포 기준)

```env
# App
NEXT_PUBLIC_APP_URL=https://tilea.kr
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/tilea

# Redis
REDIS_URL=redis://redis:6379

# Auth.js
NEXTAUTH_URL=https://tilea.kr
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# 카카오
KAKAO_CLIENT_ID=${KAKAO_CLIENT_ID}
KAKAO_CLIENT_SECRET=${KAKAO_CLIENT_SECRET}

# 네이버
NAVER_CLIENT_ID=${NAVER_CLIENT_ID}
NAVER_CLIENT_SECRET=${NAVER_CLIENT_SECRET}

# 구글
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# Cloudflare R2
R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
R2_ENDPOINT=${R2_ENDPOINT}
R2_BUCKET_NAME=tilea-uploads

# Meilisearch
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_API_KEY=${MEILISEARCH_API_KEY}

# 토스페이먼츠
TOSS_CLIENT_KEY=${TOSS_CLIENT_KEY}
TOSS_SECRET_KEY=${TOSS_SECRET_KEY}

# Resend
RESEND_API_KEY=${RESEND_API_KEY}

# Sentry
SENTRY_DSN=${SENTRY_DSN}
```

> ⚠️ **Coolify 주의**: 환경변수에 `${VAR}` 문법만 사용. `${VAR:-default}` 형태 사용 금지 (Go 템플릿 엔진 비호환)

---

## 0.8 UI/UX 디자인 시스템

### 컬러 팔레트

```css
:root {
  --color-primary: #8B6914;       /* 진한 우드 브라운 */
  --color-secondary: #D4A843;     /* 밝은 골드 브라운 */
  --color-accent: #2E7D32;        /* 그린 (친환경) */
  --color-background: #FAFAF5;    /* 따뜻한 오프화이트 */
  --color-text: #2C2C2C;          /* 본문 텍스트 */
  --color-text-muted: #6B7280;    /* 보조 텍스트 */
  --color-border: #E5E7EB;        /* 보더 */
  --color-error: #DC2626;         /* 에러 */
  --color-success: #16A34A;       /* 성공 */
  --color-warning: #F59E0B;       /* 경고 */
}
```

### 타이포그래피

- **본문**: Pretendard, 16px/1.6
- **제목**: Pretendard Bold, 세리프 포인트 (선택)
- **코드/데이터**: JetBrains Mono

### 아이콘

- Lucide React (라인 스타일, 24px 기본)

### 반응형 Breakpoints

- 모바일: ~768px
- 태블릿: 768~1024px
- 데스크톱: 1024px~

---

## 0.9 개발 완료 체크리스트

### prd0 체크리스트

| # | 항목 | 담당 | 상태 |
|---|------|------|------|
| 0-1 | Git 저장소 초기화 (github.com/successbank/tilea.git) | 김현태 | ⬜ |
| 0-2 | main/develop 브랜치 생성 + 보호 규칙 설정 | 김현태 | ⬜ |
| 0-3 | Next.js 14 프로젝트 초기화 (App Router, TypeScript) | 김태현 | ⬜ |
| 0-4 | Tailwind CSS + Pretendard 폰트 설정 | 신예진 | ⬜ |
| 0-5 | Prisma 초기 설정 + PostgreSQL 연결 확인 | 한승우 | ⬜ |
| 0-6 | Redis 연결 설정 | 정민수 | ⬜ |
| 0-7 | Docker Compose 구성 (Next.js + Postgres + Redis + Meilisearch) | 임동혁 | ⬜ |
| 0-8 | ESLint + Prettier 설정 | 정대훈 | ⬜ |
| 0-9 | 디자인 토큰 CSS 변수 설정 | 김서현 | ⬜ |
| 0-10 | CI/CD 파이프라인 초안 (GitHub Actions) | 임동혁 | ⬜ |
| 0-11 | 프로젝트 디렉토리 구조 생성 | 김태현 | ⬜ |
| 0-12 | `npm run dev` 정상 기동 확인 | 전체 | ⬜ |

### 검증 기준

```
✅ npm run dev → http://localhost:3000 접속 → 기본 페이지 정상 렌더링
✅ docker-compose up → 모든 서비스 정상 기동
✅ Prisma DB push → 스키마 적용 성공
✅ Redis PING → PONG 응답 확인
✅ Meilisearch health check → 정상 응답
✅ 콘솔 에러 0건
```

---

## 0.10 PM팀 개발 관리 프로세스

### 기능별 개발 사이클 (★ 필수 준수)

```
[PM팀 강민호] 기능 할당 + 이슈 생성 (오민정)
    ↓
[김현태] feature/{이슈번호}-{기능명} 브랜치 생성
    ↓
[개발팀] 기능 개발 → 커밋 [검증:대기]
    ↓
[개발팀] 자체 실행 검증 → 에러 0건 → [검증:통과]
    ↓
[개발팀] develop 최신 머지 → 통합 검증 → [검증:통합통과]
    ↓
[개발팀] PR 생성 (검증 결과 섹션 필수)
    ↓
[정대훈/윤성호/한소라] 일관성 검토
    ↓
[김현태] develop 머지 → 진도표 업데이트
    ↓
[PM팀] 진행 현황 보고 출력
```

### 진행 현황 보고 형식

```
📊 tilea.kr 개발 진행 현황
━━━━━━━━━━━━━━━━━━━━━━━━━
[전체 진도] ██░░░░░░░░ 10% (prd0 완료)

| PRD | 기능 | 상태 | 담당 | 검증 |
|-----|------|------|------|------|
| prd0 | 프로젝트 초기화 | ✅ 완료 | 김태현+임동혁 | Pass |
| prd1 | 인증 시스템 | 🔄 진행중 | 오지훈+신예진 | - |
| prd2 | 사업자 프로필 | ⏳ 대기 | - | - |
| ... | ... | ... | ... | ... |
━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

> **다음 문서**: [prd1.md] 인증 시스템 & 회원 관리
