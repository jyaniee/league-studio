import type { IncomingMessage, ServerResponse } from "node:http";
import { extname } from "node:path";
import { getAsset, getAssetKeys, isSea } from "node:sea";
import sirv from "sirv";
import { overlayDistPath } from "./paths";

type Next = () => void;

type AssetHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  next: Next,
) => void;

// 브라우저가 각 파일을 올바르게 해석하도록 파일 종류를 알려줍니다.
const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".wasm": "application/wasm",
};

export function createOverlayHandler(): AssetHandler {
  // 개발 실행과 일반 JS 실행은 기존 방식을 유지합니다.
  if (!isSea()) {
    return sirv(overlayDistPath, {
      etag: true,
      maxAge: 0,
    });
  }

  // SEA 실행에서는 외부 overlay 폴더를 열지 않습니다.
  const assetKeys = new Set(getAssetKeys());

  return (req, res, next) => {
    let pathname: string;

    try {
      pathname = decodeURIComponent(
        new URL(req.url ?? "/", "http://localhost").pathname,
      );
    } catch {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    // 루트 주소는 오버레이의 index.html로 연결합니다.
    const relativePath =
      pathname === "/" ? "index.html" : pathname.slice(1);

    const assetKey = `overlay/${relativePath}`;

    if (!assetKeys.has(assetKey)) {
      next();
      return;
    }

    try {
      const body = Buffer.from(getAsset(assetKey));
      const contentType =
        contentTypes[extname(relativePath).toLowerCase()] ??
        "application/octet-stream";

      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": body.length,
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      });

      res.end(req.method === "HEAD" ? undefined : body);
    } catch (error) {
      console.error("Failed to serve embedded overlay asset:", error);
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  };
}