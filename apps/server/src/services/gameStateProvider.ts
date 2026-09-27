import type { GameState } from "@league-studio/shared-types";
import { getMockGameState } from "../mock/gameState";
import { getLiveClientGameState } from "./gameStateService";
import { mergeAgentObjectivesIntoGameState } from "./agentObjectiveStore";
import { mergeObserverStateIntoGameState } from "./observerStateStore";
/**
 * WebSocket/HTTP에 제공할 현재 GameState 스냅샷.
 * USE_MOCK=false일 때 Live Client API를 사용하고, 실패 시 mock으로 fallback한다.
 */
export async function getCurrentGameState(): Promise<GameState | null> {
  if (process.env.USE_MOCK !== "false") {
    //return getMockGameState();
    return mergeObserverStateIntoGameState(getMockGameState()); // mock 상태에서도 Observer match-info 반영 가능하도록 수정함 2026-06-16:jhan
  }

  try {
    const liveGameState = await getLiveClientGameState();
    const withAgentObjectives = mergeAgentObjectivesIntoGameState(liveGameState);
    // return mergeAgentObjectivesIntoGameState(liveGameState);

    return mergeObserverStateIntoGameState(withAgentObjectives);
  } catch (error) {
    console.warn("[GameState] Live Client API failed: return pure mock fallback", error);
    // return getMockGameState();
    return mergeObserverStateIntoGameState(getMockGameState());
  }
}
