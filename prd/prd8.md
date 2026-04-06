# PRD 8: 커뮤니티 게시판

> **프로젝트**: tilea.kr | **담당PM**: 최윤아 | **개발**: 김태현(BE) + 신예진(FE)  
> **의존관계**: prd1 | **오픈소스**: Tiptap(에디터), Meilisearch(검색)

---

## 8.1 기능 명세

### F8-1. 7종 게시판 시스템
```yaml
게시판: [자유, 기술/노하우, 질문/답변, 작품갤러리, 구인/구직, 업체홍보, 공지]
API:
  - CRUD /api/posts?board={boardSlug}
  - GET /api/posts/:id (조회수 증가)
  - POST /api/posts/:id/like (좋아요)
  - CRUD /api/posts/:id/comments (댓글/대댓글)
  - POST /api/posts/:id/report (신고)
  - POST /api/posts/:id/bookmark (북마크)

에디터: Tiptap (이미지 다중 업로드, YouTube 임베드, 파일 첨부)
```

### F8-2. 태그 & 검색
```yaml
태그: #CNC, #한옥, #원목가구, #재단 등 자유 태그
검색: Meilisearch 연동 → 제목+본문+태그+댓글 전문 검색
필터: 게시판, 태그, 기간, 정렬(최신/인기/댓글수)
```

### F8-3. 포인트/레벨 시스템
```yaml
적립: 게시글 작성(10P), 댓글(3P), 좋아요 받기(2P)
등급: 새싹(0) → 견습(100) → 숙련(500) → 장인(2000) → 대목(5000)
혜택: SaaS 할인쿠폰, 역경매 프리미엄 배지
```

---

## 8.2 DB 스키마

```prisma
model Post {
  id        String   @id @default(cuid())
  userId    String
  board     String   // free, tech, qna, gallery, jobs, promo, notice
  title     String
  content   String   @db.Text
  images    String[]
  tags      String[]
  views     Int      @default(0)
  likes     Int      @default(0)
  isPinned  Boolean  @default(false)
  status    PostStatus @default(ACTIVE)
  
  comments  Comment[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
  @@map("posts")
}

model Comment {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  parentId  String?  // 대댓글
  content   String   @db.Text
  likes     Int      @default(0)
  createdAt DateTime @default(now())
  
  post      Post     @relation(fields: [postId], references: [id])
  parent    Comment? @relation("replies", fields: [parentId], references: [id])
  replies   Comment[] @relation("replies")
  @@map("comments")
}

model PointTransaction {
  id        String   @id @default(cuid())
  userId    String
  amount    Int
  reason    String   // POST_CREATED, COMMENT, LIKE_RECEIVED
  createdAt DateTime @default(now())
  @@map("point_transactions")
}

enum PostStatus { ACTIVE, HIDDEN, DELETED }
```

---

## 8.3 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 게시글 작성 (Tiptap 에디터) → 이미지 업로드 | ⬜ |
| ✅-2 | 7종 게시판별 목록 조회 + 페이지네이션 | ⬜ |
| ✅-3 | 댓글 + 대댓글 작성/삭제 | ⬜ |
| ✅-4 | 좋아요 + 북마크 동작 | ⬜ |
| ✅-5 | Meilisearch 검색 → 결과 표시 | ⬜ |
| ✅-6 | 태그 클릭 → 필터링 | ⬜ |
| ✅-7 | 신고 기능 동작 | ⬜ |
| ✅-8 | 포인트 적립 확인 (게시글/댓글/좋아요) | ⬜ |
| ✅-9 | 서버/브라우저 에러 0건 + 통합 검증 | ⬜ |

> **다음 문서**: [prd9.md] 중고거래
