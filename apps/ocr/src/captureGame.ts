import { Window } from "node-screenshots";

// "League of Legends"는 경기 중 최소화되는 클라이언트다.
// 화면에 보이는 경기 창 이름은 "League of Legends (TM) Client"다.
const GAME_WINDOW_TITLE = "League of Legends (TM) Client";

function isGameWindow(window: Window): boolean {
  try {
    return (
      window.title() === GAME_WINDOW_TITLE ||
      window.appName() === GAME_WINDOW_TITLE
    );
  } catch {
    return false;
  }
}

function isVisible(window: Window): boolean {
  try {
    return !window.isMinimized() && window.width() > 0 && window.height() > 0;
  } catch {
    return false;
  }
}

export async function captureGamePng(): Promise<Buffer> {
  let games: Window[];
  try {
    games = Window.all().filter(isGameWindow);
  } catch {
    throw new Error("게임 화면을 캡처하지 못했습니다.");
  }

  if (games.length === 0) {
    throw new Error("리그 오브 레전드 게임 창을 찾지 못했습니다.");
  }

  const game = games.filter(isVisible)[0];
  if (game === undefined) {
    throw new Error("게임 창이 최소화되어 있습니다.");
  }

  try {
    const image = await game.captureImage();
    return await image.toPng();
  } catch {
    throw new Error("게임 화면을 캡처하지 못했습니다.");
  }
}
