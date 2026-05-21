import type { GameState } from "@league-studio/shared-types";
import { getMockGameState } from "./mock/gameState";
import { getLiveClientGameState } from "./liveClientApi";

/**
 * Returns the current game snapshot for WebSocket broadcast.
 * Data team: replace mock branch with real API + mapper when ready.
 */
export async function getCurrentGameState(): Promise<GameState | null> {
  if (process.env.USE_MOCK !== "false") {
    return getMockGameState();
  }
  // Real API implementation will be wired here (see docs/ws-contract.md).
  try {
    return await getLiveClientGameState();
  } catch (error) {
    console.warn("Live Client API 연결 실패. mock 데이터 사용 중.", error);
    return getMockGameState();
  }
}
