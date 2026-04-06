# PRD 10: 역경매 시스템 (일감 매칭)

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **개발**: 김태현(BE) + 신예진(FE) + 조현우(FE)  
> **의존관계**: prd1, prd2(사업자 프로필)

---

## 10.1 기능 명세

### F10-1. 의뢰 등록 (의뢰인)
```yaml
API: POST /api/auction/requests
카테고리: 맞춤가구, 인테리어목공, 재단가공, 보수/수리, 기타
입력: 상세요구사항, 참고이미지(최대10장), 희망예산, 납기일, 작업지역
공개: 전체공개 | 초대제한
```

### F10-2. 입찰 (사업자)
```yaml
API: POST /api/auction/requests/:id/bids
입력: 가격(항목별 breakdown), 예상기간, 포트폴리오, 추가설명
알림: 새 의뢰 등록 시 매칭 사업자에게 알림 (카테고리+지역 기반)
```

### F10-3. 업체 선정 & 리뷰
```yaml
비교표: 가격, 평점, 리뷰수, 경력, 포트폴리오 한눈에
계약: 업체 선정 → 계약 확정
리뷰: 5점 척도 (품질, 소통, 일정준수, 가격적정성) + 사진 + 텍스트
```

### F10-4. 에스크로 (Phase 4)
```yaml
안전거래: 계약금 예치 → 작업완료 → 의뢰인 확인 → 정산
구현: Phase 4에서 토스페이먼츠 에스크로 API 연동
```

---

## 10.2 DB 스키마

```prisma
model AuctionRequest {
  id          String   @id @default(cuid())
  userId      String   // 의뢰인
  category    String
  title       String
  description String   @db.Text
  images      String[]
  budgetMin   Float?
  budgetMax   Float?
  deadline    DateTime?
  region      String
  district    String?
  visibility  AuctionVisibility @default(PUBLIC)
  status      AuctionStatus @default(OPEN)
  bidDeadline DateTime?
  
  bids        AuctionBid[]
  contract    AuctionContract?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
  @@map("auction_requests")
}

model AuctionBid {
  id          String   @id @default(cuid())
  requestId   String
  bidderId    String   // 사업자
  price       Float
  priceBreakdown Json?  // 항목별 상세
  estimatedDays Int?
  portfolio   String[]
  message     String?  @db.Text
  status      BidStatus @default(SUBMITTED)
  
  createdAt   DateTime @default(now())
  request     AuctionRequest @relation(fields: [requestId], references: [id])
  @@map("auction_bids")
}

model AuctionContract {
  id          String   @id @default(cuid())
  requestId   String   @unique
  bidId       String
  status      ContractStatus @default(IN_PROGRESS)
  completedAt DateTime?
  
  reviews     Review[]
  createdAt   DateTime @default(now())
  request     AuctionRequest @relation(fields: [requestId], references: [id])
  @@map("auction_contracts")
}

model Review {
  id          String   @id @default(cuid())
  contractId  String
  reviewerId  String   // 의뢰인
  targetId    String   // 사업자
  rating      Float    // 종합
  qualityRating  Float?
  communicationRating Float?
  punctualityRating Float?
  priceRating Float?
  content     String?  @db.Text
  images      String[]
  reply       String?  @db.Text  // 사업자 답글
  
  createdAt   DateTime @default(now())
  contract    AuctionContract @relation(fields: [contractId], references: [id])
  @@map("reviews")
}

enum AuctionVisibility { PUBLIC, PRIVATE }
enum AuctionStatus { OPEN, BIDDING, SELECTED, CONTRACTED, COMPLETED, CANCELLED }
enum BidStatus { SUBMITTED, SELECTED, REJECTED }
enum ContractStatus { IN_PROGRESS, COMPLETED, DISPUTED }
```

---

## 10.3 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 의뢰 등록 → 목록에서 조회 | ⬜ |
| ✅-2 | 카테고리/지역 매칭 → 사업자 알림 | ⬜ |
| ✅-3 | 사업자 입찰 → 의뢰 상세에 표시 | ⬜ |
| ✅-4 | 입찰 비교표 정상 렌더링 | ⬜ |
| ✅-5 | 업체 선정 → 계약 확정 → 상태 변경 | ⬜ |
| ✅-6 | 작업 완료 → 리뷰 작성 (별점+사진) | ⬜ |
| ✅-7 | 사업자 프로필에 평균 평점 반영 | ⬜ |
| ✅-8 | 사업자 답글 기능 | ⬜ |
| ✅-9 | 서버/브라우저 에러 0건 + 통합 검증 | ⬜ |

> **다음 문서**: [prd11.md] 마켓 상품/카테고리
