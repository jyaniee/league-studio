import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { Buffer } from "node:buffer";
import type { AgentObjectiveEventPayload } from "@league-studio/shared-types";
import { addAgentObjectiveEvent } from "./services/agentObjectiveStore";

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

export function startAgentIngestServer(port: number): void {
  const server = createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/agent/objective-events") {
      try {
        const payload = await readJsonBody<AgentObjectiveEventPayload>(req);

//        console.log("[AGENT OBJECTIVE EVENT]", payload);

//        sendJson(res, 200, { ok: true });
        console.log("[AGENT OBJECTIVE EVENT]", payload);

        const result = addAgentObjectiveEvent(payload);

        if (result.status === "applied"){
          console.log("[AGENT OBEJCTIVE STATE UPDATED]", result.state);
        }else if(result.status === "duplicate") {
          console.warn("[AGENT OBJECTIVE EVENT DUPLICATED]", result.key);
        }

        sendJson(res, 200, { ok: true, status: result.status});

      } catch (error) {
        console.error("Failed to receive agent objective event:", error);
        sendJson(res, 400, { ok: false, error: "Invalid JSON payload" });
      }

      return;
    }

    sendJson(res, 404, { ok: false, error: "Not found" });
  });

  server.listen(port, () => {
    console.log(`Agent ingest server running on http://localhost:${port}`);
  });
}