import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import type { AgentObjectiveEventPayload } from "@league-studio/shared-types";
import { WebSocketServer, type WebSocket } from "ws";
import { getCurrentGameState } from "./gameStateProvider";
import { agentIngestPort, gameStateIntervalMs, wsPort } from "./config";


const wss = new WebSocketServer({ port: wsPort });

function sendJson(
  res: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>
): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");

  if (rawBody.trim().length === 0) {
    throw new Error("Request body is empty");
  }

  return JSON.parse(rawBody) as T;
}

const agentIngestServer = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/agent/objective-events") {
    try {
      const payload = await readJsonBody<AgentObjectiveEventPayload>(req);

      console.log("[AGENT OBJECTIVE EVENT]", payload);

      sendJson(res, 200, { ok: true });
    } catch (error) {
      console.error("Failed to receive agent objective event:", error);
      sendJson(res, 400, { ok: false, error: "Invalid JSON payload" });
    }

    return;
  }

  sendJson(res, 404, { ok: false, error: "Not found" });
});

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

agentIngestServer.listen(agentIngestPort, () => {
  console.log(
    `Agent ingest server running on http://localhost:${agentIngestPort}`
  );
});

console.log(`WebSocket server running on ws://localhost:${wsPort}`);