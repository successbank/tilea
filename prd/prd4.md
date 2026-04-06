# PRD 4: 견적서 관리

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **개발**: 김태현(BE) + 조현우(FE)  
> **의존관계**: prd1, prd2 | **연관**: prd3(재단→견적 연동), prd6(프로젝트→견적)

---

## 4.1 기능 명세

### F4-1. 견적서 생성

```yaml
기능ID: F4-1
기능명: 견적서 생성 및 관리
API:
  - POST /api/estimates: 견적서 생성
  - GET /api/estimates: 목록 조회 (페이지네이션)
  - GET /api/estimates/:id: 상세 조회
  - PUT /api/estimates/:id: 수정
  - DELETE /api/estimates/:id: 삭제
  - POST /api/estimates/:id/duplicate: 복제

데이터:
  - 고객 정보 (이름, 연락처, 주소)
  - 항목 목록: [{category, name, spec, quantity, unitPrice, amount}]
  - 카테고리: 재료비, 인건비, 부자재, 운반비, 기타
  - 소계 + 마진율(%) → 최종 금액
  - 유효기간, 메모

완료기준:
  - 항목 추가/삭제 → 소계 자동 계산
  - 마진율 적용 → 최종 금액 자동 산출
  - 견적서 저장 → 목록에서 조회 가능
```

### F4-2. 견적 템플릿

```yaml
기능ID: F4-2
기능명: 유형별 견적 템플릿
템플릿 종류:
  - 가구 제작 (식탁, 책상, 수납장)
  - 인테리어 시공 (몰딩, 붙박이장, 데크)
  - 재단 가공 (CNC, 일반 재단)
  - 빈 템플릿 (직접 구성)

완료기준:
  - 템플릿 선택 → 기본 항목 자동 채워짐
  - 사용자 커스텀 템플릿 저장/불러오기
```

### F4-3. 견적서 PDF / 전송

```yaml
기능ID: F4-3
기능명: 견적서 PDF 출력 및 전송
API:
  - GET /api/estimates/:id/pdf → PDF 생성/다운로드
  - POST /api/estimates/:id/send → 이메일 전송 (Resend)

PDF 내용:
  - 헤더: 사업자 정보 (상호, 사업자번호, 연락처)
  - 본문: 항목 테이블 + 소계 + 마진 + 최종 금액
  - 푸터: 유효기간, 안내사항

완료기준:
  - PDF 다운로드 → A4 인쇄 가능
  - 이메일 전송 → 고객 수신 확인
```

### F4-4. 견적 이력 및 전환 추적

```yaml
기능ID: F4-4
기능명: 견적 → 주문 전환 추적
상태: 작성중 → 발송 → 수락 → 계약 → 완료 / 거절
추적: 고객별, 프로젝트별 견적 히스토리
통계: 전환율 (발송 대비 수락 비율)
```

---

## 4.2 DB 스키마

```prisma
model Estimate {
  id            String   @id @default(cuid())
  userId        String
  estimateNo    String   @unique  // EST-20260401-001
  
  // 고객 정보
  customerName  String
  customerPhone String?
  customerEmail String?
  customerAddress String?
  
  // 항목
  items         Json     // [{category, name, spec, qty, unitPrice, amount}]
  
  // 금액
  subtotal      Float    @default(0)
  marginRate    Float    @default(10) // %
  marginAmount  Float    @default(0)
  totalAmount   Float    @default(0)
  
  // 메타
  status        EstimateStatus @default(DRAFT)
  validUntil    DateTime?
  notes         String?  @db.Text
  templateType  String?  // 템플릿 유형
  
  // 관계
  projectId     String?
  customerId    String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id])
  
  @@map("estimates")
}

enum EstimateStatus {
  DRAFT      // 작성중
  SENT       // 발송
  ACCEPTED   // 수락
  CONTRACTED // 계약
  COMPLETED  // 완료
  REJECTED   // 거절
}
```

---

## 4.3 개발 태스크

| # | 태스크 | 담당 | 예상 |
|---|--------|------|------|
| T4-1 | Estimate Prisma 모델 + 마이그레이션 | 한승우 | 1h |
| T4-2 | 견적서 CRUD API | 김태현 | 4h |
| T4-3 | 견적번호 자동 생성 로직 | 김태현 | 1h |
| T4-4 | 견적서 작성 UI (항목 동적 추가/삭제) | 조현우 | 6h |
| T4-5 | 금액 자동 계산 (소계+마진) | 조현우 | 2h |
| T4-6 | 견적 템플릿 시스템 | 김태현+조현우 | 4h |
| T4-7 | 견적서 PDF 생성 (@react-pdf/renderer) | 신예진 | 5h |
| T4-8 | 이메일 전송 (Resend) | 김태현 | 2h |
| T4-9 | 견적 목록/검색 UI | 조현우 | 3h |
| T4-10 | 상태 변경 + 전환 추적 | 김태현 | 2h |

---

## 4.4 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 견적서 작성 → 항목 추가 → 소계 자동 계산 | ⬜ |
| ✅-2 | 마진율 변경 → 최종 금액 즉시 업데이트 | ⬜ |
| ✅-3 | 템플릿 선택 → 기본 항목 자동 채움 | ⬜ |
| ✅-4 | PDF 다운로드 → A4 인쇄 레이아웃 정상 | ⬜ |
| ✅-5 | 이메일 전송 → 수신 확인 | ⬜ |
| ✅-6 | 견적 목록 조회 + 검색 동작 | ⬜ |
| ✅-7 | 견적 복제 → 새 견적서 생성 | ⬜ |
| ✅-8 | 상태 변경 (작성→발송→수락) 정상 | ⬜ |
| ✅-9 | 서버/브라우저 에러 0건 + 이전 기능 통합 검증 | ⬜ |

---

> **다음 문서**: [prd5.md] 재고 관리
