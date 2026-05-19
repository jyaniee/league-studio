# WebSocket · 실시간 통신 로드맵

League Studio 백엔드(실시간 통신) · overlay · 데이터 처리 협업용 이슈 목록입니다.

**관련 문서**

| 문서 | 용도 |
|------|------|
| [p0-websocket-report.md](./p0-websocket-report.md) | P0 완료 작업·설계 보고 |
| [ws-contract.md](./ws-contract.md) | WebSocket payload·null·env 계약 (v1) |
| [riot-api-notes.md](./riot-api-notes.md) | Riot / Live Client API 검토 |

**역할 분담**

| 역할 | 담당 영역 |
|------|-----------|
| **실시간 통신** | WebSocket 서버, 전송 주기, overlay 소켓, 계약 문서 |
| **데이터 처리** | HTTP API, raw 타입, `toGameState`, `getCurrentGameState` 실구현 |
| **협업** | `shared-types`, payload/null 정책 합의 |

---

## 진행 상태 범례

| 표기 | 의미 |
|------|------|
| ✅ | 완료 (코드 또는 문서 반영) |
| ⚠️ | 부분 완료 (초안·코드 일부) |
| ❌ | 미착수 |
| 🔗 | 다른 이슈에 의존 |

---

## 의존 관계 (요약)

```
#1 ~ #3, #5  ──►  (D4 없이 실시간 통신이 선행 가능) ✅

D1 → D2 → D3 → D4  ──►  #6, #7
                      │
#4 (합의) ────────────┘

#6 (실 API) ──►  #11, #12, #13 (튜닝·broadcast)

#8, #9  ──►  (solo 가능, P1 선택)
```

| 관계 | 설명 |
|------|------|
| **D4 → #6** | 실 API `getCurrentGameState` 구현 후 WebSocket 연동 |
| **#4 → #7** | null/API 실패 정책 합의 후 코드 반영 |
| **#1~#3** | 데이터 처리 없이 먼저 가능 (P0 완료) |

---

## P0 — 이번 스프린트 (먼저)

| # | 제목 | 담당 | 상태 | 산출물 / 비고 |
|---|------|------|:----:|----------------|
| **#1** | [WS] gameStateProvider 인터페이스 정의 | 실시간 | ✅ | `apps/server/src/gameStateProvider.ts`, `getCurrentGameState(): Promise<GameState \| null>` |
| **#2** | [WS] index.ts에서 mock 직접 호출 제거 | 실시간 | ✅ | `index.ts` → provider만 호출 |
| **#3** | [WS] 전송 주기 환경 변수화 | 실시간 | ✅ | `config.ts`, `apps/server/.env.example` |
| **#4** | [협업] WebSocket payload / null 정책 합의 | 협업 | ⚠️ | [ws-contract.md](./ws-contract.md) 초안, **팀 합의 대기** |
| **#5** | [WS] 연결 직후 즉시 1회 전송 | 실시간 | ✅ | `connection` → `sendGameState` 1회 후 interval |

### P0 상세 (AC)

<details>
<summary>#1 gameStateProvider</summary>

- [x] `getCurrentGameState(): Promise<GameState | null>` 시그니처
- [x] `apps/server/src/gameStateProvider.ts` 추가
- [ ] 데이터 처리 담당에게 계약 공유 (문서 + 타입)

</details>

<details>
<summary>#2 mock 분리</summary>

- [x] `getMockGameState()` import를 `index.ts`에서 제거
- [x] `setInterval` 안에서 provider만 호출
- [x] mock은 provider 내부에서 연결 (데이터 담당 구현 전)

</details>

<details>
<summary>#3 환경 변수</summary>

- [x] `GAME_STATE_INTERVAL_MS` (기본 `1000`)
- [x] `WS_PORT` (기본 `8081`)
- [x] `.env.example`에 기본값·의미 기록

</details>

<details>
<summary>#4 payload / null (협업)</summary>

- [x] v1 초안: payload = `GameState` JSON 단일 (envelope 없음)
- [x] v1 초안: `null` → send 스킵
- [ ] envelope 도입 여부 최종 합의
- [ ] null 시 overlay: 마지막 값 유지 vs 대기 UI 확정
- [ ] `shared-types` 변경 시 알림 규칙 (PR 리뷰 등)

</details>

<details>
<summary>#5 연결 직후 1회 전송</summary>

- [x] `setInterval` 첫 틱 전 대기 제거
- [x] `connection` 핸들러에서 provider 1회 호출 후 interval

</details>

---

## P1 — 실 API provider 연동 시

| # | 제목 | 담당 | 상태 | 비고 |
|---|------|------|:----:|------|
| **#6** | [WS] 실 API provider 연동 및 통합 테스트 | 실시간 + 데이터 | ❌ 🔗D4 | `pnpm dev:server` + `pnpm dev:overlay`, `USE_MOCK` 전환 |
| **#7** | [WS] GameState null / API 실패 시 send 정책 구현 | 실시간 | ⚠️ 🔗#4 | null skip만 구현, #4 합의 후 확정 |
| **#8** | [Overlay] WebSocket 자동 재연결 | 실시간 | ❌ | `socket.ts`, 지수 백오프, cleanup |
| **#9** | [Overlay] 연결 상태 UI 표시 | 실시간 | ❌ | 연결됨 / 재연결 중 / 연결 끊김 |

### P1 상세 (AC)

<details>
<summary>#6 실 API 연동</summary>

- [ ] 데이터 담당 `getCurrentGameState()` 실구현 연결
- [ ] mock / 실 API: `USE_MOCK` env (팀 합의)
- [ ] overlay에 실데이터 반영 확인

</details>

<details>
<summary>#7 null / API 실패</summary>

- [ ] #4 합의 정책 코드 반영
- [ ] skip / error 로그 (console 또는 구조화)

</details>

<details>
<summary>#8 재연결</summary>

- [ ] `onclose` → 지수 백오프 재연결
- [ ] `useEffect` cleanup으로 중복 소켓 방지

</details>

<details>
<summary>#9 연결 UI</summary>

- [ ] Scoreboard 또는 페이지에 상태 표시
- [ ] 서버 꺼짐·재시작 시 동작 확인

</details>

---

## P2 — 안정화 (실 API 1차 동작 후)

| # | 제목 | 담당 | 상태 | 비고 |
|---|------|------|:----:|------|
| **#10** | [WS] send 전 readyState 검사 및 에러 처리 | 실시간 | ⚠️ | P0에서 `OPEN` 검사 일부 반영, interval 정리 등 추가 |
| **#11** | [측정] 전송 지연 구간 로깅 | 실시간 | ❌ 🔗#6 | `sentAt` 로그, API 폴링 vs WS interval 문서화 |
| **#12** | [WS] interval 튜닝 | 실시간 | ❌ 🔗#11 | `GAME_STATE_INTERVAL_MS` 조정 |
| **#13** | [WS] 다중 클라이언트 broadcast | 실시간 | ❌ | 연결당 interval → 전역 1 interval + broadcast |

---

## P3 — 나중 (기능 확장 시)

| # | 제목 | 담당 | 상태 |
|---|------|------|:----:|
| **#14** | [WS] ServerMessage envelope 도입 | 협업 | ❌ |
| **#15** | [WS] draft / post-game 메시지 타입 확장 | 협업 | ❌ |
| **#16** | [WS] 옵저버 툴(C#) 연동용 프로토콜 검토 | 협업 | ❌ |

---

## 데이터 처리 담당 (D1 ~ D5)

> 실시간 통신 담당 티켓이 아님. D4 완료 후 **#6** 진행.

| # | 제목 | 상태 | 비고 |
|---|------|:----:|------|
| **D1** | [API] Live Client / Riot HTTP 클라이언트 | ❌ | |
| **D2** | [API] raw 응답 타입 정의 (server 전용) | ❌ | |
| **D3** | [API] toGameState() 매퍼 | ❌ | |
| **D4** | [API] getCurrentGameState() provider 구현 | ❌ | `gameStateProvider.ts` 실구현 |
| **D5** | [API] mock / 실 API env 전환 | ⚠️ | `USE_MOCK` 분기만 존재 |

---

## 추천 스프린트 묶음

### Week 1 — 실시간 통신

| 순서 | 이슈 | 상태 |
|------|------|------|
| 1 | #1 → #2 → #3 → #5 | ✅ |
| 2 | #4 (팀 합의) | ⚠️ |
| (병행) | #8 → #9 | ❌ 선택 |

### Week 2 — 연동·안정화

| 순서 | 이슈 | 전제 |
|------|------|------|
| 1 | D4 → **#6** → **#7** | 데이터 처리 + 실시간 |
| 2 | **#10** | #6 이후 |

### 이후

| 순서 | 이슈 |
|------|------|
| 1 | #11 → #12 → #13 |
| 2 | #14 ~ #16 (필요 시) |

---

## GitHub 라벨 제안

| 라벨 | 용도 |
|------|------|
| `area:websocket` | 서버 WS, provider, config |
| `area:overlay` | overlay socket, UI |
| `area:data-api` | D1~D5 |
| `priority:p0` ~ `priority:p3` | 우선순위 |
| `blocked-by:data-api` | #6, #7 |
| `blocked-by:contract` | #7 (#4 합의 전) |

---

## Issue 제목 템플릿 (복사용)

```
[WS] gameStateProvider 인터페이스 정의
[WS] index.ts에서 mock 직접 호출 제거
[WS] 전송 주기 환경 변수화
[협업] WebSocket payload / null 정책 합의
[WS] 연결 직후 즉시 1회 전송
[WS] 실 API provider 연동 및 통합 테스트
[WS] GameState null / API 실패 시 send 정책 구현
[Overlay] WebSocket 자동 재연결
[Overlay] 연결 상태 UI 표시
[WS] send 전 readyState 검사 및 에러 처리
[측정] 전송 지연 구간 로깅
[WS] interval 튜닝
[WS] 다중 클라이언트 broadcast 리팩터
[WS] ServerMessage envelope 도입
[WS] draft / post-game 메시지 타입 확장
[WS] 옵저버 툴(C#) 연동용 프로토콜 검토
[API] Live Client / Riot HTTP 클라이언트
[API] raw 응답 타입 정의 (server 전용)
[API] toGameState() 매퍼
[API] getCurrentGameState() provider 구현
[API] mock / 실 API env 전환
```

---

*마지막 갱신: P0 코드 반영 기준 (#8·#9·#13 미구현)*
