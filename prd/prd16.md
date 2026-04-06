# PRD 16: 메시징 & 알림 시스템

> **프로젝트**: tilea.kr | **담당PM**: 이수진 | **개발**: 김태현(BE) + 조현우(FE)  
> **기술**: Socket.IO (실시간), Resend (이메일), 카카오 알림톡(향후)

---

## 16.1 기능 명세

### F16-1. 1:1 쪽지/채팅
```yaml
API:
  - POST /api/messages: 메시지 전송
  - GET /api/messages/conversations: 대화 목록
  - GET /api/messages/conversations/:userId: 대화 내용
  - WebSocket: 실시간 메시지 수신 (Socket.IO)

화면: /messages (대화 목록 + 메시지 창)
기능: 텍스트, 이미지 전송, 읽음 표시, 온라인 상태
```

### F16-2. 앱 내 알림
```yaml
API:
  - GET /api/notifications: 알림 목록
  - PUT /api/notifications/:id/read: 읽음 처리
  - PUT /api/notifications/read-all: 전체 읽음

알림 유형:
  - 역경매: 새 의뢰, 새 입찰, 업체 선정
  - 커뮤니티: 댓글, 좋아요, 답글
  - 마켓: 주문, 배송, 리뷰
  - 클래스: 새 강의, 수료
  - 시스템: 공지, 이벤트, 안전재고

전달채널: 앱내(필수) + 이메일(선택) + 카카오알림톡(Phase4)
```

---

## 16.2 DB 스키마

```prisma
model Message {
  id         String   @id @default(cuid())
  senderId   String
  receiverId String
  content    String   @db.Text
  images     String[]
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())
  @@map("messages")
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // AUCTION_BID, COMMENT, ORDER, etc.
  title     String
  message   String
  link      String?  // 클릭 시 이동 URL
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  @@map("notifications")
}
```

---

## 16.3 개발 완료 체크리스트

| # | 검증 항목 | 상태 |
|---|----------|------|
| ✅-1 | 1:1 메시지 전송 → 상대방 수신 | ⬜ |
| ✅-2 | 실시간 메시지 (Socket.IO) | ⬜ |
| ✅-3 | 읽음 표시 동작 | ⬜ |
| ✅-4 | 알림 목록 조회 + 읽음 처리 | ⬜ |
| ✅-5 | 이벤트 발생 시 알림 자동 생성 (역경매 입찰 등) | ⬜ |
| ✅-6 | 이메일 알림 발송 (Resend) | ⬜ |
| ✅-7 | 서버/브라우저 에러 0건 + 통합 검증 | ⬜ |

> **다음 문서**: [prd17.md] 관리자 대시보드
