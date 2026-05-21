import { WebSocketServer, type WebSocket } from "ws";
import { gameStateIntervalMs, wsPort } from "./config";
import { getCurrentGameState } from "./gameStateProvider";

const wss = new WebSocketServer({ port: wsPort });

async function sendGameState(socket: WebSocket): Promise<void> {
  try {
    const gameState = await getCurrentGameState();
    if (gameState === null) return;
    if (socket.readyState !== socket.OPEN) return;
    socket.send(JSON.stringify(gameState));
  } catch (error) {
    console.error("Failed to send game state:", error);
  }
}

wss.on("connection", (socket) => {
  console.log("Client connected");

  void sendGameState(socket);

  const interval = setInterval(() => {
    void sendGameState(socket);
  }, gameStateIntervalMs);

  socket.on("close", () => {
    clearInterval(interval);
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server running on ws://localhost:${wsPort}`);
