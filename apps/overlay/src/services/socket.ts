import type { GameState } from "@league-studio/shared-types";

export function connectGameState(
  onMessage: (data: GameState) => void
): WebSocket {
  const socket = new WebSocket("ws://localhost:8081");

  socket.onopen = () => {
    console.log("Connected to game state websocket");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data) as GameState;
    onMessage(data);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("Disconnected from game state websocket");
  };

  return socket;
}