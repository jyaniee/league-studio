import type { GameState } from "@league-studio/shared-types";

export type ConnectionStatus = "connecting" | "open" | "closed";

export type ConnectGameStateOptions = {
  url?: string;
  onStatusChange?: (status: ConnectionStatus) => void;
};

export type GameStateConnection = {
  close: () => void;
};

const DEFAULT_WS_URL = "ws://localhost:8081";
const INITIAL_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 30_000;

function resolveWsUrl(override?: string): string {
  return override ?? import.meta.env.VITE_WS_URL ?? DEFAULT_WS_URL;
}

export function connectGameState(
  onMessage: (data: GameState) => void,
  options?: ConnectGameStateOptions,
): GameStateConnection {
  const url = resolveWsUrl(options?.url);
  let ws: WebSocket | null = null;
  let intentionalClose = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let attempt = 0;

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const scheduleReconnect = () => {
    if (intentionalClose) return;

    clearReconnectTimer();
    const delay = Math.min(
      INITIAL_RECONNECT_MS * 2 ** attempt,
      MAX_RECONNECT_MS,
    );
    attempt += 1;

    console.warn(
      `[GameState WS] reconnecting in ${delay}ms (attempt ${attempt})`,
    );

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      openSocket();
    }, delay);
  };

  const openSocket = () => {
    if (intentionalClose) return;

    options?.onStatusChange?.("connecting");
    ws = new WebSocket(url);

    ws.onopen = () => {
      attempt = 0;
      options?.onStatusChange?.("open");
      console.log("[GameState WS] connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as GameState;
        onMessage(data);
      } catch (error) {
        console.error("[GameState WS] invalid message", error);
      }
    };

    ws.onerror = (error) => {
      console.error("[GameState WS] error", error);
    };

    ws.onclose = () => {
      ws = null;
      options?.onStatusChange?.("closed");
      console.log("[GameState WS] disconnected");

      if (!intentionalClose) {
        scheduleReconnect();
      }
    };
  };

  openSocket();

  return {
    close: () => {
      intentionalClose = true;
      clearReconnectTimer();
      ws?.close();
      ws = null;
    },
  };
}
