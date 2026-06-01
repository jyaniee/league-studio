import type { GameState } from "@league-studio/shared-types";
import { getMockGameState } from "../mock/gameState";
import { getLiveClientGameState } from "./gameStateService";
import { mergeAgentObjectivesIntoGameState } from "./agentObjectiveStore";
/**
 * WebSocket/HTTP에 제공할 현재 GameState 스냅샷.
 * USE_MOCK=false일 때 Live Client API를 사용하고, 실패 시 mock으로 fallback한다.
 */
export async function getCurrentGameState(): Promise<GameState | null> {
  if (process.env.USE_MOCK !== "false") {
    return mergeAgentObjectivesIntoGameState(getMockGameState());
  }

  try {
//    return await getLiveClientGameState();
      const gameState = await getLiveClientGameState();
      return mergeAgentObjectivesIntoGameState(gameState);
  } catch (error) {
    console.warn("Live Client API 연결 실패. mock 데이터 사용 중.", error);
    return getMockGameState();
  }
}
