# PRD 5: 재고 관리

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **개발**: 김태현(BE) + 조현우(FE)  
> **의존관계**: prd1, prd2 | **SaaS**: 스타터 플랜 이상

---

## 5.1 기능 명세

### F5-1. 자재 입고/출고 관리
```yaml
API:
  - POST /api/inventory: 자재 등록
  - GET /api/inventory: 재고 목록 (카테고리별 필터)
  - PUT /api/inventory/:id: 수정
  - POST /api/inventory/:id/transaction: 입고/출고 기록
  - GET /api/inventory/:id/history: 입출고 이력

카테고리: 판재, 각재, 하드웨어, 도료, 부자재, 기타
입출고: { type: "IN"|"OUT", quantity, unitPrice, note, date }
```

### F5-2. 재고 현황 대시보드
```yaml
화면: /dashboard/inventory
내용: 카테고리별 현황, 최근 입출고, 안전재고 경고 목록
차트: 월별 사용량 추이 (Recharts)
```

### F5-3. 안전재고 알림
```yaml
설정: 자재별 최소 수량 임계치
알림: 재고 < 임계치 → 대시보드 알림 + 이메일 (선택)
```

### F5-4. 바코드/QR 스캔 입출고
```yaml
기술: html5-qrcode 라이브러리
프로세스: 모바일 카메라 → QR 스캔 → 자재 조회 → 입고/출고 기록
```

### F5-5. 월별 자재 사용 리포트
```yaml
API: GET /api/inventory/report?year=2026&month=4
내용: 카테고리별 사용량, 금액, 전월 대비 증감
PDF: 월간 리포트 다운로드
```

---

## 5.2 DB 스키마

```prisma
model Inventory {
  id          String   @id @default(cuid())
  userId      String
  name        String
  category    InventoryCategory
  spec        String?    // 규격 (예: 2440×1220×18mm)
  unit        String     // 장, 개, m, kg 등
  quantity    Float      @default(0)
  unitPrice   Float      @default(0)
  minQuantity Float?     // 안전재고 수량
  location    String?    // 보관 위치
  barcode     String?    // QR/바코드
  image       String?    // 사진 URL
  
  transactions InventoryTransaction[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
  @@map("inventories")
}

model InventoryTransaction {
  id          String   @id @default(cuid())
  inventoryId String
  type        TransactionType  // IN | OUT
  quantity    Float
  unitPrice   Float?
  note        String?
  date        DateTime @default(now())
  
  inventory   Inventory @relation(fields: [inventoryId], references: [id])
  @@map("inventory_transactions")
}

enum InventoryCategory { PANEL, TIMBER, HARDWARE, PAINT, ACCESSORY, OTHER }
enum TransactionType { IN, OUT }
```

---

## 5.3 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 자재 등록 → 목록에서 조회 | ⬜ |
| ✅-2 | 입고 기록 → 수량 증가 확인 | ⬜ |
| ✅-3 | 출고 기록 → 수량 감소 확인 | ⬜ |
| ✅-4 | 안전재고 이하 → 알림 표시 | ⬜ |
| ✅-5 | QR 스캔 → 자재 자동 조회 | ⬜ |
| ✅-6 | 대시보드 차트 정상 렌더링 | ⬜ |
| ✅-7 | 월별 리포트 생성 + PDF 다운로드 | ⬜ |
| ✅-8 | 서버/브라우저 에러 0건 + 이전 기능 통합 검증 | ⬜ |

> **다음 문서**: [prd6.md] 프로젝트 관리
