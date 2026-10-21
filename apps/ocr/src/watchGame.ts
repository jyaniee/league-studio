import { Jimp } from "jimp";
import { createWorker } from "tesseract.js";
import { captureGamePng } from "./captureGame.js";
import {
  formatReadings,
  isMostlyBlack,
  readScoreboard,
  type ScoreboardReading,
} from "./scoreboard.js";

const ocrCsUrl = process.env.OCR_CS_URL ?? "http://127.0.0.1:3003/ocr/cs";
const pauseMs = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function sideValues(
  readings: ScoreboardReading[],
  side: ScoreboardReading["side"],
): Array<number | null> {
  return [1, 2, 3, 4, 5].map((row) => {
    const found = readings.find(
      (reading) => reading.side === side && reading.row === row,
    );
    return found === undefined ? null : found.value;
  });
}

async function publishReadings(readings: ScoreboardReading[]): Promise<void> {
  const response = await fetch(ocrCsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blue: sideValues(readings, "blue"),
      red: sideValues(readings, "red"),
    }),
  });

  if (!response.ok) {
    throw new Error(`CS 비교 서버 응답 ${response.status}`);
  }
}

async function main(): Promise<void> {
  const worker = await createWorker("eng");
  await worker.setParameters({
    tessedit_char_whitelist: "0123456789",
  });

  console.log("게임 창의 점수판을 읽어 비교 서버로 보냅니다.");
  console.log("10단위 구간에 들어간 값만 cs에 반영됩니다. 종료는 Ctrl+C 입니다.");

  let stopped = false;
  const stop = () => {
    stopped = true;
  };
  process.on("SIGINT", stop);

  try {
    while (!stopped) {
      try {
        const image = await Jimp.read(await captureGamePng());
        console.log(`image ${image.bitmap.width}x${image.bitmap.height}`);
        if (isMostlyBlack(image)) {
          console.log("게임 화면이 검게 캡처되었습니다. 테두리 없는 전체화면에서 다시 시도하세요.");
        } else {
          const readings = await readScoreboard(image, worker);
          console.log(formatReadings(readings));
          try {
            await publishReadings(readings);
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
  } finally {
    await worker.terminate();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
