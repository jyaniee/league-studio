import type { GameState } from "@league-studio/shared-types";

const FRESH_MS = 30_000;

export function isFreshLiveOcr(gameState: GameState, receivedAt: number): boolean {
  return gameState.source === "live-client-api" && Date.now() - receivedAt <= FRESH_MS;
}
