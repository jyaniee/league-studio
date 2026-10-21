import type { GameState } from "@league-studio/shared-types";
import { ensureItemPrices } from "../data-sources/itemPrices";
import { fetchLiveClientData } from "../data-sources/liveClientApi";
import { mapLiveClientToGameState } from "../mappers/liveClientToGameState";

export async function getLiveClientGameState(): Promise<GameState> {
  await ensureItemPrices();
  const rawData = await fetchLiveClientData();
  return mapLiveClientToGameState(rawData);
}
