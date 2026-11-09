const DDRAGON_VERSION = "16.19.1";
const ITEM_DATA_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/en_US/item.json`;

type ItemGold = {
  total?: number;
};

type ItemRecord = {
  gold?: ItemGold;
};

type ItemDataFile = {
  data?: Record<string, ItemRecord>;
};

let prices: Map<number, number> | null = null;
let loading: Promise<void> | null = null;

export function hasItemPrices(): boolean {
  return prices !== null;
}

export function itemPrice(itemId: number): number {
  return prices?.get(itemId) ?? 0;
}

async function loadItemPrices(): Promise<void> {
  const response = await fetch(ITEM_DATA_URL);
  if (!response.ok) {
    throw new Error(`Data Dragon item data ${response.status}`);
  }

  const body = (await response.json()) as ItemDataFile;
  const next = new Map<number, number>();

  for (const [id, item] of Object.entries(body.data ?? {})) {
    const itemId = Number(id);
    const total = item.gold?.total;
    if (!Number.isInteger(itemId) || typeof total !== "number") {
      continue;
    }

    next.set(itemId, total);
  }

  prices = next;
}

export async function ensureItemPrices(): Promise<void> {
  if (prices !== null) {
    return;
  }

  if (loading === null) {
    loading = loadItemPrices().finally(() => {
      loading = null;
    });
  }

  try {
    await loading;
  } catch (error) {
    console.warn("[ItemPrices] Data Dragon item prices unavailable", error);
  }
}
