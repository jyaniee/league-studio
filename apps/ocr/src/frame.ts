// 캡처 프레임의 칸 좌표. CS와 팀 골드는 배경보다 밝은 글자를 같은 기준으로 고름.
const REF_WIDTH = 1920;
const REF_HEIGHT = 1080;

export type Side = "blue" | "red";

export type RgbaFrame = {
  width: number;
  height: number;
  rgba: Buffer;
};

export type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function scaleBox(
  frame: RgbaFrame,
  ref: { x: number; y: number; width: number; height: number },
): Box | null {
  const left = Math.round((ref.x * frame.width) / REF_WIDTH);
  const top = Math.round((ref.y * frame.height) / REF_HEIGHT);
  const width = Math.max(1, Math.round((ref.width * frame.width) / REF_WIDTH));
  const height = Math.max(1, Math.round((ref.height * frame.height) / REF_HEIGHT));
  if (left < 0 || top < 0 || left + width > frame.width || top + height > frame.height) {
    return null;
  }
  return { left, top, width, height };
}

function luminance(rgba: Buffer, pixelIndex: number): number {
  const offset = pixelIndex * 4;
  return (rgba[offset] * 54 + rgba[offset + 1] * 183 + rgba[offset + 2] * 19) >> 8;
}

function otsuThreshold(lumas: Uint8Array): number {
  const hist = new Uint32Array(256);
  for (let index = 0; index < lumas.length; index += 1) {
    hist[lumas[index]] += 1;
  }

  const total = lumas.length;
  let sum = 0;
  for (let value = 0; value < 256; value += 1) {
    sum += value * hist[value];
  }

  let sumBackground = 0;
  let weightBackground = 0;
  let bestScore = -1;
  let threshold = 0;

  for (let value = 0; value < 256; value += 1) {
    weightBackground += hist[value];
    if (weightBackground === 0) {
      continue;
    }

    const weightForeground = total - weightBackground;
    if (weightForeground === 0) {
      break;
    }

    sumBackground += value * hist[value];
    const meanBackground = sumBackground / weightBackground;
    const meanForeground = (sum - sumBackground) / weightForeground;
    const score =
      weightBackground * weightForeground * (meanBackground - meanForeground) ** 2;

    if (score > bestScore) {
      bestScore = score;
      threshold = value;
    }
  }

  return threshold;
}

// 칸을 가로지르는 줄은 글자가 아니므로 지움.
function clearHorizontalRules(mask: Uint8Array, width: number, height: number): void {
  for (let y = 0; y < height; y += 1) {
    let count = 0;
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      count += mask[row + x];
    }

    if (count > width * 0.7) {
      mask.fill(0, row, row + width);
    }
  }
}

export function maskBrightBox(frame: RgbaFrame, box: Box): Uint8Array | null {
  const lumas = new Uint8Array(box.width * box.height);
  for (let y = 0; y < box.height; y += 1) {
    for (let x = 0; x < box.width; x += 1) {
      const pixel = (box.top + y) * frame.width + box.left + x;
      lumas[y * box.width + x] = luminance(frame.rgba, pixel);
    }
  }

  const threshold = otsuThreshold(lumas);
  const mask = new Uint8Array(lumas.length);
  let ink = 0;
  for (let index = 0; index < lumas.length; index += 1) {
    if (lumas[index] > threshold) {
      mask[index] = 1;
      ink += 1;
    }
  }

  if (ink === 0 || ink / lumas.length > 0.55) {
    return null;
  }

  clearHorizontalRules(mask, box.width, box.height);
  return mask;
}

export function isMostlyBlack(frame: RgbaFrame): boolean {
  const { rgba } = frame;
  let total = 0;
  let count = 0;

  for (let index = 0; index + 2 < rgba.length; index += 80) {
    total += rgba[index] + rgba[index + 1] + rgba[index + 2];
    count += 1;
  }

  if (count === 0) {
    return true;
  }

  return total / count < 15;
}
