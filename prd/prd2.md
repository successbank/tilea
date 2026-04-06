# PRD 2: 사업자 프로필 & 역할 시스템

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **개발**: 김태현(BE) + 신예진(FE)  
> **의존관계**: prd1 완료 필수

---

## 2.1 기능 명세

### F2-1. 사업자 인증 프로세스

```yaml
기능ID: F2-1
기능명: 사업자등록번호 인증
담당: 김태현(BE) + 신예진(FE)

프로세스:
  1. 일반 회원이 "사업자 인증" 신청
  2. 사업자등록번호 입력
  3. 국세청 API 조회 → 유효성 확인
  4. 관리자 최종 승인
  5. UserRole → BUSINESS 변경

API:
  - POST /api/business/verify
    요청: { businessNumber, businessName, ownerName, businessType }
    응답: { verified: boolean, ntsSatus: "계속사업자" }
  - GET /api/business/verification-status
    응답: { status: "pending"|"approved"|"rejected" }
  - PUT /api/admin/business/approve/:id (관리자)
    응답: { approved: true }

외부API:
  - 국세청 사업자등록 상태조회 Open API
    URL: https://api.odcloud.kr/api/nts-businessman/v1/status
    인증: 공공데이터포털 API 키

완료기준:
  - 유효한 사업자번호 → "확인됨" 표시
  - 잘못된 사업자번호 → "유효하지 않음" 에러
  - 관리자 승인 → role BUSINESS로 변경 확인
```

### F2-2. 사업자 프로필

```yaml
기능ID: F2-2
기능명: 사업자 프로필 관리
담당: 김태현(BE) + 신예진(FE)

API:
  - POST /api/business/profile
    요청: { shopName, specialty[], introduction, address, phone, portfolio[] }
  - GET /api/business/profile/:userId
  - PUT /api/business/profile
  - GET /api/business/search?keyword=&region=&specialty=

화면:
  - /auth/verify-business: 사업자 인증 페이지
  - /profile/:userId: 공개 프로필 (포트폴리오 포함)
  - /dashboard/settings/business: 사업자 프로필 편집

완료기준:
  - 프로필 저장 → 공개 페이지에서 조회 가능
  - 포트폴리오 이미지 업로드 (R2) → 표시 확인
  - 전문분야/지역 검색 → 결과 표시
```

---

## 2.2 DB 스키마

```prisma
model BusinessProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  businessNumber  String   @unique  // 사업자등록번호
  businessName    String             // 상호명
  ownerName       String             // 대표자명
  businessType    String?            // 업종
  shopName        String?            // 공방/가게명
  introduction    String?  @db.Text  // 소개
  specialty       String[]           // 전문분야 태그
  address         String?            // 주소
  addressDetail   String?
  phone           String?
  website         String?
  
  verificationStatus VerificationStatus @default(PENDING)
  verifiedAt      DateTime?
  
  // 포트폴리오
  portfolioImages String[]           // R2 URL 배열
  
  // 평점
  averageRating   Float    @default(0)
  reviewCount     Int      @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@map("business_profiles")
}

enum VerificationStatus {
  PENDING    // 심사 대기
  APPROVED   // 승인
  REJECTED   // 거절
}
```

---

## 2.3 개발 태스크

| # | 태스크 | 담당 | 테스트 | 예상 |
|---|--------|------|--------|------|
| T2-1 | BusinessProfile Prisma 모델 | 한승우 | 마이그레이션 성공 | 1h |
| T2-2 | 국세청 API 연동 (사업자 조회) | 김태현 | 유효번호 → true 반환 | 3h |
| T2-3 | 사업자 인증 API (POST /api/business/verify) | 김태현 | API 호출 → DB 저장 | 2h |
| T2-4 | 관리자 승인 API | 김태현 | 승인 → role 변경 확인 | 2h |
| T2-5 | 사업자 인증 UI | 신예진 | 번호 입력 → 결과 표시 | 3h |
| T2-6 | 프로필 CRUD API | 김태현 | 생성/조회/수정 정상 | 3h |
| T2-7 | 포트폴리오 이미지 업로드 (R2) | 김태현 | 이미지 업로드 → URL 반환 | 3h |
| T2-8 | 공개 프로필 페이지 UI | 신예진 | /profile/:id → 정보 표시 | 4h |
| T2-9 | 사업자 프로필 편집 UI | 신예진 | 정보 수정 → 저장 성공 | 3h |

---

## 2.4 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 국세청 API 호출 → 유효 사업자번호 확인됨 | ⬜ |
| ✅-2 | 잘못된 사업자번호 → 에러 메시지 표시 | ⬜ |
| ✅-3 | 관리자 승인 → user.role이 BUSINESS로 변경 | ⬜ |
| ✅-4 | 프로필 저장 → /profile/:id에서 조회 가능 | ⬜ |
| ✅-5 | 포트폴리오 이미지 업로드 → 페이지에 표시 | ⬜ |
| ✅-6 | 사업자 미인증 회원 → 업무 관리 도구 접근 차단 | ⬜ |
| ✅-7 | 서버/브라우저 에러 0건 | ⬜ |
| ✅-8 | prd1 기능 통합 검증 (로그인 정상 동작) | ⬜ |

---

> **다음 문서**: [prd3.md] 재단 계산기
