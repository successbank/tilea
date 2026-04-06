# PRD 9: 중고거래

> **프로젝트**: tilea.kr | **담당PM**: 최윤아 | **개발**: 김태현(BE) + 조현우(FE)  
> **의존관계**: prd1, prd8(커뮤니티 기반)

---

## 9.1 기능 명세

### F9-1. 중고거래 게시글
```yaml
API: CRUD /api/trade
구분: 판매 | 구매 | 교환 | 나눔
카테고리: 수공구, 전동공구, 목재, 합판, 하드웨어, 도료, 기타
상태: 판매중 → 예약중 → 거래완료
필드: 제목, 설명, 이미지(최대10장), 가격, 지역(시/도, 시/군/구), 카테고리
필터: 지역, 카테고리, 가격범위, 거래상태
```

### F9-2. 거래 소통
```yaml
쪽지/채팅: prd16 메시징 시스템 연동
거래 후기: 5점 척도 + 텍스트 리뷰
사기 방지: 휴대폰 인증 회원만 등록 가능
```

---

## 9.2 DB 스키마

```prisma
model TradePost {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String   @db.Text
  images      String[]
  price       Float?
  tradeType   TradeType   // SELL, BUY, EXCHANGE, FREE
  category    String
  status      TradeStatus @default(ACTIVE)
  region      String      // 시/도
  district    String?     // 시/군/구
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
  @@map("trade_posts")
}

enum TradeType { SELL, BUY, EXCHANGE, FREE }
enum TradeStatus { ACTIVE, RESERVED, COMPLETED, HIDDEN }
```

---

## 9.3 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 중고거래 글 작성 + 이미지 업로드 | ⬜ |
| ✅-2 | 지역/카테고리/가격 필터 동작 | ⬜ |
| ✅-3 | 거래 상태 변경 (판매중→예약→완료) | ⬜ |
| ✅-4 | 거래 후기 작성 + 평점 | ⬜ |
| ✅-5 | 서버/브라우저 에러 0건 + 통합 검증 | ⬜ |

> **다음 문서**: [prd10.md] 역경매 시스템
