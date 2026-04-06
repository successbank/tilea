# PRD 12: 마켓플레이스 — 주문/결제/배송

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **개발**: 김태현(BE) + 오지훈(보안) + 조현우(FE)  
> **의존관계**: prd11(상품) | **결제**: 토스페이먼츠 SDK (@tosspayments/tosspayments-sdk)

---

## 12.1 기능 명세

### F12-1. 장바구니
```yaml
API:
  - POST /api/cart: 상품 추가
  - GET /api/cart: 장바구니 조회
  - PUT /api/cart/:id: 수량 변경
  - DELETE /api/cart/:id: 삭제
저장: Redis (비로그인) + DB (로그인)
```

### F12-2. 결제 (토스페이먼츠)
```yaml
SDK: @tosspayments/tosspayments-sdk v2.x
결제수단: 카드, 무통장, 간편결제 (카카오페이, 토스페이)
프로세스:
  1. 주문서 생성 (POST /api/orders)
  2. 토스 결제창 호출 (프론트엔드 SDK)
  3. 결제 승인 (POST /api/payments/confirm)
  4. 주문 확정 + 재고 차감
  
API:
  - POST /api/orders: 주문 생성
  - POST /api/payments/confirm: 결제 승인
  - GET /api/orders: 주문 목록
  - GET /api/orders/:id: 주문 상세
  - POST /api/orders/:id/cancel: 주문 취소
  - POST /api/orders/:id/refund: 환불 요청

보안:
  - 결제 금액 서버 검증 (클라이언트 금액 ≠ DB 금액 → 거부)
  - idempotency key로 중복 결제 방지
```

### F12-3. 배송 추적
```yaml
택배사 API: 스마트택배 API 또는 Delivery Tracker
상태: 준비중 → 배송중 → 배송완료
운송장 등록: 판매자가 운송장 입력 → 구매자에게 알림
```

### F12-4. 판매자 정산
```yaml
수수료: 판매가 × 수수료율 (공식입점 3~8%, 개인 5~10%)
정산 주기: 월 2회 (1일, 16일)
정산 금액: 판매 합계 - 수수료 - 환불액
```

---

## 12.2 DB 스키마

```prisma
model Order {
  id            String   @id @default(cuid())
  orderNo       String   @unique  // ORD-20260401-001
  buyerId       String
  totalAmount   Float
  status        OrderStatus @default(PENDING)
  
  items         OrderItem[]
  payment       Payment?
  shipping      ShippingInfo?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@map("orders")
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  productId String
  sellerId  String
  quantity  Int
  unitPrice Float
  amount    Float
  
  order     Order    @relation(fields: [orderId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
  @@map("order_items")
}

model Payment {
  id          String   @id @default(cuid())
  orderId     String   @unique
  paymentKey  String   @unique  // 토스 paymentKey
  method      String             // CARD, BANK, EASY_PAY
  amount      Float
  status      PaymentStatus @default(PENDING)
  approvedAt  DateTime?
  
  order       Order    @relation(fields: [orderId], references: [id])
  @@map("payments")
}

model ShippingInfo {
  id          String   @id @default(cuid())
  orderId     String   @unique
  carrier     String?
  trackingNo  String?
  status      ShippingStatus @default(PREPARING)
  shippedAt   DateTime?
  deliveredAt DateTime?
  
  recipientName    String
  recipientPhone   String
  recipientAddress String
  
  order       Order    @relation(fields: [orderId], references: [id])
  @@map("shipping_infos")
}

enum OrderStatus { PENDING, PAID, SHIPPING, DELIVERED, COMPLETED, CANCELLED, REFUNDED }
enum PaymentStatus { PENDING, APPROVED, CANCELLED, REFUNDED }
enum ShippingStatus { PREPARING, SHIPPED, DELIVERED }
```

---

## 12.3 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 장바구니 추가/수량변경/삭제 | ⬜ |
| ✅-2 | 토스 결제창 호출 → 테스트 결제 성공 | ⬜ |
| ✅-3 | 결제 승인 → 주문 확정 → 재고 차감 | ⬜ |
| ✅-4 | 결제 금액 서버 검증 (위변조 방지) | ⬜ |
| ✅-5 | 주문 취소 → 환불 처리 | ⬜ |
| ✅-6 | 운송장 등록 → 배송 추적 표시 | ⬜ |
| ✅-7 | 판매자 정산 금액 계산 정확성 | ⬜ |
| ✅-8 | 서버/브라우저 에러 0건 + 통합 검증 | ⬜ |

> **다음 문서**: [prd13.md] 뉴스/정보 서비스
