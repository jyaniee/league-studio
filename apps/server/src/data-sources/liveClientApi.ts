import type {
  LiveClientEventData,
  LiveClientGameStats,
  LiveClientPlayer,
  LiveClientRawData,
} from "./liveClientTypes";

export type { LiveClientRawData } from "./liveClientTypes";

const API_BASE_URL = "https://127.0.0.1:2999/liveclientdata";

if (process.env.ALLOW_INSECURE_LOCAL_TLS === "true") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Live Client API 요청 실패: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchLiveClientData(): Promise<LiveClientRawData> {
  const [gameStats, eventData, players] = await Promise.all([
    fetchJson<LiveClientGameStats>(`${API_BASE_URL}/gamestats`),
    fetchJson<LiveClientEventData>(`${API_BASE_URL}/eventdata`),
    fetchJson<LiveClientPlayer[]>(`${API_BASE_URL}/playerlist`),
  ]);

  return {
    gameStats,
    eventData,
    players,
  };
}
