import type { GameState } from "@league-studio/shared-types";

const DATA_DRAGON_ORIGIN = "https://ddragon.leagueoflegends.com";

let cachedVersion: string | null = null;

async function fetchLatestVersion(): Promise<string> {
  const response = await fetch(`${DATA_DRAGON_ORIGIN}/api/versions.json`);

  if (!response.ok) {
    throw new Error(`Data Dragon 버전 요청 실패: ${response.status}`);
  }

  const versions = (await response.json()) as string[];
  const latest = versions[0];

  if (!latest) {
    throw new Error("Data Dragon 버전 목록이 비어 있습니다");
  }

  return latest;
}

export async function getDataDragonVersion(): Promise<string> {
  if (cachedVersion !== null) {
    return cachedVersion;
  }

  cachedVersion = await fetchLatestVersion();
  return cachedVersion;
}

export function toChampionImageUrl(version: string, championKey: string): string {
  return `${DATA_DRAGON_ORIGIN}/cdn/${version}/img/champion/${championKey}.png`;
}

export function toItemImageUrl(version: string, itemId: number): string {
  return `${DATA_DRAGON_ORIGIN}/cdn/${version}/img/item/${itemId}.png`;
}

export async function attachDataDragonImages(gameState: GameState): Promise<GameState> {
  const version = await getDataDragonVersion();

  return {
    ...gameState,
    players: gameState.players.map((player) => ({
      ...player,
      championImageUrl: player.championKey
        ? toChampionImageUrl(version, player.championKey)
        : undefined,
      items: player.items.map((item) => ({
        ...item,
        imageUrl: toItemImageUrl(version, item.itemId),
      })),
      trinketImageUrl:
        player.trinketItemId !== undefined
          ? toItemImageUrl(version, player.trinketItemId)
          : undefined,
    })),
  };
}
