import { Jimp } from "jimp";
import { createWorker, PSM } from "tesseract.js";

// 1920x1080 관전 점수판, 배율 1X. 왼쪽 위가 원점.
// 다른 해상도는 이 기준 대비 비율로 칸을 잡는다.
const REF_WIDTH = 1920;
const REF_HEIGHT = 1080;
const ROW_Y = 862;
const ROW_PITCH = 42;
const ROW_HEIGHT = 30;
const BLUE_X = [864, 918] as const;
const RED_X = [1022, 1074] as const;
// 블루 CS 왼쪽에는 점수판 줄 무늬가 걸친다. 한 자리 숫자가 그 무늬와 같이 읽혀 비지 않도록 칸을 좁힌다.
const BLUE_CROP_INSET = { left: 16, right: 8 } as const;

export type ScoreboardSide = "blue" | "red";

export type ScoreboardReading = {
  side: ScoreboardSide;
  row: number;
  value: number | null;
};

type CsBox = {
  side: ScoreboardSide;
  row: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

type OcrWorker = Awaited<ReturnType<typeof createWorker>>;
type ScoreboardImage = Awaited<ReturnType<typeof Jimp.read>>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function csBoxes(imageWidth: number, imageHeight: number): CsBox[] {
  const scaleX = imageWidth / REF_WIDTH;
  const scaleY = imageHeight / REF_HEIGHT;
  const boxes: CsBox[] = [];

  for (const [side, [x0, x1]] of [
    ["blue", BLUE_X],
    ["red", RED_X],
  ] as const) {
    for (let row = 0; row < 5; row += 1) {
      const y0 = ROW_Y + row * ROW_PITCH;
      const insetLeft = side === "blue" ? BLUE_CROP_INSET.left : 0;
      const insetRight = side === "blue" ? BLUE_CROP_INSET.right : 0;
      const left = clamp(
        Math.round((x0 + insetLeft) * scaleX),
        0,
        imageWidth - 1,
      );
      const top = clamp(Math.round(y0 * scaleY), 0, imageHeight - 1);
      const right = clamp(
        Math.round((x1 - insetRight) * scaleX),
        left + 1,
        imageWidth,
      );
      const bottom = clamp(
        Math.round((y0 + ROW_HEIGHT) * scaleY),
        top + 1,
        imageHeight,
      );

      boxes.push({
        side,
        row,
        left,
        top,
        width: right - left,
        height: bottom - top,
      });
    }
  }

  return boxes;
}

function digitsOnly(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  // "04"는 5를 0으로 잘못 읽은 결과다. 숫자로 바꾸면 4가 되므로 버리고 다시 읽는다.
  // 실제 CS 0은 "0" 한 글자이므로 그대로 둔다.
  if (/^0\d+$/.test(trimmed)) {
    return null;
  }

  return Number(trimmed);
}

async function readCell(
  worker: OcrWorker,
  image: ScoreboardImage,
  box: CsBox,
): Promise<number | null> {
  const cell = image.clone();
  cell.crop({ x: box.left, y: box.top, w: box.width, h: box.height });
  cell.resize({ w: box.width * 8, h: box.height * 8 });
  // 금색 글자를 검은 글자로 바꿔 Tesseract가 읽기 쉽게 한다.
  cell.greyscale();
  cell.invert();

  const buffer = await cell.getBuffer("image/png");
  // 한 줄 읽기가 두 자리 숫자를 유지한다. 비면 글자 하나로 다시 읽어 5, 0을 살린다.
  for (const mode of [PSM.SINGLE_LINE, PSM.SINGLE_WORD]) {
    await worker.setParameters({ tessedit_pageseg_mode: mode });
    const result = await worker.recognize(buffer);
    const value = digitsOnly(result.data.text);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

export async function readScoreboard(
  image: ScoreboardImage,
  worker: OcrWorker,
): Promise<ScoreboardReading[]> {
  const readings: ScoreboardReading[] = [];

  for (const box of csBoxes(image.bitmap.width, image.bitmap.height)) {
    readings.push({
      side: box.side,
      row: box.row + 1,
      value: await readCell(worker, image, box),
    });
  }

  return readings;
}

export function formatReadings(readings: ScoreboardReading[]): string {
  return readings
    .map((reading) => {
      const shown = reading.value === null ? "-" : String(reading.value);
      return `${reading.side} ${reading.row} ${shown}`;
    })
    .join("\n");
}

export function isMostlyBlack(image: ScoreboardImage): boolean {
  const { data } = image.bitmap;
  let total = 0;
  let count = 0;

  for (let index = 0; index + 2 < data.length; index += 80) {
    total += data[index] + data[index + 1] + data[index + 2];
    count += 1;
  }

  if (count === 0) {
    return true;
  }

  return total / count < 15;
}
