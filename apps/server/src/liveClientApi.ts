import type { GameState } from "@league-studio/shared-types";
import { calculateObjectives } from "./objectiveTimers";

const ELDER_RESPAWN_TIME = 6 * 60;
const DRAGONS_REQUIRED_FOR_SOUL = 4;

if (process.env.ALLOW_INSECURE_LOCAL_TLS === "true"){
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // 롤 클라이언트 api 에 인증서 문제 때문에 node에서 막힐 수 있음. 인증서 검사를 끄는 코드
}

const API_BASE_URL = "https://127.0.0.1:2999/liveclientdata";

interface LiveClientGameStats {
  gameTime: number;
}

interface LiveClientEvent {
  EventID: number;
  EventName: string;
  EventTime: number;
  KillerName?: string;
  VictimName?: string;
  KillerTeam?: "ORDER" | "CHAOS";
  DragonType?: string;

}

interface LiveClientEventData {
  Events: LiveClientEvent[];
}

interface LiveClientPlayer {
  summonerName: string;
  championName: string;
  team: "ORDER" | "CHAOS";
  scores?: {
    kills?: number;
    deaths?: number;
    assists?: number;
    creepScore?: number;
  };
}
//api 호출해서 JSON 으로 바꿔주는 공통 함수
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Live Client API 요청 실패: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function addKillerTeamToEvents(
  events: LiveClientEvent[],
  players: LiveClientPlayer[],
): LiveClientEvent[] {
  return events.map((event) => {
    if (!event.KillerName) {
      return event;
    }

    const killer = players.find(
      (player) => player.summonerName === event.KillerName,
    );

    return {
      ...event,
      KillerTeam: killer?.team,
    };
  });
}
//팀 킬 수 게산 함수
function sumTeamKills(players: LiveClientPlayer[], team: "ORDER" | "CHAOS") {
  return players
    .filter((player) => player.team === team)
    .reduce((sum, player) => sum + (player.scores?.kills ?? 0), 0);// scores 값이 잇으면 kills릂 가져오고 없으면 0을 사용( 원래는 undefined 가 됨)
}

export async function getLiveClientGameState(): Promise<GameState> {
  const [gameStats, eventData, players] = await Promise.all([
    fetchJson<LiveClientGameStats>(`${API_BASE_URL}/gamestats`),
    fetchJson<LiveClientEventData>(`${API_BASE_URL}/eventdata`),
    fetchJson<LiveClientPlayer[]>(`${API_BASE_URL}/playerlist`),
  ]);

  const gameTime = gameStats.gameTime;
  const events = addKillerTeamToEvents(eventData.Events ?? [], players);
//api 데이터를 gamestate 구조로 바꿔서 반환
  return {
  phase: "in-game",
  gameTime: Math.floor(gameTime),

  blueTeam: {
    side: "blue",
    name: "BLUE",
    logoUrl: undefined,
    kills: sumTeamKills(players, "ORDER"),
    globalGold: undefined,
    towers: 0,
    dragons: [],
    voidgrubs: 0,
  },

  redTeam: {
    side: "red",
    name: "RED",
    logoUrl: undefined,
    kills: sumTeamKills(players, "CHAOS"),
    globalGold: undefined,
    towers: 0,
    dragons: [],
    voidgrubs: 0,
  },

  objectives: calculateObjectives(gameTime, events),

  source: "live-client-api",
  updatedAt: new Date().toISOString(),
};
}