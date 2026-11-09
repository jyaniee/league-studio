// 상단 HUD의 팀 골드를 정수로 읽음. 화면의 25.1k는 25100임.
import { connectedGlyphs, readDigitGlyph, splitTouchingGlyphs, type Glyph } from "./digits.js";
import { maskBrightBox, scaleBox, type Box, type RgbaFrame } from "./frame.js";

// 1920×1080 칸. 동전과 킬 수를 빼고, 100.4k처럼 세 자리까지 담음.
const BLUE_GOLD = { x: 798, y: 16, width: 62, height: 20 } as const;
const RED_GOLD = { x: 1103, y: 16, width: 58, height: 20 } as const;

function readGoldBox(frame: RgbaFrame, box: Box): number | null {
  const mask = maskBrightBox(frame, box);
  if (mask === null) {
    return null;
  }

  const glyphs = splitTouchingGlyphs(
    mask,
    box.width,
    box.height,
    connectedGlyphs(mask, box.width, box.height),
  );
  const tall = glyphs.filter((glyph) => glyph.ink >= 8 && glyph.y1 - glyph.y0 >= 6);
  const tallest = tall.reduce((max, glyph) => Math.max(max, glyph.y1 - glyph.y0), 0);
  const letters = tall.filter((glyph) => glyph.y1 - glyph.y0 >= tallest * 0.75);
  const dots = glyphs.filter((glyph) => isDecimalDot(glyph, letters));
  if (dots.length !== 1 || letters.length < 3) {
    return null;
  }

  const dot = dots[0];
  const classified = letters.map((glyph) => ({
    glyph,
    digit: readDigitGlyph(mask, box.width, glyph),
  }));
  const suffix = classified[classified.length - 1];
  if (suffix === undefined || suffix.digit !== null || suffix.glyph.x0 <= dot.x0) {
    return null;
  }

  const whole = classified.filter((item) => item.glyph.x1 <= dot.x0);
  const fraction = classified.filter((item) => item.glyph.x0 > dot.x1 && item !== suffix);
  if (whole.length < 1 || whole.length > 3 || fraction.length !== 1) {
    return null;
  }

  const wholeDigits = whole.map((item) => item.digit);
  const fractionDigit = fraction[0]?.digit;
  if (fractionDigit === null || fractionDigit === undefined || wholeDigits.some((digit) => digit === null)) {
    return null;
  }

  const wholeValue = Number(wholeDigits.join(""));
  const fractionValue = Number(fractionDigit);
  if (!Number.isInteger(wholeValue) || !Number.isInteger(fractionValue)) {
    return null;
  }

  return wholeValue * 1000 + fractionValue * 100;
}

function isDecimalDot(glyph: Glyph, letters: Glyph[]): boolean {
  const width = glyph.x1 - glyph.x0;
  const height = glyph.y1 - glyph.y0;
  if (glyph.ink > 8 || width > 3 || height > 4 || letters.length === 0) {
    return false;
  }

  const top = letters.reduce((min, letter) => Math.min(min, letter.y0), letters[0].y0);
  const bottom = letters.reduce((max, letter) => Math.max(max, letter.y1), letters[0].y1);
  if (glyph.y0 < (top + bottom) / 2) {
    return false;
  }

  return !letters.some((letter) => glyph.x0 < letter.x1 && glyph.x1 > letter.x0);
}

export function readTeamGold(frame: RgbaFrame): { blue: number | null; red: number | null } {
  const blueBox = scaleBox(frame, BLUE_GOLD);
  const redBox = scaleBox(frame, RED_GOLD);
  return {
    blue: blueBox === null ? null : readGoldBox(frame, blueBox),
    red: redBox === null ? null : readGoldBox(frame, redBox),
  };
}
