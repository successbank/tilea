# PRD 11: 마켓플레이스 — 상품/카테고리

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **개발**: 김태현(BE) + 신예진(FE)  
> **의존관계**: prd1, prd2 | **연관**: prd12(주문/결제)

---

## 11.1 기능 명세

### F11-1. 상품 등록/관리 (판매자)
```yaml
API:
  - CRUD /api/products
  - POST /api/products/:id/images (이미지 업로드, 최대 20장)
  - GET /api/products/my (내 상품 관리)

판매자 유형: 공식입점업체(월정액+3~8%), 개인판매자(5~10%), 제휴링크
데이터: 제목, 설명(에디터), 카테고리, 가격, 재고수량, 이미지, 동영상URL, 스펙
```

### F11-2. 카테고리 트리 (6대 카테고리)
```yaml
구조: 전동공구 > 톱 > 테이블쏘 (3단계 트리)
API:
  - GET /api/categories (트리 전체)
  - GET /api/categories/:slug/products

카테고리:
  1. 전동공구 (톱, 대패, 라우터, 샌더, 드릴, CNC, 기타)
  2. 수공구 (끌, 대패, 톱, 클램프, 측정, 기타)
  3. 목재/판재 (원목, 합판/MDF, 집성목, 데크재, 특수)
  4. 하드웨어/부자재 (경첩, 레일, 손잡이, 나사, 접착제, 도료)
  5. 안전장비 (집진기, 보안경, 보호구)
  6. 소프트웨어/도서
```

### F11-3. 상품 검색/필터
```yaml
Meilisearch 연동:
  - 제목+설명 전문 검색
  - 필터: 카테고리, 가격범위, 브랜드, 평점, 배송방식
  - 정렬: 인기순, 가격순, 최신순, 평점순

상품 비교: 동일 카테고리 제품 스펙 비교표 (최대 4개)
리뷰/평점: 구매 후 리뷰 작성, 5점 척도 + 사진
위시리스트: 찜하기 기능
```

---

## 11.2 DB 스키마

```prisma
model Product {
  id          String   @id @default(cuid())
  sellerId    String
  title       String
  description String   @db.Text
  categoryId  String
  price       Float
  salePrice   Float?
  stock       Int      @default(0)
  images      String[]
  videoUrl    String?
  specs       Json?     // 스펙 JSON
  brand       String?
  status      ProductStatus @default(ACTIVE)
  
  averageRating Float  @default(0)
  reviewCount   Int    @default(0)
  salesCount    Int    @default(0)
  
  category    ProductCategory @relation(fields: [categoryId], references: [id])
  reviews     ProductReview[]
  orderItems  OrderItem[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@map("products")
}

model ProductCategory {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  parentId  String?
  depth     Int      @default(0)
  sortOrder Int      @default(0)
  
  parent    ProductCategory? @relation("subcategories", fields: [parentId], references: [id])
  children  ProductCategory[] @relation("subcategories")
  products  Product[]
  @@map("product_categories")
}

model ProductReview {
  id        String   @id @default(cuid())
  productId String
  userId    String
  rating    Float
  content   String?  @db.Text
  images    String[]
  createdAt DateTime @default(now())
  
  product   Product  @relation(fields: [productId], references: [id])
  @@map("product_reviews")
}

enum ProductStatus { ACTIVE, INACTIVE, SOLDOUT }
```

---

## 11.3 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 상품 등록 + 이미지 업로드 → 상품 페이지 표시 | ⬜ |
| ✅-2 | 카테고리 트리 네비게이션 동작 | ⬜ |
| ✅-3 | Meilisearch 검색 → 상품 결과 표시 | ⬜ |
| ✅-4 | 필터 (카테고리/가격/브랜드/평점) 동작 | ⬜ |
| ✅-5 | 상품 비교 (4개까지) 정상 | ⬜ |
| ✅-6 | 위시리스트 추가/제거 | ⬜ |
| ✅-7 | 리뷰 작성 + 평점 반영 | ⬜ |
| ✅-8 | 서버/브라우저 에러 0건 + 통합 검증 | ⬜ |

> **다음 문서**: [prd12.md] 주문/결제/배송
