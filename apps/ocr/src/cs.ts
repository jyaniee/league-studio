// 탭 점수판의 블루·레드 CS를 다섯 줄씩 읽음.
import { connectedGlyphs, readDigitGlyph, splitTouchingGlyphs } from "./digits.js";
import { maskBrightBox, scaleBox, type Box, type RgbaFrame, type Side } from "./frame.js";

// 1920×1080, 배율 1X 점수판의 CS 칸.
const ROW_Y = 864;
const ROW_PITCH = 44;
const ROW_HEIGHT = 18;
const BLUE_CS = { x: 882, width: 30 } as const;
const RED_CS = { x: 1022, width: 34 } as const;

export type CsReading = {
  side: Side;
  row: number;
  value: number | null;
};

function digitsOnly(text: string): number | null {
  if (!/^\d+$/.test(text)) {
    return null;
  }

  // 앞에 0이 붙은 값은 오인식임. CS 0은 "0" 한 글자이므로 남김.
  if (/^0\d+$/.test(text)) {
    return null;
  }

  return Number(text);
}

function readCsBox(frame: RgbaFrame, box: Box): number | null {
  const mask = maskBrightBox(frame, box);
  if (mask === null) {
    return null;
  }

  const glyphs = splitTouchingGlyphs(
    mask,
    box.width,
    box.height,
    connectedGlyphs(mask, box.width, box.height).filter(
      (glyph) => glyph.ink >= 8 && glyph.y1 - glyph.y0 >= 6,
    ),
  );
  const tallest = glyphs.reduce((max, glyph) => Math.max(max, glyph.y1 - glyph.y0), 0);
  const letters = glyphs.filter((glyph) => glyph.y1 - glyph.y0 >= tallest * 0.75);
  if (letters.length === 0 || letters.length > 3) {
    return null;
  }

  let text = "";
  for (const glyph of letters) {
    const digit = readDigitGlyph(mask, box.width, glyph);
    if (digit === null) {
      return null;
    }
    text += digit;
  }

  return digitsOnly(text);
}

export function readCs(frame: RgbaFrame): CsReading[] {
  const readings: CsReading[] = [];

  for (const [side, column] of [
    ["blue", BLUE_CS],
    ["red", RED_CS],
  ] as const) {
    for (let row = 0; row < 5; row += 1) {
      const box = scaleBox(frame, {
        x: column.x,
        y: ROW_Y + row * ROW_PITCH,
        width: column.width,
        height: ROW_HEIGHT,
      });
      readings.push({
        side,
        row: row + 1,
        value: box === null ? null : readCsBox(frame, box),
      });
    }
  }

  return readings;
}
