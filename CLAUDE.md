# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 서비스 구축 및 개발을 위한 팀별 페르소나 시스템

`.claude/CLAUDE.md`에 78명 가상 팀 페르소나 시스템 정의. 개발 요청은 `@PM팀`으로 시작하거나 `@P디자인팀`  팀별호출, 기능 1개 완료마다 실행 검증(에러 0건) + 누적 통합 검증 필수. 상세 팀 구성은 `.claude/personas/` 참조.

## 프로젝트 개요

**tilea.kr** - 목공·목재 산업 종합 SaaS 플랫폼. 도메인: tilea.kr

6대 핵심 서비스: 업무관리 SaaS(재단계산/견적/재고/프로젝트/CRM), 커뮤니티, 역경매, 마켓플레이스, 뉴스/정보, 온라인 클래스.

PRD 문서 20개(`prd/prd0.md`~`prd/prd19.md`)에 전체 요구사항 정의됨. `prd0.md`이 총괄 아키텍처·로드맵 문서.

## 현재 상태

프로젝트 초기화 이전 단계. `src/index.js`에 Express 플레이스홀더만 존재. Next.js 14 전환 및 전체 프로젝트 구조 셋업이 필요함 (prd0 체크리스트 참조).

## 목표 기술 스택 (prd0 기준)

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) + TypeScript 5.x |
| 스타일링 | Tailwind CSS 3.x + Pretendard 폰트 |
| 상태관리 | Zustand 4.x |
| DB/ORM | PostgreSQL 16 + Prisma 5.x |
| 캐싱 | Redis 7.x |
| 인증 | Auth.js (NextAuth v5) - 카카오/네이버/구글 |
| 파일저장 | Cloudflare R2 (S3 호환) |
| 검색 | Meilisearch 1.x (한국어 자체 호스팅) |
| 결제 | 토스페이먼츠 SDK 2.x |
| 실시간 | Socket.IO 4.x |
| 배포 | Coolify + Docker |
| 모니터링 | Sentry + Umami |

주요 라이브러리: Tiptap(에디터), Recharts(차트), React Hook Form+Zod(폼), TanStack Table(테이블), @react-pdf/renderer(PDF), html5-qrcode(바코드), @dnd-kit/core(DnD)

## 개발 환경 실행

```bash
# 서비스 시작 (4컨테이너: app, database, redis, adminer)
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 서비스 중지
docker-compose down
```

### 포트 매핑

| 서비스 | 포트 |
|--------|------|
| Web (Next.js) | localhost:5679 |
| PostgreSQL | localhost:5680 |
| Redis | localhost:5681 |
| Adminer (DB 관리 UI) | localhost:5682 |

### 컨테이너 접속

```bash
docker exec -it tilea.kr_app sh
docker exec -it tilea.kr_db psql -U tilea.kr_user -d tilea.kr_db
```

## 목표 디렉토리 구조 (prd0 정의)

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/          # 인증 라우트 그룹
│   ├── (dashboard)/     # 대시보드 라우트 그룹
│   ├── (public)/        # 공개 라우트 그룹
│   ├── admin/           # 관리자
│   └── api/             # API Routes
├── components/
│   ├── ui/              # 기본 UI (shadcn 스타일)
│   ├── forms/           # 폼 컴포넌트
│   ├── layouts/         # 레이아웃
│   └── features/        # 기능별 컴포넌트
├── lib/                 # 클라이언트 설정 (auth, prisma, redis, r2, meilisearch, toss)
├── hooks/               # 커스텀 React 훅
├── stores/              # Zustand 스토어
├── types/               # TypeScript 타입 정의
└── styles/              # 글로벌 스타일
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
tests/
├── unit/
├── integration/
└── e2e/
```

## 디자인 시스템

```css
--color-primary: #8B6914;       /* 진한 우드 브라운 */
--color-secondary: #D4A843;     /* 밝은 골드 브라운 */
--color-accent: #2E7D32;        /* 그린 (친환경) */
--color-background: #FAFAF5;    /* 따뜻한 오프화이트 */
```

본문: Pretendard 16px/1.6, 아이콘: Lucide React, 반응형: 768px/1024px 기준

## Git 컨벤션

```
[타입] 설명 (#이슈번호) [검증:태그]

# 타입: feat | fix | docs | style | refactor | test | chore | verify
# 검증태그: [검증:대기] | [검증:통과] | [검증:통합통과] | [검증:실패]

# 예시
feat: 카카오 소셜 로그인 구현 (#3) [검증:통과]
```

브랜치: `main`(프로덕션) → `develop`(개발통합) → `feature/{이슈번호}-{기능명}`, `hotfix/{이슈번호}-{설명}`, `release/{버전}`

## PRD 인덱스

| PRD | 핵심 기능 | Phase |
|-----|-----------|-------|
| prd0 | 아키텍처, Git, 로드맵 | 0 |
| prd1 | 인증 (카카오/네이버/구글/이메일) | 1 |
| prd2 | 사업자 프로필 & 역할 | 1 |
| prd3 | 재단 계산기 (킬러 기능, 2D Bin Packing) | 1 |
| prd4 | 견적서 관리 | 1 |
| prd5 | 재고 관리 (QR 스캔) | 2 |
| prd6 | 프로젝트 관리 (칸반) | 2 |
| prd7 | CRM & 매출/회계 | 2 |
| prd8 | 커뮤니티 게시판 (7종) | 1 |
| prd9 | 중고거래 | 2 |
| prd10 | 역경매 시스템 | 2 |
| prd11 | 마켓 상품/카테고리 | 3 |
| prd12 | 주문/결제/배송 | 3 |
| prd13 | 뉴스/정보 | 1 |
| prd14 | 온라인 클래스 (수강) | 3 |
| prd15 | 온라인 클래스 (강사/정산) | 3 |
| prd16 | 메시징/알림 | 3 |
| prd17 | 관리자 대시보드 | 4 |
| prd18 | 배포/인프라/모니터링 | 4 |
| prd19 | QA/테스트 가이드 | 4 |

## 환경변수 주의사항

- Coolify 배포 시 `${VAR}` 문법만 사용. `${VAR:-default}` 형태 사용 금지 (Go 템플릿 비호환)
- 컨테이너 내부에서 DB 접속 시 호스트명은 `database` (localhost 아님)
- `.env` 파일에 포트/DB 크레덴셜 정의됨


