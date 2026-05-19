/**
 * [참고용 예시] 실 API 연동 후 구조
 *
 * - 빌드에 포함되지 않음 (docs/examples/)
 * - 데이터 처리 담당이 D1~D4에서 비슷하게 구현
 * - index.ts / overlay 는 수정 최소화
 */

import type { GameState } from "@league-studio/shared-types";

// ─────────────────────────────────────────────────────────────
// 1) index.ts — 지금과 동일 (보내는 쪽은 provider만 앎)
// ─────────────────────────────────────────────────────────────

/*
async function sendGameState(socket: WebSocket): Promise<void> {
  const gameState = await getCurrentGameState(); // ← 창구만 호출
  if (gameState === null) return;
  socket.send(JSON.stringify(gameState));
}

// 연결 직후 1회 + interval 마다 반복
*/

// ─────────────────────────────────────────────────────────────
// 2) Riot / Live Client가 돌려주는 raw (서버 전용 타입, 예시)
// ─────────────────────────────────────────────────────────────

/** Live Client Data API 응답 일부만 가정한 예시 */
interface LiveClientGameData {
  gameData: {
    gameTime: number;
    gameMode: string;
  };
  allPlayers: Array<{
    team: "ORDER" | "CHAOS";
    scores: { kills: number };
  }>;
}

// ─────────────────────────────────────────────────────────────
// 3) API 클라이언트 — “가져오기” (D1)
// ─────────────────────────────────────────────────────────────

const LIVE_CLIENT_URL = "https://127.0.0.1:2999/liveclientdata/allgamedata";

async function fetchLiveClientRaw(): Promise<LiveClientGameData | null> {
  try {
    const res = await fetch(LIVE_CLIENT_URL);
    if (!res.ok) return null; // 게임 없음 / 클라이언트 꺼짐
    return (await res.json()) as LiveClientGameData;
  } catch {
    return null; // 연결 실패
  }
}

// ─────────────────────────────────────────────────────────────
// 4) 매퍼 — raw → GameState (D3)
// ─────────────────────────────────────────────────────────────

function toGameState(raw: LiveClientGameData): GameState {
  const order = raw.allPlayers.filter((p) => p.team === "ORDER");
  const chaos = raw.allPlayers.filter((p) => p.team === "CHAOS");

  const blueKills = order.reduce((sum, p) => sum + p.scores.kills, 0);
  const redKills = chaos.reduce((sum, p) => sum + p.scores.kills, 0);

  return {
    phase: "in-game",
    gameTime: Math.floor(raw.gameData.gameTime),
    blueTeamName: "BLUE",
    redTeamName: "RED",
    blueKills,
    redKills,
  };
}

// ─────────────────────────────────────────────────────────────
// 5) gameStateProvider — 창구 (D4) ← 지금 파일이 여기로 확장됨
// ─────────────────────────────────────────────────────────────

// import { getMockGameState } from "./mock/gameState";

export async function getCurrentGameState(): Promise<GameState | null> {
  // 개발·데모: mock (현재 프로젝트와 동일)
  if (process.env.USE_MOCK !== "false") {
    // return getMockGameState();
    return {
      phase: "in-game",
      gameTime: 1,
      blueTeamName: "BLUE",
      redTeamName: "RED",
      blueKills: 0,
      redKills: 0,
    };
  }

  // 실 게임: HTTP로 raw 가져오기 → GameState로 변환
  const raw = await fetchLiveClientRaw();
  if (raw === null) return null;

  return toGameState(raw);
}

// ─────────────────────────────────────────────────────────────
// 6) 호출 흐름 (타임라인)
// ─────────────────────────────────────────────────────────────

/*
[0ms]   overlay가 ws://localhost:8081 연결
[0ms]   index: sendGameState() → getCurrentGameState()
[1ms]   provider: USE_MOCK? mock : fetch + toGameState
[2ms]   index: JSON.stringify → socket.send
[1000ms] setInterval 다시 getCurrentGameState() …
*/

// ─────────────────────────────────────────────────────────────
// 7) 폴더 구조 예시 (데이터 처리 담당이 나눌 때)
// ─────────────────────────────────────────────────────────────

/*
apps/server/src/
  gameStateProvider.ts   ← getCurrentGameState() 만 export (창구)
  mock/gameState.ts      ← mock
  api/liveClient.ts      ← fetchLiveClientRaw()        (D1)
  api/liveClientTypes.ts ← LiveClientGameData          (D2)
  mappers/toGameState.ts ← toGameState()               (D3)
  index.ts               ← WebSocket (변경 거의 없음)
*/
