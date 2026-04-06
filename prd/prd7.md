# PRD 7: 고객 관리(CRM) & 매출/회계 간편 관리

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **개발**: 김태현(BE) + 강지훈(차트/FE)  
> **의존관계**: prd1, prd2, prd4, prd6 | **SaaS**: 프로 플랜 이상

---

## 7.1 기능 명세

### F7-1. 고객 관리 (CRM)
```yaml
API:
  - CRUD /api/customers
  - GET /api/customers/:id/history (거래 이력)
  - POST /api/customers/:id/memo
  - GET /api/customers/:id/receivables (미수금)

데이터: 이름, 연락처, 주소, 태그[], 메모, 거래 이력
```

### F7-2. 미수금 관리
```yaml
API:
  - POST /api/receivables: 청구서 발행
  - PUT /api/receivables/:id/confirm: 입금 확인
  - GET /api/receivables/overdue: 미수금 목록

알림: 미수금 발생 7일/14일/30일 후 알림
```

### F7-3. 매출 대시보드
```yaml
화면: /dashboard/finance
차트 (Recharts):
  - 일별/월별 매출 추이 (라인 차트)
  - 카테고리별 지출 비율 (파이 차트)
  - 월간 손익 요약 (바 차트)
```

### F7-4. 수입/지출 기록
```yaml
API: CRUD /api/expenses
카테고리: 자재비, 인건비, 임대료, 장비, 유틸리티, 기타
리포트: 월간/분기별 손익 계산서 PDF
```

---

## 7.2 DB 스키마

```prisma
model Customer {
  id        String   @id @default(cuid())
  userId    String
  name      String
  phone     String?
  email     String?
  address   String?
  tags      String[]
  memo      String?  @db.Text
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  @@map("customers")
}

model Expense {
  id        String   @id @default(cuid())
  userId    String
  type      ExpenseType  // INCOME | EXPENSE
  category  String
  amount    Float
  description String?
  date      DateTime @default(now())
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  @@map("expenses")
}

model Receivable {
  id         String   @id @default(cuid())
  userId     String
  customerId String
  amount     Float
  description String?
  dueDate    DateTime
  status     ReceivableStatus @default(PENDING)
  paidAt     DateTime?
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
  @@map("receivables")
}

enum ExpenseType { INCOME, EXPENSE }
enum ReceivableStatus { PENDING, PAID, OVERDUE }
```

---

## 7.3 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 고객 CRUD + 태그 검색 | ⬜ |
| ✅-2 | 고객별 거래 이력 조회 | ⬜ |
| ✅-3 | 미수금 등록 → 알림 발생 | ⬜ |
| ✅-4 | 입금 확인 → 상태 변경 | ⬜ |
| ✅-5 | 매출 대시보드 차트 렌더링 | ⬜ |
| ✅-6 | 수입/지출 기록 → 손익 계산 | ⬜ |
| ✅-7 | 서버/브라우저 에러 0건 + 통합 검증 | ⬜ |

> **다음 문서**: [prd8.md] 커뮤니티 게시판
