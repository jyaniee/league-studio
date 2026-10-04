import { dirname, resolve } from "node:path";
import { isSea } from "node:sea"; // Single Executable Application
import { fileURLToPath } from "node:url";

// 단일 실행 파일이면 exe가 있는 폴더,
// 일반 실행이면 기존 apps/server 폴더를 기준으로 합니다.
const serverRoot = isSea()
  ? dirname(process.execPath)
  : resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const envFilePath = resolve(serverRoot, ".env");

export const overlayDistPath = isSea()
  ? resolve(serverRoot, "overlay")
  : resolve(serverRoot, "../overlay/dist");