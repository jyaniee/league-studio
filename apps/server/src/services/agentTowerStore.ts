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
  const key = `${payload.matchId}:${event.eventId}`;

  if (currentMatchId !== null && currentMatchId !== payload.matchId) {
    resetAgentTowerStore();
  }

  currentMatchId = payload.matchId;

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