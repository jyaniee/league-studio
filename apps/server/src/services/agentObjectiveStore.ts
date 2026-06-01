let currentMatchId: string | null = null;

import type {
  AgentObjectiveEventPayload,
  DragonType,
  GameState,
  TeamSide,
} from "@league-studio/shared-types";

type ObjectiveSideState = {
  dragons: Exclude<DragonType, "elder">[];
  elderDragons: number;
  voidgrubs: number;
  heralds: number;
  barons: number;
};

export type AgentObjectiveState = {
  blue: ObjectiveSideState;
  red: ObjectiveSideState;
};

type AddAgentObjectiveEventResult =
  | { status: "applied"; state: AgentObjectiveState }
  | { status: "duplicate"; key: string; state: AgentObjectiveState }
  | { status: "ignored"; reason: string; state: AgentObjectiveState };

const processedEventKeys = new Set<string>();

const createEmptySideState = (): ObjectiveSideState => ({
  dragons: [],
  elderDragons: 0,
  voidgrubs: 0,
  heralds: 0,
  barons: 0,
});

const state: AgentObjectiveState = {
  blue: createEmptySideState(),
  red: createEmptySideState(),
};

function cloneState(): AgentObjectiveState {
  return {
    blue: {
      ...state.blue,
      dragons: [...state.blue.dragons],
    },
    red: {
      ...state.red,
      dragons: [...state.red.dragons],
    },
  };
}

function isKnownTeam(team: TeamSide | "unknown"): team is TeamSide {
  return team === "blue" || team === "red";
}

function isNormalDragonType(
  dragonType: DragonType | undefined,
): dragonType is Exclude<DragonType, "elder"> {
  return (
    dragonType === "cloud" ||
    dragonType === "infernal" ||
    dragonType === "mountain" ||
    dragonType === "ocean" ||
    dragonType === "hextech" ||
    dragonType === "chemtech"
  );
}

export function getAgentObjectiveState(): AgentObjectiveState {
  return cloneState();
}

export function resetAgentObjectiveStore(): void {
  processedEventKeys.clear();
  currentMatchId = null;

  state.blue = createEmptySideState();
  state.red = createEmptySideState();
}

export function addAgentObjectiveEvent(
  payload: AgentObjectiveEventPayload,
): AddAgentObjectiveEventResult {
  const event = payload.event;
  const key = `${payload.matchId}:${event.eventId}`;

  if (currentMatchId !== null && currentMatchId !== payload.matchId) {
    resetAgentObjectiveStore();
  }

  currentMatchId = payload.matchId;

  if (processedEventKeys.has(key)) {
    return { status: "duplicate", key, state: cloneState() };
  }

  if (!isKnownTeam(event.team)) {
    console.warn("[AGENT OBJECTIVE EVENT IGNORED] unknown team", event);

    processedEventKeys.add(key);

    return {
      status: "ignored",
      reason: "unknown team",
      state: cloneState(),
    };
  }

  const team = event.team;
  const targetSide = state[team];

  switch (event.objective) {
    case "dragon": {
      if (event.dragonType === "elder") {
        targetSide.elderDragons += 1;
        break;
      }

      if (!isNormalDragonType(event.dragonType)) {
        console.warn("[AGENT OBJECTIVE EVENT IGNORED] missing dragonType", event);

        processedEventKeys.add(key);

        return {
          status: "ignored",
          reason: "missing dragonType",
          state: cloneState(),
        };
      }

      targetSide.dragons.push(event.dragonType);
      break;
    }

    case "voidgrub": {
      targetSide.voidgrubs += 1;
      break;
    }

    case "herald": {
      targetSide.heralds += 1;
      break;
    }

    case "baron": {
      targetSide.barons += 1;
      break;
    }
  }

  processedEventKeys.add(key);

  return { status: "applied", state: cloneState() };
}

export function mergeAgentObjectivesIntoGameState(
  gameState: GameState,
): GameState {
  const agentState = getAgentObjectiveState();

  return {
    ...gameState,

    blueTeam: {
      ...gameState.blueTeam,
      dragons:
        agentState.blue.dragons.length > 0
          ? [...agentState.blue.dragons]
          : gameState.blueTeam.dragons,
      voidgrubs:
        agentState.blue.voidgrubs > 0
          ? agentState.blue.voidgrubs
          : gameState.blueTeam.voidgrubs,
    },

    redTeam: {
      ...gameState.redTeam,
      dragons:
        agentState.red.dragons.length > 0
          ? [...agentState.red.dragons]
          : gameState.redTeam.dragons,
      voidgrubs:
        agentState.red.voidgrubs > 0
          ? agentState.red.voidgrubs
          : gameState.redTeam.voidgrubs,
    },

    updatedAt: new Date().toISOString(),
  };
}