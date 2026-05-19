# P0 WebSocket 작업 보고서

**담당:** 실시간 통신 (WebSocket)  
**범위:** 이슈 #1 ~ #5 (P0)  
**관련 문서:** [ws-contract.md](./ws-contract.md)

---

## 1. 목적

초기 구현(mock → WebSocket → overlay)은 **동작 검증까지 완료**된 상태였다.  
P0의 목표는 기능을 크게 늘리는 것이 아니라 다음 두 가지였다.

1. **데이터 생성**과 **WebSocket 전송**의 책임을 분리해, 실 API 연동 시 수정 범위를 줄인다.
2. 전송 주기·포트·payload 규칙을 **설정·문서**로 남겨, 데이터 처리 담당과 협업할 기준을 만든다.

**P0에서 하지 않은 것:** overlay 재연결(#8), broadcast 리팩터(#13), 실 API HTTP/매퍼(D1~D5) — 의도적으로 제외.

---

## 2. 작업 전·후 한눈에 보기

### 2.1 이전 (`fe0a0ca` 기준)

```
index.ts
  └─ getMockGameState() 직접 호출
  └─ port 8081, interval 1000 하드코딩
  └─ setInterval만 사용 (첫 전송 최대 1초 대기)
```

### 2.2 P0 이후 (현재)

```
config.ts          → .env(선택) + 기본값으로 port / interval
gameStateProvider  → getCurrentGameState() 단일 진입점
index.ts           → provider만 호출, null·readyState 처리, 연결 직후 1회 send
mock/gameState.ts  → 변경 없음 (provider가 호출)
overlay/*          → 변경 없음
docs/ws-contract.md → WebSocket 계약 v1 초안
```

---

## 3. P0 이슈별 작업 내용

| # | 작업 | 상태 | 요약 |
|---|------|:----:|------|
| #1 | gameStateProvider 인터페이스 | ✅ | `getCurrentGameState(): Promise<GameState \| null>` |
| #2 | index.ts mock 직접 호출 제거 | ✅ | provider만 사용 |
| #3 | 전송 주기·포트 환경 변수화 | ✅ | `config.ts`, `.env.example` |
| #4 | payload / null 정책 | ⚠️ | `ws-contract.md` 초안 (팀 합의 대기) |
| #5 | 연결 직후 즉시 1회 전송 | ✅ | `connection` 시 `sendGameState` 1회 |

---

## 4. 파일별 변경 상세

### 4.1 신규 파일

#### `apps/server/src/gameStateProvider.ts` (#1)

**역할:** 게임 스냅샷을 돌려주는 **유일한 진입점**.

```ts
export async function getCurrentGameState(): Promise<GameState | null>
```

| 분기 | 동작 |
|------|------|
| `USE_MOCK` ≠ `"false"` (기본) | `mock/gameState.ts`의 `getMockGameState()` 반환 |
| `USE_MOCK=false` | 현재 `null` (실 API는 데이터 처리 담당이 이 안을 구현) |

**왜 추가했는가:** `index.ts`가 mock에 묶이면 실 API 연동 때 WebSocket 코드까지 매번 수정해야 하고, 데이터 처리 담당과 작업 영역이 겹친다. **“가져오기”와 “보내기”를 분리**하기 위함.

---

#### `apps/server/src/config.ts` (#3)

**역할:** 서버 설정 로드 및 기본값 제공.

- `dotenv`로 `apps/server/.env` 로드 (파일이 **없어도** 시작 가능)
- `gameStateIntervalMs` ← `GAME_STATE_INTERVAL_MS` (기본 `1000`)
- `wsPort` ← `WS_PORT` (기본 `8081`)

**왜 추가했는가:** 이전에는 `8081`, `1000`이 `index.ts`에 박혀 있었다. 실 API rate limit·환경별 포트 변경을 **코드 수정 없이** 하려면 env + 기본값 패턴이 필요하다.

**`.env`가 필수가 아닌 이유:** env가 비어 있으면 `config.ts`의 기본값을 쓰며, 이는 **P0 이전 하드코딩과 동일한 동작**이다.

---

#### `apps/server/.env.example` (#3)

**역할:** 팀원이 사용할 **환경 변수 템플릿** (git에 올리는 예시).

```
USE_MOCK=true
GAME_STATE_INTERVAL_MS=1000
WS_PORT=8081
```

**`.env`와의 차이**

| 파일 | git | 용도 |
|------|-----|------|
| `.env.example` | 공유용 템플릿 | “어떤 키가 있는지” |
| `.env` | 미추적 (`.gitignore`) | 로컬 실제 값 (선택, 없어도 기본값으로 동작) |

---

#### `docs/ws-contract.md` (#4)

**역할:** WebSocket **계약 v1 초안** — 팀 합의용.

| 항목 | v1 결정(초안) |
|------|----------------|
| 엔드포인트 | `ws://localhost:8081` ( `WS_PORT`로 변경 가능 ) |
| Payload | `GameState` JSON **단일 객체** (envelope 없음) |
| 데이터 소스 | `getCurrentGameState()` |
| `null` | 서버 **send 스킵** |
| 전송 | 연결당 interval + **연결 직후 1회** |

**왜 추가했는가:** #4는 코드만으로 끝나지 않지만, **합의 전 기준 문서**가 없으면 데이터·overlay 담당이 각자 다르게 구현할 수 있다.

---

### 4.2 수정된 파일

#### `apps/server/src/index.ts` (#2, #5)

**이전**

```ts
import { getMockGameState } from "./mock/gameState";
const wss = new WebSocketServer({ port: 8081 });

wss.on("connection", (socket) => {
  const interval = setInterval(() => {
    const gameState = getMockGameState();
    socket.send(JSON.stringify(gameState));
  }, 1000);
  // ...
});
```

**이후 (핵심 변경)**

| 변경 | 이유 |
|------|------|
| `getMockGameState` import 제거 → `getCurrentGameState()` | #2 데이터 소스 추상화 |
| `port` / `interval` → `config.ts` 참조 | #3 설정 분리 |
| `sendGameState(socket)` 함수 분리 | null·에러·`readyState` 처리 한곳에 모음 |
| `gameState === null`이면 send 안 함 | #4 초안: 활성 게임 없을 때 빈 메시지 방지 |
| `readyState === OPEN`일 때만 send | 닫히는 소켓에 send 시도 완화 |
| `connection` 직후 `sendGameState` 1회 | #5 첫 화면까지 최대 1초 대기 제거 |
| `try/catch` + `console.error` | provider 예외 시 서버 프로세스 유지 |

**의도적으로 유지한 것:** 클라이언트 **연결당** `setInterval` (전역 broadcast #13은 P2).

---

#### `apps/server/package.json`

**변경:** `dependencies`에 `dotenv` 추가.

**이유:** `config.ts`에서 `.env` 파일을 읽기 위함. overlay·shared-types는 변경 없음.

---

#### `pnpm-lock.yaml`

`dotenv` 설치에 따른 lockfile 갱신.

---

### 4.3 변경하지 않은 파일 (의도적)

| 경로 | 이유 |
|------|------|
| `apps/server/src/mock/gameState.ts` | mock 로직은 그대로 두고, **호출 위치만** provider로 이동 |
| `apps/overlay/**` | P0는 **서버 측 실 API 연동 준비**; overlay는 이미 mock 수신·표시 검증됨 |
| `packages/shared-types/**` | `GameState` 스키마 변경 없음 (필드 확장은 실 API·팀 합의 후) |

---

## 5. 현재 데이터 흐름

```
[mock/gameState.ts]
        ↑ USE_MOCK (기본)
[gameStateProvider.getCurrentGameState()]
        ↓ GameState | null
[index.ts sendGameState]
        ↓ JSON (null이면 스킵)
[WebSocket ws://localhost:WS_PORT]
        ↓
[overlay socket.ts → setState → Scoreboard]
```

---

## 6. 환경 변수 정리

| 변수 | 읽는 곳 | 기본값 | 설명 |
|------|---------|--------|------|
| `GAME_STATE_INTERVAL_MS` | `config.ts` | `1000` | 전송 주기(ms), 연결당 |
| `WS_PORT` | `config.ts` | `8081` | WebSocket 포트 |
| `USE_MOCK` | `gameStateProvider.ts` | mock 사용 | `"false"`일 때만 실 API 분기 |

로컬에서 값을 바꿀 때: `apps/server/.env.example` → `apps/server/.env` 복사 후 수정 (선택).

---

## 7. 왜 이렇게 설계했는가 (핵심)

| 결정 | 이유 |
|------|------|
| provider 한 함수 | 데이터 처리(D4)와 실시간 통신(#6) **경계** 명확화 |
| mock 파일 유지 | API 없이도 overlay·WS 파이프라인 개발·데모 가능 |
| overlay 미수정 | P0 범위는 서버; 클라이언트는 `GameState` JSON만 받으면 됨 |
| envelope 미도입 | v1 단순화; draft/post-game 등은 P3에서 검토 |
| `.env` 선택 | 기본값 = 기존 하드코딩; env는 **튜닝·배포·API 키** 대비 |
| `ws-contract.md` | #4 합의 전 **단일 기준**; Issue·PR 리뷰 시 참조 |

---

## 8. 동작 확인

```powershell
pnpm install
pnpm dev:server
pnpm dev:overlay
```

| 확인 항목 | 기대 결과 |
|-----------|-----------|
| 서버 로그 | `WebSocket server running on ws://localhost:8081` |
| overlay | Scoreboard에 팀명·킬·Time 표시 |
| 갱신 | 약 1초마다 Time·킬 변화 (mock) |
| `.env` 없음 | 위와 동일 (기본값) |

```powershell
pnpm build:server
pnpm build:overlay
```

---

## 9. 미완료·다음 단계

| 항목 | 비고 |
|------|------|
| **#4 팀 합의** | null 시 overlay 동작(마지막 값 vs 대기 UI) 확정 후 `ws-contract.md` 갱신 |
| **#6~#7** | 데이터 처리 `getCurrentGameState` 실구현 → 연동·실패 정책 |
| **#8~#9** | overlay 재연결·연결 UI (P1, 선택) |
| **#10~#13** | 실 API 동작 후 안정화·튜닝·broadcast |

---

## 10. 변경 파일 체크리스트

**신규**

- [x] `apps/server/src/gameStateProvider.ts`
- [x] `apps/server/src/config.ts`
- [x] `apps/server/.env.example`
- [x] `docs/ws-contract.md`

**수정**

- [x] `apps/server/src/index.ts`
- [x] `apps/server/package.json`
- [x] `pnpm-lock.yaml`

**선택 (로컬, git 미추적)**

- [ ] `apps/server/.env` — 없어도 동작; 있으면 설정 오버라이드

**미변경 (P0)**

- [x] `apps/server/src/mock/gameState.ts`
- [x] `apps/overlay/**`
- [x] `packages/shared-types/**`

---

## 11. 요약

P0에서는 **WebSocket으로 무엇을 보낼지(`GameState`)는 유지**하고, **어디서 가져올지(`gameStateProvider`)와 언제·어디로 보낼지(`config` + `index.ts`)만 정리**했다. mock → 실 API 전환 시 **수정 핵심은 provider와 데이터 처리 담당 작업**으로 모이며, overlay·전송 루프는 최소 변경으로 유지할 수 있다.

---

*문서 기준: P0 완료 상태*
