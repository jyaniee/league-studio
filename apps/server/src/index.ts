import { WebSocketServer } from "ws";
import { getMockGameState } from "./mock/gameState";

const wss = new WebSocketServer({ port: 8081 });

wss.on("connection", (socket) => {
  console.log("Client connected");

  const interval = setInterval(() => {
    const gameState = getMockGameState();
    socket.send(JSON.stringify(gameState));
  }, 1000);

  socket.on("close", () => {
    clearInterval(interval);
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on ws://localhost:8081");