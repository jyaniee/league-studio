import {
  access,
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const serverBundle = join(projectRoot, "apps/server/dist/index.js");
const overlayDist = join(projectRoot, "apps/overlay/dist");

// 빌드 결과가 있는지 먼저 확인합니다.
await access(serverBundle);
await access(join(overlayDist, "index.html"));

const serverPackage = JSON.parse(
  await readFile(join(projectRoot, "apps/server/package.json"), "utf8"),
);

// 공용 패키지는 서버 번들에 포함되어 있으므로,
// 실행 시 별도로 필요한 외부 패키지만 가져옵니다.
const dependencies = {};

for (const name of ["ws", "dotenv", "sirv"]) {
  const version = serverPackage.dependencies[name];

  if (!version) {
    throw new Error(`서버 dependencies에서 ${name}을 찾을 수 없습니다.`);
  }

  dependencies[name] = version;
}

// 실행할 때마다 Documents 아래에 새 폴더를 만듭니다.
const outputDir = await mkdtemp(
  join(homedir(), "Documents", "LeagueStudio-test-"),
);

const serverDir = join(outputDir, "apps/server");
const serverDist = join(serverDir, "dist");

await mkdir(serverDist, { recursive: true });
await copyFile(serverBundle, join(serverDist, "index.js"));
await cp(overlayDist, join(outputDir, "apps/overlay/dist"), {
  recursive: true,
});

await writeFile(
  join(outputDir, "package.json"),
  JSON.stringify(
    {
      name: "league-studio-deployment-experiment",
      version: "0.0.0",
      private: true,
      type: "module",
      scripts: {
        start: "node apps/server/dist/index.js",
      },
      engines: {
        node: ">=24",
      },
      dependencies,
    },
    null,
    2,
  ) + "\n",
);

// 개인 개발 설정을 복사하지 않고 mock 실험 설정을 만듭니다.
await writeFile(join(serverDir, ".env"), "USE_MOCK=true\n");

console.log("\n실험용 배포 폴더 생성 완료:");
console.log(outputDir);
console.log("\n다음 명령을 순서대로 실행하세요:");
console.log(`cd "${outputDir}"`);
console.log("npm install --omit=dev");
console.log("npm start");