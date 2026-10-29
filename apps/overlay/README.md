# League Studio Overlay

League Studio의 **Broadcast Overlay** 애플리케이션입니다.

Backend Server에서 WebSocket으로 전달되는 `GameState`를 기반으로 League of Legends 관전 방송에 사용되는 UI를 렌더링합니다.

전체 프로젝트 구조 및 실행 방법은 루트 [README](../../README.md)를 참고해주세요.

---

## Role

Overlay는 경기 데이터를 직접 수집하지 않고, Backend Server에서 전달받은 상태를 화면에 표현하는 역할을 담당합니다.

현재 주요 UI는 다음과 같습니다.

- 상단 경기 스코어보드
- 팀 정보
- 킬 및 글로벌 골드
- 경기 시간 및 오브젝트 상태
- 하단 선수 정보 패널
- 챔피언
- K/D/A
- CS
- 아이템
- 와드 / 장신구

---

## Tech Stack

- React
- TypeScript
- Vite
- Riot Data Dragon
- WebSocket

---

## Shared Types

Overlay와 Backend Server는 공용 패키지인 `@league-studio/shared-types`를 통해 동일한 `GameState` 구조를 공유합니다.

```text
packages/shared-types/
```

새로운 경기 데이터가 필요한 경우 Overlay 내부에 별도의 데이터 구조를 임의로 정의하기보다, 필요한 경우 shared types를 먼저 확장한 뒤 사용하는 것을 기본으로 합니다.

---

## Development

저장소 루트에서 실행합니다.

```bash
pnpm dev:overlay
```

또는 Overlay 디렉터리에서 직접 실행할 수 있습니다.

```bash
pnpm dev
```

### Preview Mode

Backend Server 연결 없이 Overlay의 UI를 확인하려는 경우 Preview Mode를 사용할 수 있습니다.

일반 실행에서는 WebSocket을 통해 Backend Server의 실제 `GameState`를 수신하며, 데이터가 수신되기 전까지 Overlay를 렌더링하지 않습니다.

```text
http://localhost:5173/
```

Preview Mode는 URL에 `preview=1` 쿼리 파라미터를 추가하여 사용할 수 있습니다.

```text
http://localhost:5173/?preview=1
```

Preview Mode에서는 `src/mock/gameState.ts`의 정적 `GameState`를 사용하며 WebSocket에 연결하지 않습니다.

#### Server Mock과의 차이

- `USE_MOCK=true`
  - Backend Server에서 Mock `GameState`를 생성합니다.
  - WebSocket을 포함한 Server → Overlay 전체 데이터 흐름을 테스트할 때 사용합니다.

- `?preview=1`
  - Overlay 내부의 정적 Mock 데이터를 직접 사용합니다.
  - Backend Server 없이 UI 레이아웃과 디자인을 빠르게 확인할 때 사용합니다.

---

## Build

저장소 루트:

```bash
pnpm build:overlay
```

Overlay 디렉터리:

```bash
pnpm build
```