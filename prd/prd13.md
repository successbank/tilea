# PRD 13: 뉴스/정보 서비스

> **프로젝트**: tilea.kr | **담당PM**: 최윤아 | **개발**: 개발2팀 이준혁(BE) + 이서영(FE)  
> **의존관계**: prd1

---

## 13.1 기능 명세

### F13-1. 뉴스/칼럼 게시
```yaml
API: CRUD /api/articles
콘텐츠 유형: 업계뉴스, 정부지원사업, 전시/박람회, 장비리뷰, 기술칼럼, 법규/인증
카테고리별 피드 구독
SEO: 정적 생성 (SSG) + 메타 태그 최적화
```

### F13-2. 정부 지원사업 정보
```yaml
API: CRUD /api/support-programs
데이터: 사업명, 지원내용, 대상, 신청기간, 신청방법, 지역
기능: 스크랩 → D-day 알림, 지역별 필터
향후: 크롤링 자동 수집 (Phase 4)
```

### F13-3. 뉴스레터
```yaml
주간 다이제스트 이메일 (Resend)
구독 관리: /profile/settings → 뉴스레터 수신 동의
키워드 알림: "소상공인", "CNC" 등 관심 키워드 설정
```

---

## 13.2 DB 스키마

```prisma
model Article {
  id          String   @id @default(cuid())
  authorId    String   // 관리자 또는 기고자
  title       String
  slug        String   @unique
  content     String   @db.Text
  excerpt     String?
  coverImage  String?
  category    String
  tags        String[]
  views       Int      @default(0)
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@map("articles")
}

model SupportProgram {
  id          String   @id @default(cuid())
  title       String
  organization String
  description String   @db.Text
  target      String?
  region      String?
  applyStart  DateTime?
  applyEnd    DateTime?
  applyUrl    String?
  status      String   @default("active")
  createdAt   DateTime @default(now())
  @@map("support_programs")
}
```

---

## 13.3 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 뉴스 게시 (관리자) → 목록 조회 | ⬜ |
| ✅-2 | 카테고리별 피드 표시 | ⬜ |
| ✅-3 | 지원사업 목록 + 지역 필터 | ⬜ |
| ✅-4 | 스크랩 + D-day 알림 | ⬜ |
| ✅-5 | SEO 메타 태그 정상 (OG, title) | ⬜ |
| ✅-6 | 서버/브라우저 에러 0건 + 통합 검증 | ⬜ |

> **다음 문서**: [prd14.md] 온라인 클래스 (수강)
