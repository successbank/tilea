# PRD 14: 온라인 클래스 — 강의/수강

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **개발**: 김태현(BE) + 신예진(FE)  
> **의존관계**: prd1, prd12(결제) | **동영상**: Cloudflare Stream 또는 Mux

---

## 14.1 기능 명세

### F14-1. 강의 목록/상세
```yaml
API:
  - GET /api/courses: 강의 목록 (카테고리/가격/평점 필터)
  - GET /api/courses/:id: 강의 상세 (커리큘럼, 미리보기)

카테고리: 입문/기초, 가구제작, 기법/테크닉, 디지털목공, 사업운영, 인테리어목공
유형: VOD(무제한 재생), 라이브(Phase4), 패키지코스, 무료컨텐츠
```

### F14-2. 수강 등록 & 결제
```yaml
API:
  - POST /api/courses/:id/enroll: 수강 등록 (토스페이먼츠)
  - GET /api/courses/my: 내 수강 목록

무료 강의: 즉시 등록
유료 강의: 토스페이먼츠 결제 → 등록
쿠폰: 기간한정, 수량한정, 패키지할인
```

### F14-3. 수강 플레이어
```yaml
화면: /learn/course/:id/lesson/:lessonId
동영상: HLS 스트리밍 (Cloudflare Stream)
기능: 진도율 자동 추적, 이어보기, 배속 조절, 학습노트
DRM: Cloudflare Stream 기본 보호 (불법 다운로드 방지)
```

### F14-4. 학습 관리
```yaml
진도율: 레슨별 시청 완료 추적 (80% 이상 → 완료)
퀴즈: 챕터별 간단 퀴즈 (JSON 기반)
수료증: 전체 진도 100% → PDF 수료증 발급
Q&A: 강의별 전용 Q&A 게시판
```

---

## 14.2 DB 스키마

```prisma
model Course {
  id            String   @id @default(cuid())
  instructorId  String
  title         String
  slug          String   @unique
  description   String   @db.Text
  coverImage    String?
  category      String
  price         Float    @default(0)
  salePrice     Float?
  level         String?  // beginner, intermediate, advanced
  isPublished   Boolean  @default(false)
  
  averageRating Float    @default(0)
  reviewCount   Int      @default(0)
  enrollCount   Int      @default(0)
  
  sections      CourseSection[]
  enrollments   Enrollment[]
  reviews       CourseReview[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@map("courses")
}

model CourseSection {
  id        String   @id @default(cuid())
  courseId   String
  title     String
  sortOrder Int      @default(0)
  lessons   Lesson[]
  course    Course   @relation(fields: [courseId], references: [id])
  @@map("course_sections")
}

model Lesson {
  id          String   @id @default(cuid())
  sectionId   String
  title       String
  videoUrl    String?    // Cloudflare Stream URL
  duration    Int?       // 초 단위
  isFree      Boolean    @default(false) // 미리보기 가능
  sortOrder   Int        @default(0)
  quiz        Json?      // [{question, options[], answer}]
  
  progress    LessonProgress[]
  section     CourseSection @relation(fields: [sectionId], references: [id])
  @@map("lessons")
}

model Enrollment {
  id        String   @id @default(cuid())
  courseId   String
  userId    String
  paymentId String?
  progress  Float    @default(0) // 0~100%
  completedAt DateTime?
  
  lessonProgress LessonProgress[]
  createdAt DateTime @default(now())
  course    Course   @relation(fields: [courseId], references: [id])
  @@unique([courseId, userId])
  @@map("enrollments")
}

model LessonProgress {
  id           String   @id @default(cuid())
  enrollmentId String
  lessonId     String
  watchedSeconds Int    @default(0)
  isCompleted  Boolean  @default(false)
  completedAt  DateTime?
  
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id])
  lesson       Lesson     @relation(fields: [lessonId], references: [id])
  @@unique([enrollmentId, lessonId])
  @@map("lesson_progress")
}

model CourseReview {
  id        String   @id @default(cuid())
  courseId   String
  userId    String
  rating    Float
  content   String?  @db.Text
  createdAt DateTime @default(now())
  
  course    Course   @relation(fields: [courseId], references: [id])
  @@unique([courseId, userId])
  @@map("course_reviews")
}
```

---

## 14.3 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 강의 목록 + 카테고리 필터 | ⬜ |
| ✅-2 | 강의 상세 (커리큘럼, 미리보기 영상) | ⬜ |
| ✅-3 | 유료 강의 결제 → 수강 등록 | ⬜ |
| ✅-4 | 동영상 플레이어 재생 (HLS) | ⬜ |
| ✅-5 | 진도율 자동 추적 (80% → 완료) | ⬜ |
| ✅-6 | 이어보기 동작 | ⬜ |
| ✅-7 | 수료증 PDF 다운로드 (100% 완료 시) | ⬜ |
| ✅-8 | 강의 리뷰 + 평점 | ⬜ |
| ✅-9 | 서버/브라우저 에러 0건 + 통합 검증 | ⬜ |

> **다음 문서**: [prd15.md] 온라인 클래스 (강사/정산)
