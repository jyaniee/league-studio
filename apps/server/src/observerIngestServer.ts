import {
    createServer,
    type IncomingMessage,
    type ServerResponse,
} from "node:http";
import { Buffer } from "node:buffer";
import type {
    ObserverMatchInfoPayload,
    ObserverStatePatchPayload,
} from "@league-studio/shared-types";
import { 
    addObserverMatchInfo, addObserverStatePatch, getObserverState
} from "./services/observerStateStore";
import { send } from "node:process";

function sendJson(
    res: ServerResponse,
    statusCode: number,
    body: Record<string, unknown>
): void {
    res.writeHead(statusCode, { "Content-Type": "application/json"});
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

export function startObserverIngestServer(port: number): void {
    const server = createServer(async (req, res) => {
        const url = req.url?.split("?")[0];

        if (req.method === "GET" && url === "/observer/state") {
            sendJson(res, 200, {
                ok: true,
                state: getObserverState(),
            });

            return;
        }

        if (req.method === "POST" && url === "/observer/match-info") {
            try {
                const payload = await readJsonBody<ObserverMatchInfoPayload>(req);
                const state = addObserverMatchInfo(payload);

                console.log("[OBSERVER MATCH INFO UPDATED]", state);

                sendJson(res, 200, {
                    ok: true,
                    status: "applied",
                    state,
                });
            } catch (error) {
                console.error("Failed to receive observer match info:", error);
                sendJson(res, 400, {
                    ok: false,
                    error: "Invalid JSON payload",
                });
            }

            return;
        }

        if (req.method === "POST" && url === "/observer/state-patch") {
            try {
                const payload = await readJsonBody<ObserverStatePatchPayload>(req);
                // const state = addObserverStatePatch(payload);
                const result = addObserverStatePatch(payload);

                console.log("[OBSERVER STATE PATCH UPDATED]", result);

                sendJson(res, 200, {
                    ok: true,
                    status: result.status,
                    appliedFields: result.appliedFields,
                    ignoredFields: result.ignoredFields,
                    state: result.state,
                });;
            } catch (error) {
                console.error("Failed to receive observer state patch:", error);
                sendJson(res, 400, {
                    ok: false,
                    error: "Invalid JSON payload",
                });
            }
            
            return;
        }

        sendJson(res, 404, {
            ok: false,
            error: "Not found",
        });
    });

    server.listen(port, () => {
        console.log(`Observer ingest server running on http://localhost:${port}`);
    });
}