import {
  access,
  copyFile,
  mkdir,
  readdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import resedit from "resedit-cli";

if (process.platform !== "win32") {
  throw new Error("이 스크립트는 Windows에서 실행해 주세요.");
}

if (Number(process.versions.node.split(".")[0]) !== 24) {
  throw new Error("이번 실험은 Node.js 24로 실행해 주세요.");
}

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const serverDir = join(projectRoot, "apps/server");
const overlayDist = join(projectRoot, "apps/overlay/dist");

const rootPackage = JSON.parse(
  await readFile(join(projectRoot, "package.json"), "utf8"),
);

const appVersion = rootPackage.version;

const appIconPath = join(
  projectRoot,
  "scripts",
  "assets",
  "league-studio.ico",
);

const versionMatch = appVersion.match(/^(\d+)\.(\d+)\.(\d+)/);

if (!versionMatch) {
  throw new Error(`Windows 버전으로 변환할 수 없는 버전입니다: ${appVersion}`);
}

const windowsVersion =
  `${versionMatch[1]}.${versionMatch[2]}.${versionMatch[3]}.0`;

// 서버에 설치된 빌드 도구를 가져옵니다.
const serverRequire = createRequire(join(serverDir, "package.json"));
const { build } = serverRequire("esbuild");
const { inject } = serverRequire("postject");

await access(join(overlayDist, "index.html"));
await access(appIconPath);

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

async function findLicenseText(packageDir) {
  const entries = await readdir(packageDir, { withFileTypes: true });

  const licenseFile = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        /^(license|licence|copying|notice)([-_.].*)?$/i.test(entry.name),
    )
    .sort((a, b) => a.name.localeCompare(b.name))[0];

  if (!licenseFile) {
    return null;
  }

  return readFile(join(packageDir, licenseFile.name), "utf8");
}

async function generateThirdPartyNotices() {
  const licenseOutput = execFileSync(
    "cmd.exe",
    [
      "/d",
      "/s",
      "/c",
      "pnpm licenses list --recursive --prod --json",
    ],
    {
      cwd: projectRoot,
      encoding: "utf8",
    },
  );

  const licenseGroups = JSON.parse(licenseOutput);
  const dependencies = Object.values(licenseGroups).flat();

  // workspace 전체를 조회하므로 동일 패키지가 중복될 경우 한 번만 기록합니다.
  const uniqueDependencies = new Map();

  for (const dependency of dependencies) {
    const key = `${dependency.name}@${dependency.version}`;

    if (!uniqueDependencies.has(key)) {
      uniqueDependencies.set(key, dependency);
    }
  }

  // 현재 패키징에 사용 중인 Node.js 버전의 공식 LICENSE를 가져옵니다.
  const nodeVersion = process.versions.node;
  const nodeLicenseUrl =
    `https://raw.githubusercontent.com/nodejs/node/v${nodeVersion}/LICENSE`;

  let nodeLicense;

  try {
    const response = await fetch(nodeLicenseUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    nodeLicense = await response.text();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    throw new Error(
      `Node.js v${nodeVersion}의 공식 LICENSE를 가져오지 못했습니다: ${message}`,
    );
  }

  const separator = `${"=".repeat(80)}\n`;

  let notices = `League Studio - Third-Party Notices

This distribution contains third-party open source software.

${separator}
Node.js
Version: ${nodeVersion}
Source: ${nodeLicenseUrl}
${separator}

${nodeLicense.trim()}

`;

  const sortedDependencies = [...uniqueDependencies.values()].sort((a, b) =>
    `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`),
  );

  for (const dependency of sortedDependencies) {
    const packagePath =
      dependency.path ??
      (Array.isArray(dependency.paths) ? dependency.paths[0] : undefined);

    let licenseText = null;

    if (packagePath) {
      try {
        licenseText = await findLicenseText(packagePath);
      } catch {
        licenseText = null;
      }
    }

    notices += `\n${separator}`;
    notices += `${dependency.name} ${dependency.version}\n`;
    notices += `License: ${dependency.license ?? "Unknown"}\n`;

    if (dependency.homepage) {
      notices += `Homepage: ${dependency.homepage}\n`;
    }

    notices += separator;

    if (licenseText) {
      notices += `\n${licenseText.trim()}\n`;
    } else {
      notices +=
        "\nLicense text file was not found in the installed package.\n";
    }
  }

  return notices;
}

// 중간 생성 파일과 사용자에게 전달할 폴더를 분리합니다.
const workDir = await mkdtemp(join(tmpdir(), "league-studio-sea-"));
/*
const outputDir = await mkdtemp(
  join(
    homedir(),
    "Documents",
    `LeagueStudio-v${appVersion}-win-${process.arch}-`,
  ),
);
*/

const packageName =
  `LeagueStudio-v${appVersion}-win-${process.arch}`;

const outputParent = join(homedir(), "Documents");
const outputDir = join(outputParent, packageName);
const zipPath = join(outputParent, `${packageName}.zip`);

// 이전에 생성된 같은 버전의 배포본이 있다면 정리합니다.
await rm(outputDir, { recursive: true, force: true });
await rm(zipPath, { force: true });

await mkdir(outputDir, { recursive: true });

const bundlePath = join(workDir, "server.cjs");
const blobPath = join(workDir, "server.blob");
const configPath = join(workDir, "sea-config.json");
const baseExePath = join(workDir, "node-base.exe");
const exePath = join(outputDir, "LeagueStudioServer.exe");

console.log("[1/7] 서버와 의존성을 묶습니다.");

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

console.log("[2/7] SEA 데이터를 생성합니다.");

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

console.log("[3/7] LeagueStudioServer.exe를 생성합니다.");

await copyFile(process.execPath, baseExePath);

await resedit({
  in: baseExePath,
  out: exePath,
  "ignore-signed": true,
  icon: [`1,${appIconPath}`],
  "product-name": "League Studio",
  "product-version": windowsVersion,
  "file-description": "League Studio Server",
  "file-version": windowsVersion,
  "company-name": "Team X",
  "original-filename": "LeagueStudioServer.exe",
  "internal-name": "LeagueStudioServer",
});

await inject(exePath, "NODE_SEA_BLOB", await readFile(blobPath), {
  sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
});

console.log("[4/7] 배포용 기본 설정을 복사합니다.");

await copyFile(
  join(serverDir, ".env.distribution"),
  join(outputDir, ".env"),
);

console.log("[5/7] 배포 정보를 생성합니다.");

await writeFile(
  join(outputDir, "README.txt"),
  `League Studio Server
====================

Version: ${appVersion}

League Studio는 League of Legends 사설 경기 및 소규모 대회의
관전 방송을 위한 실시간 오버레이 시스템입니다.

[실행 방법]

1. LeagueStudioServer.exe와 .env 파일을 같은 폴더에 둡니다.
2. LeagueStudioServer.exe를 실행합니다.
3. 서버가 정상적으로 실행되면 다음 주소에서 오버레이를 확인할 수 있습니다.

   http://localhost:3000/

[기본 설정]

배포본은 기본적으로 mock 데이터를 사용하도록 설정되어 있습니다.

   USE_MOCK=true

실제 경기 데이터를 사용하려면 .env 파일에서 다음과 같이 변경합니다.

   USE_MOCK=false

설정을 변경한 경우 실행 중인 서버를 종료한 뒤 다시 실행해야 적용됩니다.

[설정 파일]

.env 파일에서 서버 포트, WebSocket 포트, 데이터 갱신 주기 등의
설정을 변경할 수 있습니다.

특별한 이유가 없다면 기본 포트 설정은 변경하지 않는 것을 권장합니다.

[종료 방법]

서버가 실행 중인 콘솔 창에서 Ctrl+C를 누르거나
콘솔 창을 닫으면 서버가 종료됩니다.

[주의]

League Studio는 현재 개발 중인 프로젝트입니다.

League Studio는 Riot Games의 공식 제품이 아니며,
Riot Games와 제휴하거나 Riot Games의 보증을 받는 프로젝트가 아닙니다.

League of Legends 및 관련 게임 자산의 권리는 해당 권리자에게 있습니다.
`,
  "utf8",
);

console.log("[6/7] 오픈소스 라이선스 고지를 생성합니다.");

const thirdPartyNotices = await generateThirdPartyNotices();

await writeFile(
  join(outputDir, "THIRD_PARTY_NOTICES.txt"),
  thirdPartyNotices,
  "utf8",
);

console.log("[7/7] ZIP 배포본을 생성합니다.");

execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    "Compress-Archive -LiteralPath $env:LEAGUE_STUDIO_OUTPUT -DestinationPath $env:LEAGUE_STUDIO_ZIP -Force",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      LEAGUE_STUDIO_OUTPUT: outputDir,
      LEAGUE_STUDIO_ZIP: zipPath,
    },
  },
);

console.log("\n생성 완료:");
console.log(outputDir);
console.log(zipPath);
console.log("\nLeagueStudioServer.exe를 실행해 주세요.");