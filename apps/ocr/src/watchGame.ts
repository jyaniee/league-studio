import { captureGameFrame } from "./captureGame.js";
import { isMostlyBlack } from "./frame.js";
import { readTeamGold } from "./gold.js";
import { readCs, type CsReading } from "./cs.js";

const ocrCsUrl = process.env.OCR_CS_URL ?? "http://127.0.0.1:3003/ocr/cs";
const ocrGoldUrl = process.env.OCR_GOLD_URL ?? "http://127.0.0.1:3003/ocr/gold";
const pauseMs = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function sideValues(
  readings: CsReading[],
  side: CsReading["side"],
): Array<number | null> {
  return [1, 2, 3, 4, 5].map((row) => {
    const found = readings.find(
      (reading) => reading.side === side && reading.row === row,
    );
    return found === undefined ? null : found.value;
  });
}

async function postJson(url: string, body: unknown, failure: string): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${failure} ${response.status}`);
  }
}

async function publishReadings(readings: CsReading[]): Promise<void> {
  await postJson(
    ocrCsUrl,
    {
      blue: sideValues(readings, "blue"),
      red: sideValues(readings, "red"),
    },
    "CS 비교 서버 응답",
  );
}

function cell(value: number | null, width: number): string {
  const shown = value === null ? "-" : String(value);
  return shown.padStart(width, " ");
}

function formatFrame(
  readings: CsReading[],
  gold: { blue: number | null; red: number | null },
): string {
  return (["blue", "red"] as const)
    .map((side) => {
      const cs = sideValues(readings, side).map((value) => cell(value, 4)).join(" ");
      return `${side}  cs ${cs}  gold ${cell(gold[side], 6)}`;
    })
    .join("\n");
}

async function publishGold(gold: { blue: number | null; red: number | null }): Promise<void> {
  await postJson(ocrGoldUrl, gold, "팀 골드 서버 응답");
}

async function main(): Promise<void> {
  console.log("게임 창의 점수판과 상단 팀 골드를 읽어 비교 서버로 보냅니다.");
  console.log("10단위 구간에 들어간 값만 cs에 반영됩니다. 종료는 Ctrl+C 입니다.");

  let stopped = false;
  process.on("SIGINT", () => {
    stopped = true;
  });

  while (!stopped) {
    try {
      const frame = await captureGameFrame();
      if (isMostlyBlack(frame)) {
        console.log("게임 화면이 검게 캡처되었습니다. 테두리 없는 전체화면에서 다시 시도하세요.");
      } else {
        const readings = readCs(frame);
        const gold = readTeamGold(frame);
        console.log(formatFrame(readings, gold));
        try {
          await publishReadings(readings);
        } catch (error) {
          console.error(error instanceof Error ? error.message : error);
        }
        try {
          await publishGold(gold);
        } catch (error) {
          console.error(error instanceof Error ? error.message : error);
        }
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }

    if (!stopped) {
      await sleep(pauseMs);
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
