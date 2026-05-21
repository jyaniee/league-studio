# WebSocket 계약 (League Studio)

팀(실시간 통신 / 데이터 처리 / overlay) 공통 규칙입니다.

## 엔드포인트

- 개발: `ws://localhost:8081` (기본 포트, `WS_PORT`로 변경 가능)

## Payload (v1)

- 본문: `GameState` JSON **단일 객체** (envelope 없음)
- 정의: `packages/shared-types/src/gameState.ts`

### 예시

```json
{
  "phase": "in-game",
  "gameTime": 42,
  "blueTeamName": "BLUE",
  "redTeamName": "RED",
  "blueKills": 8,
  "redKills": 6
}
```

## 데이터 공급 (서버)

- 진입점: `apps/server/src/gameStateProvider.ts` → `getCurrentGameState()`
- Mock: `USE_MOCK` ≠ `false` (기본) → `apps/server/src/mock/gameState.ts`
- 실 API: `USE_MOCK=false` + provider 내부 실 구현 (데이터 처리 담당)

## null / 게임 없음 (합의 필요)

| 상황 | 현재 동작 | 비고 |
|------|-----------|------|
| `getCurrentGameState()` → `null` | **send 스킵** | overlay는 마지막 값 유지 또는 대기 UI |
| API 일시 실패 | provider에서 `null` 또는 throw 정책 결정 | throw 시 서버 로그 후 스킵 권장 |

> 팀 합의 후 이 표를 업데이트하세요.

## 환경 변수 (서버)

- **`.env.example`**: 변수 목록·예시 (템플릿)
- **`.env`**: 로컬 실제 값 (선택, git 미포함). 없으면 `config.ts` 기본값 사용
- `GAME_STATE_INTERVAL_MS` (기본 `1000`), `WS_PORT` (기본 `8081`), `USE_MOCK` (기본 mock)

## 전송 주기

- 연결당 interval로 전송 (신규 연결 시 즉시 1회 전송)
- 실 API 폴링 주기와 맞출 것 (데이터 처리 담당과 조율)

## overlay

- 연결: `apps/overlay/src/services/socket.ts`
- `ws://localhost:8081` (개발 기본값)

## 버전

- **v1**: `GameState` 단일 payload
