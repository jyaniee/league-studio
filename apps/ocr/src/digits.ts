// 글자 덩어리를 5×7 격자로 줄여 숫자로 판별함.
// 0은 빈 칸, 1은 글자 픽셀. 획이 다른 모양은 같은 숫자에 더 둠.
const DIGIT_SHAPES: ReadonlyArray<{ digit: string; rows: readonly string[] }> = [
  { digit: "0", rows: ["00111", "11001", "10001", "10001", "10001", "10001", "11111"] },
  { digit: "0", rows: ["01110", "10001", "10001", "10001", "10001", "10001", "11110"] },
  { digit: "1", rows: ["00011", "11111", "00001", "00001", "00001", "00001", "00001"] },
  { digit: "1", rows: ["11111", "11011", "00011", "00011", "00011", "00011", "00011"] },
  { digit: "2", rows: ["01110", "10001", "00001", "00010", "00110", "01100", "11111"] },
  { digit: "3", rows: ["00111", "11001", "00001", "00111", "00001", "00001", "11111"] },
  { digit: "3", rows: ["01110", "10001", "00001", "00110", "00001", "00001", "11110"] },
  { digit: "3", rows: ["01111", "00001", "00001", "00011", "00001", "10001", "11111"] },
  { digit: "4", rows: ["00010", "00110", "00110", "01010", "11010", "11111", "00010"] },
  { digit: "5", rows: ["11111", "11000", "11110", "01001", "00001", "00001", "11111"] },
  { digit: "6", rows: ["00010", "00110", "01100", "01111", "11001", "10001", "11111"] },
  { digit: "7", rows: ["11111", "00001", "00010", "00010", "00110", "00100", "01000"] },
  { digit: "7", rows: ["11111", "00001", "00011", "00011", "00010", "00100", "01100"] },
  { digit: "8", rows: ["01110", "10001", "10001", "01110", "10001", "10001", "11110"] },
  { digit: "8", rows: ["01110", "11001", "11001", "01110", "10001", "10001", "11110"] },
  { digit: "9", rows: ["00111", "11001", "10001", "11001", "00111", "00010", "00100"] },
  { digit: "9", rows: ["01111", "11001", "11001", "01111", "00010", "00110", "00100"] },
];

const GRID_WIDTH = 5;
const GRID_HEIGHT = 7;
const GRID_LENGTH = GRID_WIDTH * GRID_HEIGHT;
// 35칸 중 이 값보다 더 다르면 그 숫자는 버림.
const MAX_DISTANCE = 10;
// 1위와 2위가 이 값보다 가깝면 둘 중 하나를 고르지 않음.
const MIN_MARGIN = 3;

const TEMPLATES = DIGIT_SHAPES.map((shape) => ({
  digit: shape.digit,
  bits: shape.rows.join(""),
}));

export type Glyph = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  ink: number;
};

export function connectedGlyphs(mask: Uint8Array, width: number, height: number): Glyph[] {
  const seen = new Uint8Array(mask.length);
  const glyphs: Glyph[] = [];

  for (let start = 0; start < mask.length; start += 1) {
    if (mask[start] !== 1 || seen[start] === 1) {
      continue;
    }

    const stack = [start];
    seen[start] = 1;
    let x0 = width;
    let x1 = 0;
    let y0 = height;
    let y1 = 0;
    let ink = 0;

    while (stack.length > 0) {
      const index = stack.pop();
      if (index === undefined) {
        break;
      }
      const x = index % width;
      const y = Math.floor(index / width);
      ink += 1;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x + 1);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y + 1);

      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny < 0 || nx < 0 || ny >= height || nx >= width) {
            continue;
          }
          const next = ny * width + nx;
          if (mask[next] === 1 && seen[next] === 0) {
            seen[next] = 1;
            stack.push(next);
          }
        }
      }
    }

    glyphs.push({ x0, x1, y0, y1, ink });
  }

  glyphs.sort((left, right) => left.x0 - right.x0);
  return glyphs;
}

function columnInk(mask: Uint8Array, width: number, x: number, height: number): number {
  let count = 0;
  for (let y = 0; y < height; y += 1) {
    count += mask[y * width + x];
  }
  return count;
}

function glyphBounds(
  mask: Uint8Array,
  width: number,
  height: number,
  x0: number,
  x1: number,
): Glyph | null {
  let y0 = height;
  let y1 = 0;
  let ink = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      if (mask[y * width + x] === 1) {
        ink += 1;
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y + 1);
      }
    }
  }

  if (ink < 6 || y1 - y0 < 5 || x1 - x0 < 1) {
    return null;
  }

  return { x0, x1, y0, y1, ink };
}

// 가로가 세로보다 긴 덩어리는 가운데의 가장 빈 열에서 두 글자로 가름.
export function splitTouchingGlyphs(
  mask: Uint8Array,
  width: number,
  height: number,
  glyphs: Glyph[],
): Glyph[] {
  const split: Glyph[] = [];

  for (const glyph of glyphs) {
    const runWidth = glyph.x1 - glyph.x0;
    const runHeight = glyph.y1 - glyph.y0;
    if (runWidth <= runHeight * 0.95) {
      split.push(glyph);
      continue;
    }

    const mid0 = glyph.x0 + Math.floor(runWidth * 0.35);
    const mid1 = glyph.x0 + Math.ceil(runWidth * 0.65);
    let splitAt = -1;
    let lightest = Number.POSITIVE_INFINITY;
    for (let x = mid0; x < mid1; x += 1) {
      const count = columnInk(mask, width, x, height);
      if (count < lightest) {
        lightest = count;
        splitAt = x;
      }
    }

    if (splitAt < 0 || lightest > 1) {
      split.push(glyph);
      continue;
    }

    const left = glyphBounds(mask, width, height, glyph.x0, splitAt);
    const right = glyphBounds(mask, width, height, splitAt + 1, glyph.x1);
    if (left !== null) {
      split.push(left);
    }
    if (right !== null) {
      split.push(right);
    }
  }

  return split;
}

function binRange(index: number, bins: number, size: number): [number, number] {
  const start = Math.floor((index * size) / bins);
  const end = Math.floor(((index + 1) * size) / bins);
  return [start, Math.max(start + 1, end)];
}

function normalizeGlyph(mask: Uint8Array, width: number, glyph: Glyph): string {
  const glyphWidth = glyph.x1 - glyph.x0;
  const glyphHeight = glyph.y1 - glyph.y0;
  const bits = Array.from({ length: GRID_LENGTH }, () => "0");

  for (let gy = 0; gy < GRID_HEIGHT; gy += 1) {
    const [sy0, sy1] = binRange(gy, GRID_HEIGHT, glyphHeight);
    for (let gx = 0; gx < GRID_WIDTH; gx += 1) {
      const [sx0, sx1] = binRange(gx, GRID_WIDTH, glyphWidth);
      let ink = 0;
      let total = 0;
      for (let y = sy0; y < sy1; y += 1) {
        for (let x = sx0; x < sx1; x += 1) {
          total += 1;
          ink += mask[(glyph.y0 + y) * width + glyph.x0 + x];
        }
      }

      if (total > 0 && ink / total >= 0.35) {
        bits[gy * GRID_WIDTH + gx] = "1";
      }
    }
  }

  return bits.join("");
}

function hamming(left: string, right: string): number {
  let distance = 0;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      distance += 1;
    }
  }
  return distance;
}

function classifyGlyph(bits: string): string | null {
  const distanceByDigit = new Map<string, number>();

  for (const template of TEMPLATES) {
    const distance = hamming(bits, template.bits);
    const previous = distanceByDigit.get(template.digit);
    if (previous === undefined || distance < previous) {
      distanceByDigit.set(template.digit, distance);
    }
  }

  let bestDigit = "";
  let bestDistance = GRID_LENGTH;
  let secondDistance = GRID_LENGTH;

  for (const [digit, distance] of distanceByDigit) {
    if (distance < bestDistance) {
      secondDistance = bestDistance;
      bestDistance = distance;
      bestDigit = digit;
    } else if (distance < secondDistance) {
      secondDistance = distance;
    }
  }

  if (bestDigit === "" || bestDistance > MAX_DISTANCE) {
    return null;
  }

  if (secondDistance - bestDistance < MIN_MARGIN) {
    return null;
  }

  return bestDigit;
}

export function readDigitGlyph(mask: Uint8Array, width: number, glyph: Glyph): string | null {
  return classifyGlyph(normalizeGlyph(mask, width, glyph));
}
