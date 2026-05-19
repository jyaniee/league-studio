import type { GameState } from "@league-studio/shared-types";
import { getMockGameState } from "./mock/gameState";

/**
 * Returns the current game snapshot for WebSocket broadcast.
 * Data team: replace mock branch with real API + mapper when ready.
 */
export async function getCurrentGameState(): Promise<GameState | null> {
  if (process.env.USE_MOCK !== "false") {
    return getMockGameState();
  }

  // Real API implementation will be wired here (see docs/ws-contract.md).
  return null;
}
