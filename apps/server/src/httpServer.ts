import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import sirv from "sirv";
import { httpPort } from "./config";
import { getCurrentGameState } from "./services/gameStateProvider";

// src/httpServer.ts와 dist/index.js 모두에서
// apps/overlay/dist를 가리키는 경로.
const overlayDistPath = fileURLToPath(
  new URL("../../overlay/dist/", import.meta.url),
);

const serveOverlay = sirv(overlayDistPath, {
  etag: true,
  maxAge: 0,
});

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

  if (req.method === "GET" || req.method === "HEAD") {
    serveOverlay(req, res, () => {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
    });
    return;
  }

  res.writeHead(405, { Allow: "GET, HEAD" });
  res.end();
});

server.listen(httpPort, () => {
  console.log(`HTTP server running on http://localhost:${httpPort}`);
  console.log(`Overlay available at http://localhost:${httpPort}/`);
});