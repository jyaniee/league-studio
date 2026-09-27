import { createServer } from "node:http";
import { httpPort } from "./config";
import { getCurrentGameState } from "./services/gameStateProvider";

// 임시 HTTP 서버: 현재 GameState를 JSON으로 확인하기 위한 검증용 엔드포인트.
// WebSocket(8081)과 별도 포트(3000)에서 동작하며, 기존 코드에 영향을 주지 않는다.
const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/game-state") {
    try {
      const gameState = await getCurrentGameState();

      if (gameState === null) {
        res.writeHead(204).end();
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(gameState, null, 2));
    } catch (error) {
      console.error("Failed to get game state:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(httpPort, () => {
  console.log(`HTTP server running on http://localhost:${httpPort}`);
});