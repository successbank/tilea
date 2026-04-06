# PRD 3: 재단 계산기 (킬러 기능)

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **리서치**: 김도윤(기술)  
> **개발**: 김태현(BE) + 신예진(FE) + 조현우(상태관리)  
> **의존관계**: prd0 완료 필수 (독립 기능)

---

## 3.1 기능 명세

### F3-1. 2D 패널 재단 최적화

```yaml
기능ID: F3-1
기능명: 판재 재단 계산기 (2D Bin Packing)
담당: 김태현(알고리즘) + 신예진(시각화)
우선순위: P0 (핵심 킬러 기능)

설명: |
  합판·MDF 등 판재에서 필요한 부재를 최소 자투리로 배치하는 자동 계산.
  Guillotine Cut 기반 (목재는 직선 절단만 가능).

입력:
  - 원판 규격: 가로(mm) × 세로(mm) (예: 2440×1220)
  - 원판 단가: ₩ (선택)
  - 부재 목록: [{ name, width, height, quantity, grainDirection? }]
  - 톱날 두께(Kerf): 기본 3mm (조정 가능)
  - 결 방향 고려: on/off

출력:
  - 최적 배치도 (SVG/Canvas 시각화)
  - 필요 원판 수
  - 자투리율(%)
  - 총 재료비 (단가 입력 시)
  - 재단 지시서 PDF

API:
  - POST /api/cutting/optimize
    요청: { sheets: [{w,h}], parts: [{name,w,h,qty,grain?}], kerf: 3 }
    응답: { layouts: [{sheetIndex, placements: [{x,y,w,h,name,rotated}]}], wastePercent, sheetsUsed }

화면:
  - /dashboard/cutting-optimizer: 재단 계산기 메인
  - 입력 폼 (좌측) + 배치도 시각화 (우측)
  - PDF 다운로드 버튼

알고리즘:
  - 1차: Guillotine Best Area Fit (자체 TypeScript 구현)
  - 라이브러리 참고: rectangle-packer (TypeScript, 2025), binpackingjs
  - 제약: 직선 절단만 허용 (Guillotine Cut)
  - 최적화: 여러 회전/배치 순서 시도 → 최소 자투리 선택

완료기준:
  - 2440×1220 원판 + 10개 부재 입력 → 배치도 생성 (5초 이내)
  - 배치도 SVG 렌더링 → 각 부재에 이름/크기 표시
  - PDF 다운로드 → 인쇄 가능한 재단 지시서
  - 자투리율 표시 (업계 평균 15~25% 이하 목표)
  - 결 방향 on → 회전 불가 부재 정상 처리
```

### F3-2. 1D 각재 재단 계산기

```yaml
기능ID: F3-2
기능명: 각재/원목 재단 계산기
담당: 김태현(BE)
우선순위: P2

입력:
  - 원재 길이(mm) + 단가
  - 필요 길이 목록: [{ name, length, quantity }]
  - 톱날 두께(Kerf)

출력:
  - 최적 절단 배치
  - 필요 원재 수
  - 자투리율

알고리즘: First Fit Decreasing (FFD)
```

### F3-3. 단가 자동 계산

```yaml
기능ID: F3-3
기능명: 재료비 자동 산출
담당: 조현우(FE)

계산식: 필요 원판 수 × 원판 단가 = 총 재료비
UI: 실시간 계산 (입력 변경 시 즉시 업데이트)
```

---

## 3.2 알고리즘 상세 (리서치팀 김도윤 PoC 결과)

### Guillotine Cut 2D Bin Packing

```typescript
// 핵심 알고리즘 의사코드
interface Part { name: string; w: number; h: number; qty: number; grain?: boolean }
interface Placement { x: number; y: number; w: number; h: number; name: string; rotated: boolean }

function guillotinePack(sheet: {w:number, h:number}, parts: Part[], kerf: number): Placement[] {
  // 1. 부재를 면적 큰 순으로 정렬 (Decreasing Area)
  // 2. 빈 공간 목록 초기화 [{x:0, y:0, w:sheet.w, h:sheet.h}]
  // 3. 각 부재에 대해:
  //    a. 모든 빈 공간에 배치 시도 (원본 + 90도 회전)
  //    b. Best Area Fit: 가장 적합한 공간 선택
  //    c. 배치 후 Guillotine 분할 (가로/세로 중 효율적 방향)
  //    d. kerf 반영 (부재 크기 + kerf)
  // 4. 한 원판에 배치 불가 시 → 새 원판 추가
  return placements
}
```

### 오픈소스 활용

| 라이브러리 | 용도 | 비고 |
|-----------|------|------|
| `rectangle-packer` | TypeScript Guillotine 알고리즘 참고 | Zero dependency |
| `@react-pdf/renderer` | 재단 지시서 PDF 생성 | React 기반 |
| SVG 직접 렌더링 | 배치도 시각화 | 커스텀 구현 |

---

## 3.3 DB 스키마

```prisma
model CuttingProject {
  id          String   @id @default(cuid())
  userId      String
  name        String   @default("새 프로젝트")
  
  // 원판 설정
  sheetWidth  Int      // mm
  sheetHeight Int      // mm
  sheetPrice  Float?   // 원판 단가
  kerf        Float    @default(3) // 톱날 두께 mm
  grainEnabled Boolean @default(false)
  
  // 부재 목록 (JSON)
  parts       Json     // [{name, w, h, qty, grain}]
  
  // 결과 (JSON)
  result      Json?    // {layouts, wastePercent, sheetsUsed, totalCost}
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@map("cutting_projects")
}
```

---

## 3.4 SaaS 요금제 연동

| 플랜 | 월 사용 횟수 | 저장 프로젝트 |
|------|------------|-------------|
| 무료 | 5회 | 3개 |
| 스타터 (₩19,900) | 무제한 | 20개 |
| 프로 (₩39,900) | 무제한 | 무제한 |

```yaml
제한 구현:
  - Redis에 월별 사용 횟수 카운트
  - 무료 플랜 5회 초과 시 → "스타터 플랜으로 업그레이드" 안내
  - 사업자 회원 미인증 → 무료 플랜만 가능
```

---

## 3.5 개발 태스크

| # | 태스크 | 담당 | 테스트 | 예상 |
|---|--------|------|--------|------|
| T3-1 | Guillotine 알고리즘 TypeScript 구현 | 김태현 | 단위 테스트 10개 케이스 | 8h |
| T3-2 | 재단 최적화 API (POST /api/cutting/optimize) | 김태현 | API 호출 → 배치 결과 | 4h |
| T3-3 | CuttingProject Prisma 모델 | 한승우 | 마이그레이션 성공 | 1h |
| T3-4 | 입력 폼 UI (원판 + 부재 목록) | 신예진 | 부재 추가/삭제/수정 동작 | 4h |
| T3-5 | SVG 배치도 시각화 컴포넌트 | 신예진 | 배치 결과 → SVG 렌더링 | 6h |
| T3-6 | 결 방향 + Kerf 옵션 UI | 조현우 | 옵션 변경 → 재계산 | 2h |
| T3-7 | PDF 재단 지시서 생성 | 신예진 | PDF 다운로드 → 인쇄 확인 | 4h |
| T3-8 | 프로젝트 저장/불러오기 | 김태현+조현우 | CRUD 동작 확인 | 3h |
| T3-9 | 사용 횟수 제한 (Redis) | 정민수 | 무료 5회 초과 → 안내 | 2h |
| T3-10 | 1D 각재 계산기 | 김태현 | FFD 알고리즘 정상 | 4h |
| T3-11 | 모바일 반응형 (핀치줌) | 류지아 | 모바일에서 배치도 확인 | 3h |

---

## 3.6 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 2440×1220 + 부재 5개 → 배치도 생성 (3초 이내) | ⬜ |
| ✅-2 | 2440×1220 + 부재 20개 → 배치도 생성 (10초 이내) | ⬜ |
| ✅-3 | 결 방향 ON → 해당 부재 회전 안됨 확인 | ⬜ |
| ✅-4 | Kerf 3mm 반영 → 부재 간 간격 확인 | ⬜ |
| ✅-5 | 자투리율 표시 정확성 (수동 계산과 비교) | ⬜ |
| ✅-6 | PDF 다운로드 → 인쇄 시 부재 번호/크기 가독성 | ⬜ |
| ✅-7 | 프로젝트 저장 → 새로고침 → 불러오기 성공 | ⬜ |
| ✅-8 | 무료 플랜 6회째 → 업그레이드 안내 표시 | ⬜ |
| ✅-9 | 모바일에서 배치도 핀치줌 가능 | ⬜ |
| ✅-10 | 1D 각재 계산기 동작 확인 | ⬜ |
| ✅-11 | 서버/브라우저 에러 0건 | ⬜ |
| ✅-12 | prd1+prd2 기능 통합 검증 (로그인 정상) | ⬜ |

---

> **다음 문서**: [prd4.md] 견적서 관리
