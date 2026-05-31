import "./httpServer";
import { WebSocketServer, type WebSocket } from "ws";
import { gameStateIntervalMs, wsHeartbeatIntervalMs, wsPort } from "./config";
import { getCurrentGameState } from "./services/gameStateProvider";

type HeartbeatSocket = WebSocket & { isAlive: boolean };

const wss = new WebSocketServer({ port: wsPort });

// 최신 GameState를 캐시. fetch와 전송을 분리하여 데이터 역전을 방지한다.
let cachedGameState: string | null = null;

// fetch 루프: setTimeout 체이닝으로 이전 요청 완료 후 다음 요청을 예약한다.
// 동시에 두 개의 API 요청이 존재하지 않으므로 응답 순서가 보장된다.
async function fetchLoop(): Promise<void> {
  try {
    const gameState = await getCurrentGameState();
    cachedGameState = gameState !== null ? JSON.stringify(gameState) : null;
  } catch (error) {
    console.error("Failed to fetch game state:", error);
  }

  setTimeout(fetchLoop, gameStateIntervalMs);
}

// 전송 루프: 1초마다 캐시된 GameState를 연결된 모든 클라이언트에 broadcast한다.
// 클라이언트 수와 관계없이 API 호출은 fetchLoop에서 1회만 발생한다.
function broadcastCachedState(): void {
  if (cachedGameState === null) return;

  for (const socket of wss.clients) {
    if (socket.readyState === socket.OPEN) {
      socket.send(cachedGameState);
    }
  }
}

function startHeartbeat(server: WebSocketServer, intervalMs: number): void {
  const heartbeatInterval = setInterval(() => {
    for (const socket of server.clients) {
      const ws = socket as HeartbeatSocket;

      if (ws.isAlive === false) {
        ws.terminate();
        continue;
      }

      ws.isAlive = false;
      ws.ping();
    }
  }, intervalMs);

  server.on("close", () => {
    clearInterval(heartbeatInterval);
  });
}

fetchLoop();
setInterval(broadcastCachedState, gameStateIntervalMs);
startHeartbeat(wss, wsHeartbeatIntervalMs);

wss.on("connection", (socket) => {
  const ws = socket as HeartbeatSocket;
  ws.isAlive = true;

  console.log("Client connected");

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  // 연결 즉시 캐시된 데이터를 전송하여 첫 화면 대기를 제거한다.
  if (cachedGameState !== null) {
    ws.send(cachedGameState);
  }

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server running on ws://localhost:${wsPort}`);
