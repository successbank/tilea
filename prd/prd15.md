# PRD 15: 온라인 클래스 — 강사/정산

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **개발**: 개발2팀 이준혁(BE) + 이서영(FE)  
> **의존관계**: prd14 | **정산**: 강사 70% : 플랫폼 30%

---

## 15.1 기능 명세

### F15-1. 강사 대시보드
```yaml
화면: /learn/instructor
내용: 내 강의 관리, 수강생 현황, 수익 정산
강의 등록: 제목, 설명, 커리큘럼, 가격, 미리보기영상
동영상 업로드: Cloudflare Stream → 자동 트랜스코딩 → HLS URL
```

### F15-2. 강의 CRUD (강사)
```yaml
API:
  - POST /api/instructor/courses: 강의 생성
  - PUT /api/instructor/courses/:id: 수정
  - POST /api/instructor/courses/:id/sections: 섹션 추가
  - POST /api/instructor/sections/:id/lessons: 레슨 추가
  - POST /api/instructor/lessons/:id/upload: 동영상 업로드
  - PUT /api/instructor/courses/:id/publish: 공개
```

### F15-3. 수익 정산
```yaml
API:
  - GET /api/instructor/revenue: 수익 현황
  - GET /api/instructor/payouts: 정산 내역
  - POST /api/admin/payouts/:id/process (관리자)

분배: 강사 70% : 플랫폼 30% (협의 가능)
정산 주기: 월 1회 (익월 15일)
원천징수: 사업소득 3.3%
정산 금액: (매출 × 70%) - 원천징수
```

### F15-4. 수강 분석 (강사)
```yaml
화면: /learn/instructor/analytics
지표: 수강생 수, 완강률, 평균 평점, 수익 추이
차트: Recharts (라인, 바)
```

---

## 15.2 DB 스키마

```prisma
model InstructorPayout {
  id           String   @id @default(cuid())
  instructorId String
  period       String   // "2026-04"
  grossAmount  Float    // 총 매출
  commission   Float    // 플랫폼 수수료
  tax          Float    // 원천징수
  netAmount    Float    // 정산 금액
  status       PayoutStatus @default(PENDING)
  paidAt       DateTime?
  
  createdAt    DateTime @default(now())
  @@map("instructor_payouts")
}

enum PayoutStatus { PENDING, PROCESSING, PAID }
```

---

## 15.3 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 강사 강의 생성 + 커리큘럼 구성 | ⬜ |
| ✅-2 | 동영상 업로드 → HLS 스트리밍 | ⬜ |
| ✅-3 | 강의 공개 → 학생 수강 가능 | ⬜ |
| ✅-4 | 수익 정산 금액 계산 정확성 | ⬜ |
| ✅-5 | 수강 분석 차트 렌더링 | ⬜ |
| ✅-6 | 서버/브라우저 에러 0건 + 통합 검증 | ⬜ |

> **다음 문서**: [prd16.md] 메시징/알림
