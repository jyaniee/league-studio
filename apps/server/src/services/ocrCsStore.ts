import type {
  GameState,
  PlayerPosition,
  PlayerState,
  TeamSide,
} from "@league-studio/shared-types";

const POSITION_ORDER: PlayerPosition[] = [
  "TOP",
  "JUNGLE",
  "MIDDLE",
  "BOTTOM",
  "UTILITY",
];

const FRESH_MS = 30_000;

export type OcrCsSide = Array<number | null>;

export type OcrCsPayload = {
  blue: OcrCsSide;
  red: OcrCsSide;
};

type StoredOcrCs = OcrCsPayload & {
  receivedAt: number;
};

let latest: StoredOcrCs | null = null;

function isCsValue(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === "number" && Number.isInteger(value) && value >= 0)
  );
}

function parseSide(value: unknown): OcrCsSide | null {
  if (!Array.isArray(value) || value.length !== POSITION_ORDER.length) {
    return null;
  }

  if (!value.every(isCsValue)) {
    return null;
  }

  return [...value];
}

export function parseOcrCsPayload(body: unknown): OcrCsPayload | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const blue = parseSide(record.blue);
  const red = parseSide(record.red);
  if (blue === null || red === null) {
    return null;
  }

  return { blue, red };
}

export function setOcrCs(payload: OcrCsPayload): void {
  latest = {
    blue: [...payload.blue],
    red: [...payload.red],
    receivedAt: Date.now(),
  };
}

function acceptedCs(apiCs: number, read: number | null): number | null {
  if (read === null) {
    return null;
  }

  if (read >= apiCs && read < apiCs + 10) {
    return read;
  }

  return null;
}

function applySide(
  players: PlayerState[] | undefined,
  reads: OcrCsSide,
): PlayerState[] | undefined {
  if (players === undefined) {
    return players;
  }

  return players.map((player) => {
    const index = POSITION_ORDER.indexOf(player.position);
    const firstOfRole = players.find(
      (candidate) => candidate.position === player.position,
    );
    if (index < 0 || firstOfRole !== player) {
      return player;
    }

    const next = acceptedCs(player.cs, reads[index]);
    if (next === null) {
      return player;
    }

    return { ...player, cs: next };
  });
}

function applyTeam(
  gameState: GameState,
  side: TeamSide,
  reads: OcrCsSide,
): GameState["blueTeam"] {
  const team = side === "blue" ? gameState.blueTeam : gameState.redTeam;
  return {
    ...team,
    players: applySide(team.players, reads),
  };
}

export function applyOcrCs(gameState: GameState): GameState {
  if (latest === null || gameState.source !== "live-client-api") {
    return gameState;
  }

  if (Date.now() - latest.receivedAt > FRESH_MS) {
    return gameState;
  }

  return {
    ...gameState,
    blueTeam: applyTeam(gameState, "blue", latest.blue),
    redTeam: applyTeam(gameState, "red", latest.red),
  };
}
