import type { GameObjectives, ObjectiveTimer } from "@league-studio/shared-types";

const FIRST_DRAGON_SPAWN = 5 * 60;
const DRAGON_RESPAWN = 5 * 60;

const FIRST_BARON_SPAWN = 20 * 60;
const BARON_RESPAWN = 6 * 60;

interface LiveClientEvent {
  EventID: number;
  EventName: string;
  EventTime: number;
  KillerName?: string;
  VictimName?: string;
}

interface CalculateObjectiveTimerParams {
  gameTime: number;
  events: LiveClientEvent[];
  eventName: string;
  firstSpawnTime: number;
  respawnTime: number;
}
//초 단위 숫자를 분:초 형태로 바꾸는 함수임.
export function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const secs = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${secs}`;
}
//함수는 이벤트 목록에서 원하는 이벤트만 찾음
function findEvents(events: LiveClientEvent[], eventName: string) {
  return events
    .filter((event) => event.EventName === eventName) //내가 찾는 이벤트 이름과 같은 것만 남김
    .sort((a, b) => a.EventTime - b.EventTime); // 남은 이벤트들을 시간 순서대로 정렬함.
}

function calculateObjectiveTimer({
  gameTime,
  events,
  eventName,
  firstSpawnTime,
  respawnTime,
}: CalculateObjectiveTimerParams): ObjectiveTimer {
  const killEvents = findEvents(events, eventName); // findevnet 로 eventName인 것을 남김
  const lastKillEvent = killEvents[killEvents.length - 1]; // 배열에서 마지막 값을 가져옴.
  const nextSpawnTime = lastKillEvent
    ? lastKillEvent.EventTime + respawnTime
    : firstSpawnTime;
  const remainingSeconds = nextSpawnTime - gameTime;
  const isAlive = remainingSeconds <= 0;

  return {
    status: isAlive ? "LIVE" : "대기 중",
    isAlive,
    lastKillTime: lastKillEvent
      ? formatTime(lastKillEvent.EventTime)
      : "아직 처치 안 됨",
    nextSpawnTime: formatTime(nextSpawnTime),
    remainingTime: isAlive ? "생성됨" : formatTime(remainingSeconds),
    rawRemainingSeconds: Math.max(0, Math.floor(remainingSeconds)),
  };
}

export function calculateObjectives(
  gameTime: number, // 게임 시간 받아오기
  events: LiveClientEvent[] // event 목록 받아오기
): GameObjectives {
  return {
    dragon: calculateObjectiveTimer({
      gameTime,
      events,
      eventName: "DragonKill",
      firstSpawnTime: FIRST_DRAGON_SPAWN,
      respawnTime: DRAGON_RESPAWN,
    }),
    baron: calculateObjectiveTimer({
      gameTime,
      events,
      eventName: "BaronKill",
      firstSpawnTime: FIRST_BARON_SPAWN,
      respawnTime: BARON_RESPAWN,
    }),
  };
}