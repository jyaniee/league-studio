import type { GameObjectives, ObjectiveTimer } from "@league-studio/shared-types";
import {
  OBJECTIVE_FIRST_SPAWN_TIMES,
  OBJECTIVE_RESPAWN_TIMES,
  VOIDGRUB_TOTAL_COUNT
} from "@league-studio/shared-types";
import type { LiveClientEvent } from "../data-sources/liveClientTypes";

const DRAGONS_REQUIRED_FOR_SOUL = 4;

interface CalculateObjectiveTimerParams {
  gameTime: number;
  events: LiveClientEvent[];
  eventName: string;
  firstSpawnTime: number;
  respawnTime?: number;
  canRespawn: boolean;
  endTime?: number;
}

export function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const secs = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${secs}`;
}

function findEvents(events: LiveClientEvent[], eventName: string) {
  return events
    .filter((event) => event.EventName === eventName)
    .sort((a, b) => a.EventTime - b.EventTime);
}

function calculateVoidgrubsTimer(
  gameTime: number,
  events: LiveClientEvent[],
): ObjectiveTimer {
  const voidgrubKillEvents = findEvents(events, "HordeKill");
  const killedCount = Math.min(voidgrubKillEvents.length, VOIDGRUB_TOTAL_COUNT);
  const lastKillEvent = voidgrubKillEvents[voidgrubKillEvents.length - 1];

  const firstSpawnTime = OBJECTIVE_FIRST_SPAWN_TIMES.voidgrubs;
  const endTime = OBJECTIVE_FIRST_SPAWN_TIMES.herald;

  if (killedCount >= VOIDGRUB_TOTAL_COUNT) {
    return {
      status: "ended",
      isAlive: false,
      canRespawn: false,
      spawnTimeSeconds: firstSpawnTime,
      lastKillTimeSeconds: lastKillEvent?.EventTime,
      remainingSeconds: 0,
    };
  }

  if (gameTime >= endTime) {
    return {
      status: "ended",
      isAlive: false,
      canRespawn: false,
      spawnTimeSeconds: firstSpawnTime,
      lastKillTimeSeconds: lastKillEvent?.EventTime,
      nextSpawnTimeSeconds: firstSpawnTime,
      remainingSeconds: 0,
    };
  }

  const remainingSeconds = Math.max(0, Math.floor(firstSpawnTime - gameTime));
  const isAlive = gameTime >= firstSpawnTime;

  return {
    status: isAlive ? "alive" : "inactive",
    isAlive,
    canRespawn: false,
    spawnTimeSeconds: firstSpawnTime,
    lastKillTimeSeconds: lastKillEvent?.EventTime,
    nextSpawnTimeSeconds: firstSpawnTime,
    remainingSeconds,
  };
}

function getDragonSoulTime(events: LiveClientEvent[]): number | undefined {
  const elementalDragonKillEvents = findEvents(events, "DragonKill").filter(
    (event) => event.DragonType !== "Elder",
  );

  let orderDragonKills = 0;
  let chaosDragonKills = 0;

  for (const event of elementalDragonKillEvents) {
    if (event.KillerTeam === "ORDER") {
      orderDragonKills += 1;
    }

    if (event.KillerTeam === "CHAOS") {
      chaosDragonKills += 1;
    }

    if (
      orderDragonKills >= DRAGONS_REQUIRED_FOR_SOUL ||
      chaosDragonKills >= DRAGONS_REQUIRED_FOR_SOUL
    ) {
      return event.EventTime;
    }
  }

  return undefined;
}

function calculateElderTimer(
  gameTime: number,
  events: LiveClientEvent[],
): ObjectiveTimer {
  const dragonSoulTime = getDragonSoulTime(events);

  if (dragonSoulTime === undefined) {
    return {
      status: "inactive",
      isAlive: false,
      canRespawn: true,
    };
  }

  const elderKillEvents = findEvents(events, "DragonKill").filter(
    (event) => event.DragonType === "Elder",
  );

  const lastElderKillEvent = elderKillEvents[elderKillEvents.length - 1];

  const firstElderSpawnTime = dragonSoulTime + OBJECTIVE_RESPAWN_TIMES.elder;

  const nextSpawnTime =
    lastElderKillEvent !== undefined
      ? lastElderKillEvent.EventTime + OBJECTIVE_RESPAWN_TIMES.elder
      : firstElderSpawnTime;

  const remainingSeconds = Math.max(0, Math.floor(nextSpawnTime - gameTime));
  const isAlive = gameTime >= nextSpawnTime;

  return {
    status: isAlive ? "alive" : "waiting",
    isAlive,
    canRespawn: true,
    spawnTimeSeconds: firstElderSpawnTime,
    lastKillTimeSeconds: lastElderKillEvent?.EventTime,
    nextSpawnTimeSeconds: nextSpawnTime,
    remainingSeconds,
  };
}

function calculateObjectiveTimer({
  gameTime,
  events,
  eventName,
  firstSpawnTime,
  respawnTime,
  canRespawn,
  endTime,
}: CalculateObjectiveTimerParams): ObjectiveTimer {
  const killEvents = findEvents(events, eventName);
  const lastKillEvent = killEvents[killEvents.length - 1];

  const hasBeenKilled = lastKillEvent !== undefined;

  if (hasBeenKilled && !canRespawn) {
    return {
      status: "ended",
      isAlive: false,
      canRespawn: false,
      spawnTimeSeconds: firstSpawnTime,
      lastKillTimeSeconds: lastKillEvent.EventTime,
      remainingSeconds: 0,
    };
  }
  if (!hasBeenKilled && endTime !== undefined && gameTime >= endTime) {
    return {
      status: "ended",
      isAlive: false,
      canRespawn: false,
      spawnTimeSeconds: firstSpawnTime,
      nextSpawnTimeSeconds: firstSpawnTime,
      remainingSeconds: 0,
    };
  }
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
  const elementalDragonEvents = events.filter(
    (event) => event.EventName !== "DragonKill" || event.DragonType !== "Elder",
  );

  return {
    dragon: {
      ...calculateObjectiveTimer({
        gameTime,
        events: elementalDragonEvents,
        eventName: "DragonKill",
        firstSpawnTime: OBJECTIVE_FIRST_SPAWN_TIMES.dragon,
        respawnTime: OBJECTIVE_RESPAWN_TIMES.dragon,
        canRespawn: true,
      }),
      dragonType: undefined,
    },

    elder: calculateElderTimer(gameTime, events),

    baron: calculateObjectiveTimer({
      gameTime,
      events,
      eventName: "BaronKill",
      firstSpawnTime: OBJECTIVE_FIRST_SPAWN_TIMES.baron,
      respawnTime: OBJECTIVE_RESPAWN_TIMES.baron,
      canRespawn: true,
    }),

    herald: {
      ...calculateObjectiveTimer({
        gameTime,
        events,
        eventName: "HeraldKill",
        firstSpawnTime: OBJECTIVE_FIRST_SPAWN_TIMES.herald,
        canRespawn: false,
        endTime: OBJECTIVE_FIRST_SPAWN_TIMES.baron,
      }),
      canRespawn: gameTime < OBJECTIVE_FIRST_SPAWN_TIMES.herald ? true : false,
    },

    voidgrubs: calculateVoidgrubsTimer(gameTime, events),
  };
}
