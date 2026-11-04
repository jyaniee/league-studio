import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Buffer } from "node:buffer";
import { parseOcrCsPayload, setOcrCs } from "./ocrCsStore";
import { parseOcrGoldPayload, setOcrGold } from "./ocrGoldStore";

const OCR_PORT = 3003;

let started = false;

function sendJson(
  res: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>,
): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  if (rawBody.trim().length === 0) {
    throw new Error("Request body is empty");
  }

  return JSON.parse(rawBody) as unknown;
}

export function startOcrIngest(): void {
  if (started) {
    return;
  }

  started = true;
  const server = createServer(async (req, res) => {
    const url = req.url?.split("?")[0];
    if (req.method !== "POST" || (url !== "/ocr/cs" && url !== "/ocr/gold")) {
      sendJson(res, 404, { ok: false, error: "Not found" });
      return;
    }

    try {
      const body = await readJsonBody(req);
      if (url === "/ocr/gold") {
        const payload = parseOcrGoldPayload(body);
        if (payload === null) {
          sendJson(res, 400, { ok: false, error: "Invalid OCR gold payload" });
          return;
        }

        setOcrGold(payload);
        sendJson(res, 200, { ok: true, status: "stored" });
        return;
      }

      const payload = parseOcrCsPayload(body);
      if (payload === null) {
        sendJson(res, 400, { ok: false, error: "Invalid OCR CS payload" });
        return;
      }

      setOcrCs(payload);
      sendJson(res, 200, { ok: true, status: "stored" });
    } catch (error) {
      console.error("Failed to receive OCR payload:", error);
      sendJson(res, 400, { ok: false, error: "Invalid JSON payload" });
    }
  });

  server.listen(OCR_PORT, () => {
    console.log(`OCR ingest running on http://localhost:${OCR_PORT} (/ocr/cs, /ocr/gold)`);
  });
}
