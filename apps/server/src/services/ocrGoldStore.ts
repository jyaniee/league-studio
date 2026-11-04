import type { GameState, TeamState } from "@league-studio/shared-types";
import { isFreshLiveOcr } from "./ocrFreshness";

export type OcrGoldPayload = {
  blue: number | null;
  red: number | null;
};

type StoredOcrGold = OcrGoldPayload & {
  receivedAt: number;
};

let latest: StoredOcrGold | null = null;

function isGoldValue(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === "number" && Number.isInteger(value) && value >= 0)
  );
}

export function parseOcrGoldPayload(body: unknown): OcrGoldPayload | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const record = body as Record<string, unknown>;
  if (!isGoldValue(record.blue) || !isGoldValue(record.red)) {
    return null;
  }

  return { blue: record.blue, red: record.red };
}

export function setOcrGold(payload: OcrGoldPayload): void {
  if (payload.blue === null && payload.red === null) {
    return;
  }

  latest = {
    blue: payload.blue ?? latest?.blue ?? null,
    red: payload.red ?? latest?.red ?? null,
    receivedAt: Date.now(),
  };
}

function withGold(team: TeamState, gold: number | null): TeamState {
  if (gold === null) {
    return team;
  }

  return { ...team, globalGold: gold };
}

export function applyOcrGold(gameState: GameState): GameState {
  if (latest === null || !isFreshLiveOcr(gameState, latest.receivedAt)) {
    return gameState;
  }

  return {
    ...gameState,
    blueTeam: withGold(gameState.blueTeam, latest.blue),
    redTeam: withGold(gameState.redTeam, latest.red),
  };
}
