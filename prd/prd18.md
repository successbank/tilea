# PRD 18: 배포/인프라/모니터링

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **인프라**: 임동혁(DevOps)  
> **배포**: Coolify + Docker | **모니터링**: Sentry + Umami

---

## 18.1 Docker Compose 구성

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [postgres, redis, meilisearch]

  postgres:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: tilea
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes: [redisdata:/data]

  meilisearch:
    image: getmeili/meilisearch:v1.10
    volumes: [msdata:/meili_data]
    environment:
      MEILI_MASTER_KEY: ${MEILISEARCH_API_KEY}

  socket:
    build: ./socket-server
    ports: ["3001:3001"]
```

## 18.2 Coolify 배포

```yaml
배포 전략:
  - Coolify에서 Docker Compose 배포
  - Traefik 자동 SSL (Let's Encrypt)
  - tilea.kr → app:3000
  - 무중단 배포 (rolling update)

환경변수:
  - Coolify UI에서 설정 (${VAR} 문법 사용)
  - ⚠️ ${VAR:-default} 사용 금지

도메인:
  - tilea.kr → 메인 앱
  - api.tilea.kr → API (동일 Next.js)
```

## 18.3 CI/CD (GitHub Actions)

```yaml
트리거: develop/main 브랜치 push
파이프라인:
  1. 린트 (ESLint + TypeScript 체크)
  2. 테스트 (Jest)
  3. 빌드 (next build)
  4. Docker 이미지 빌드 + Push
  5. Coolify 웹훅으로 자동 배포
```

## 18.4 모니터링

```yaml
Sentry: 프론트엔드/백엔드 에러 추적
Umami: 프라이버시 친화 방문자 분석 (자체 호스팅)
헬스체크: GET /api/health → 서비스 상태 반환
로그: Docker 로그 + Coolify 대시보드
```

---

## 18.5 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | docker-compose up → 모든 서비스 정상 기동 | ⬜ |
| ✅-2 | Coolify 배포 → tilea.kr 접속 정상 | ⬜ |
| ✅-3 | SSL 인증서 자동 발급 (HTTPS) | ⬜ |
| ✅-4 | GitHub push → CI/CD → 자동 배포 | ⬜ |
| ✅-5 | Sentry 에러 수집 동작 확인 | ⬜ |
| ✅-6 | Umami 방문자 추적 동작 확인 | ⬜ |
| ✅-7 | /api/health 헬스체크 정상 | ⬜ |
| ✅-8 | 전체 서비스 기능 통합 검증 (prd1~prd17) | ⬜ |

> **다음 문서**: [prd19.md] QA/테스트/사용자 검증 가이드
