import {
  access,
  copyFile,
  readdir,
  mkdtemp,
  readFile,
  writeFile,
} from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

if (process.platform !== "win32") {
  throw new Error("이 스크립트는 Windows에서 실행해 주세요.");
}

if (Number(process.versions.node.split(".")[0]) !== 24) {
  throw new Error("이번 실험은 Node.js 24로 실행해 주세요.");
}

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const serverDir = join(projectRoot, "apps/server");
const overlayDist = join(projectRoot, "apps/overlay/dist");

// 서버에 설치된 빌드 도구를 가져옵니다.
const serverRequire = createRequire(join(serverDir, "package.json"));
const { build } = serverRequire("esbuild");
const { inject } = serverRequire("postject");

await access(join(overlayDist, "index.html"));

// SEA에 넣을 리소스 이름과 실제 파일 경로를 수집합니다.
const assets = {};

async function collectAssets(directory, prefix = "overlay") {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    const assetKey = `${prefix}/${entry.name}`;

    if (entry.isDirectory()) {
      await collectAssets(fullPath, assetKey);
    } else if (entry.isFile()) {
      assets[assetKey] = fullPath;
    }
  }
}

await collectAssets(overlayDist);

// 중간 생성 파일과 사용자에게 전달할 폴더를 분리합니다.
const workDir = await mkdtemp(join(tmpdir(), "league-studio-sea-"));
const outputDir = await mkdtemp(
  join(homedir(), "Documents", `LeagueStudio-sea-win-${process.arch}-`),
);

const bundlePath = join(workDir, "server.cjs");
const blobPath = join(workDir, "server.blob");
const configPath = join(workDir, "sea-config.json");
const exePath = join(outputDir, "LeagueStudioServer.exe");

console.log("[1/4] 서버와 의존성을 묶습니다.");

await build({
  absWorkingDir: serverDir,
  entryPoints: ["src/index.ts"],
  outfile: bundlePath,
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node24",

  // ws의 선택적 네이티브 가속 모듈은 사용하지 않습니다.
  // 기본 JavaScript 구현으로 실행합니다.
  external: ["bufferutil", "utf-8-validate"],

  define: {
    "process.env.WS_NO_BUFFER_UTIL": '"1"',
    "process.env.WS_NO_UTF_8_VALIDATE": '"1"',
    "import.meta.url": "__leagueBundleUrl",
  },

  // ESM의 파일 위치 표현을 CommonJS에서도 처리합니다.
  banner: {
    js: 'var __leagueBundleUrl = require("node:url").pathToFileURL(__filename).href;',
  },

  logLevel: "info",
});

console.log("[2/4] SEA 데이터를 생성합니다.");

await writeFile(
  configPath,
  JSON.stringify(
    {
      main: bundlePath,
      output: blobPath,
      disableExperimentalSEAWarning: true,
      useSnapshot: false,
      useCodeCache: false,
      execArgvExtension: "none",
      assets,
    },
    null,
    2,
  ),
);

// 데이터를 생성하는 Node와 exe에 포함할 Node를 동일하게 사용합니다.
execFileSync(process.execPath, ["--experimental-sea-config", configPath], {
  stdio: "inherit",
});

console.log("[3/4] LeagueStudioServer.exe를 생성합니다.");

await copyFile(process.execPath, exePath);

await inject(exePath, "NODE_SEA_BLOB", await readFile(blobPath), {
  sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
});

console.log("[4/4] 배포용 기본 설정을 복사합니다.");

await copyFile(
  join(serverDir, ".env.distribution"),
  join(outputDir, ".env"),
);

console.log("\n생성 완료:");
console.log(outputDir);
console.log("\nLeagueStudioServer.exe를 실행해 주세요.");