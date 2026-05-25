import type { GameObjectives, ObjectiveTimer } from "@league-studio/shared-types";
import {
  OBJECTIVE_FIRST_SPAWN_TIMES,
  OBJECTIVE_RESPAWN_TIMES,
} from "@league-studio/shared-types";

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
  respawnTime?: number;
  canRespawn: boolean;
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
  canRespawn,
}: CalculateObjectiveTimerParams): ObjectiveTimer {
  const killEvents = findEvents(events, eventName); // findevnet 로 eventName인 것을 남김
  const lastKillEvent = killEvents[killEvents.length-1];

  const nextSpawnTime = 
  lastKillEvent && respawnTime !== undefined
  ? lastKillEvent.EventTime + respawnTime
  : firstSpawnTime;

  const remainingSeconds = Math.max(0, Math.floor(nextSpawnTime - gameTime));
  const isAlive = gameTime >= nextSpawnTime;

  return {
    status: isAlive ? "alive" : "waiting",
    isAlive,
    canRespawn,
    spawnTimeSeconds: firstSpawnTime,
    lastKillTimeSeconds: lastKillEvent?.EventTime,
    nextSpawnTimeSeconds: nextSpawnTime,
    remainingSeconds,
  };
}

export function calculateObjectives(
  gameTime: number,
  events: LiveClientEvent[],
): GameObjectives {
  return {
    dragon: calculateObjectiveTimer({
      gameTime,
      events,
      eventName: "DragonKill",
      firstSpawnTime: OBJECTIVE_FIRST_SPAWN_TIMES.dragon,
      respawnTime: OBJECTIVE_RESPAWN_TIMES.dragon,
      canRespawn: true,
    }),

    elder: {
      status: "inactive",
      isAlive: false,
      canRespawn: true,
    },

    baron: calculateObjectiveTimer({
      gameTime,
      events,
      eventName: "BaronKill",
      firstSpawnTime: OBJECTIVE_FIRST_SPAWN_TIMES.baron,
      respawnTime: OBJECTIVE_RESPAWN_TIMES.baron,
      canRespawn: true,
    }),

    herald: calculateObjectiveTimer({
      gameTime,
      events,
      eventName: "HeraldKill",
      firstSpawnTime: OBJECTIVE_FIRST_SPAWN_TIMES.herald,
      canRespawn: false,
    }),

    voidgrubs: calculateObjectiveTimer({
      gameTime,
      events,
      eventName: "HordeKill",
      firstSpawnTime: OBJECTIVE_FIRST_SPAWN_TIMES.voidgrubs,
      canRespawn: false,
    }),
  };
}