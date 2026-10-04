import { createServer } from "node:http";
import { createOverlayHandler } from "./overlayAssets";
import { httpPort } from "./config";
import { getCurrentGameState } from "./services/gameStateProvider";

const serveOverlay = createOverlayHandler();

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