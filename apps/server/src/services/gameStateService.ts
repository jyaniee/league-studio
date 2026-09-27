import type { GameState } from "@league-studio/shared-types";
import { fetchLiveClientData } from "../data-sources/liveClientApi";
import { mapLiveClientToGameState } from "../mappers/liveClientToGameState";

export async function getLiveClientGameState(): Promise<GameState> {
  const rawData = await fetchLiveClientData();
  return mapLiveClientToGameState(rawData);
}
