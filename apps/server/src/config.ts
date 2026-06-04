import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = resolve(fileURLToPath(import.meta.url), "..", "..");
loadEnv({ path: resolve(serverRoot, ".env") });

const DEFAULT_INTERVAL_MS = 1000;
const DEFAULT_WS_PORT = 8081;
const DEFAULT_HTTP_PORT = 3000;
const DEFAULT_WS_HEARTBEAT_MS = 30_000;

const DEFAULT_AGENT_INGEST_PORT = 3001;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const gameStateIntervalMs = parsePositiveInt(
  process.env.GAME_STATE_INTERVAL_MS,
  DEFAULT_INTERVAL_MS
);

export const wsPort = parsePositiveInt(process.env.WS_PORT, DEFAULT_WS_PORT);

export const httpPort = parsePositiveInt(process.env.HTTP_PORT, DEFAULT_HTTP_PORT);

export const wsHeartbeatIntervalMs = parsePositiveInt(
  process.env.WS_HEARTBEAT_INTERVAL_MS,
  DEFAULT_WS_HEARTBEAT_MS,
);
export const agentIngestPort = parsePositiveInt(
  process.env.AGENT_INGEST_PORT,
  DEFAULT_AGENT_INGEST_PORT
  
);
