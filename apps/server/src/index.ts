import { WebSocketServer } from "ws";
import { getMockGameState } from "./mock/gameState";
import { getLiveClientGameState } from "./liveClientApi";

const wss = new WebSocketServer({ port: 8081 });
//데이터를 가져오는 함수
async function getGameState() {
  try {
    return await getLiveClientGameState();
  } catch (error) {
    console.warn("Live Client API 연결 실패. mock 데이터 사용 중.");
    return getMockGameState();
  }
}
//프론트 서버에 연결됐을 때 실행
wss.on("connection", (socket) => {
  console.log("Client connected");
//1초마다 게임 상태를 가져와서 프론트로 보냄.
  const interval = setInterval(async () => {
    const gameState = await getGameState();
    socket.send(JSON.stringify(gameState));
  }, 1000);
//프론트 연결이 끊기면 반복 전송을 멈춤
  socket.on("close", () => {
    clearInterval(interval);
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on ws://localhost:8081");