# PRD 6: 프로젝트 관리

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **개발**: 김태현(BE) + 신예진(FE)  
> **의존관계**: prd1, prd2, prd4(견적) | **SaaS**: 스타터 플랜 이상

---

## 6.1 기능 명세

### F6-1. 프로젝트 CRUD
```yaml
API:
  - POST /api/projects: 프로젝트 생성
  - GET /api/projects: 목록 (상태별 필터)
  - GET /api/projects/:id: 상세
  - PUT /api/projects/:id: 수정
  - PUT /api/projects/:id/status: 상태 변경

상태 흐름: 접수 → 견적 → 계약 → 제작 → 납품 → 완료
데이터: 고객 정보, 요구사항, 일정(시작일/마감일), 예산, 메모
```

### F6-2. 작업 일지
```yaml
API: POST /api/projects/:id/logs
데이터: { date, content, images[], hoursWorked }
화면: 프로젝트 상세 내 타임라인 형태
```

### F6-3. 고객 공유 페이지
```yaml
기능: 공유 링크 생성 → 고객이 진행 상태 실시간 확인
API: POST /api/projects/:id/share → { shareToken, url }
화면: /project/share/:token (비로그인 접근 가능)
내용: 상태 진행바, 작업 일지 (사진 포함), 예상 완료일
```

### F6-4. 프로젝트별 수익성 분석
```yaml
계산: 매출(계약금액) - 비용(재료비+인건비+기타) = 순이익
화면: 프로젝트 상세 내 수익성 카드
```

---

## 6.2 DB 스키마

```prisma
model Project {
  id          String   @id @default(cuid())
  userId      String
  name        String
  status      ProjectStatus @default(RECEIVED)
  
  customerName  String
  customerPhone String?
  customerEmail String?
  requirements  String? @db.Text
  startDate     DateTime?
  deadline      DateTime?
  budget        Float?
  contractAmount Float?
  
  shareToken    String?  @unique
  
  logs          ProjectLog[]
  estimateId    String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id])
  @@map("projects")
}

model ProjectLog {
  id        String   @id @default(cuid())
  projectId String
  date      DateTime @default(now())
  content   String   @db.Text
  images    String[]
  hoursWorked Float?
  
  project   Project  @relation(fields: [projectId], references: [id])
  @@map("project_logs")
}

enum ProjectStatus { RECEIVED, ESTIMATING, CONTRACTED, PRODUCING, DELIVERING, COMPLETED, CANCELLED }
```

---

## 6.3 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 프로젝트 생성 → 목록 조회 | ⬜ |
| ✅-2 | 상태 변경 (접수→견적→계약→제작→완료) | ⬜ |
| ✅-3 | 작업 일지 작성 + 사진 업로드 | ⬜ |
| ✅-4 | 공유 링크 생성 → 비로그인 접속 → 상태 확인 | ⬜ |
| ✅-5 | 수익성 분석 카드 정상 표시 | ⬜ |
| ✅-6 | 견적서 연동 (prd4 통합) | ⬜ |
| ✅-7 | 서버/브라우저 에러 0건 + 통합 검증 | ⬜ |

> **다음 문서**: [prd7.md] CRM & 매출/회계
