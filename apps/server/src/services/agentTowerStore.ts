import type {
  AgentTowerEventPayload,
  GameState,
  TeamSide,
} from "@league-studio/shared-types";

type TowerSideState = {
  towers: number;
};

export type AgentTowerState = {
  blue: TowerSideState;
  red: TowerSideState;
};

type AddAgentTowerEventResult =
  | { status: "applied"; state: AgentTowerState }
  | { status: "duplicate"; key: string; state: AgentTowerState }
  | { status: "ignored"; reason: string; state: AgentTowerState };

let currentMatchId: string | null = null;
const processedEventKeys = new Set<string>();

const state: AgentTowerState = {
  blue: { towers: 0 },
  red: { towers: 0 },
};

function cloneState(): AgentTowerState {
  return {
    blue: { ...state.blue },
    red: { ...state.red },
  };
}

function isKnownTeam(
  team: TeamSide | "unknown",
): team is TeamSide {
  return team === "blue" || team === "red";
}

export function resetAgentTowerStore(): void {
  currentMatchId = null;
  processedEventKeys.clear();

  state.blue.towers = 0;
  state.red.towers = 0;
}

export function addAgentTowerEvent(
  payload: AgentTowerEventPayload,
): AddAgentTowerEventResult {
  const event = payload.event;


  // Agent의 matchId는 Observer의 matchId와 별도 출처를 사용함. (서로 동기화하는 로직이 필요한 상태 2026-10-05)
  // Observer에서 경기 전환 시 Store를 초기화하고,
  // Agent 이벤트에서는 Agent가 전달한 matchId를 기준으로 동기화한다.
  syncAgentTowerMatch(payload.matchId);

  const key = `${payload.matchId}:${event.eventId}`;

  if (processedEventKeys.has(key)) {
    return {
      status: "duplicate",
      key,
      state: cloneState(),
    };
  }

  if (!isKnownTeam(event.scoringTeam)) {
    processedEventKeys.add(key);

    return {
      status: "ignored",
      reason: "unknown scoring team",
      state: cloneState(),
    };
  }

  state[event.scoringTeam].towers += 1;
  processedEventKeys.add(key);

  return {
    status: "applied",
    state: cloneState(),
  };
}

export function mergeAgentTowersIntoGameState(
  gameState: GameState,
): GameState {
  return {
    ...gameState,

    blueTeam: {
      ...gameState.blueTeam,
      towers: Math.max(gameState.blueTeam.towers, state.blue.towers),
    },

    redTeam: {
      ...gameState.redTeam,
      towers: Math.max(gameState.redTeam.towers, state.red.towers),
    },

    updatedAt: new Date().toISOString(),
  };
}

export function syncAgentTowerMatch(matchId: string): void {
  if (currentMatchId === matchId) {
    return;
  }

  resetAgentTowerStore();
  currentMatchId = matchId;
}