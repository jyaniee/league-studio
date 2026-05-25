// checkObjectiveTimers.js
// 실행: node checkObjectiveTimers.js

const FIRST_SPAWN = {
  dragon: 5 * 60,
  voidgrubs: 8 * 60,
  herald: 15 * 60,
  baron: 20 * 60,
};

const RESPAWN = {
  dragon: 5 * 60,
  baron: 6 * 60,
  elder: 6 * 60,
};

const ELDER_RESPAWN_TIME = 6 * 60;
const DRAGONS_REQUIRED_FOR_SOUL = 4;
const VOIDGRUB_TOTAL_COUNT = 3;

function formatTime(seconds) {
  if (seconds === undefined || seconds === null) {
    return "-";
  }

  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const secs = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${secs}`;
}

function findEvents(events, eventName) {
  return events
    .filter((event) => event.EventName === eventName)
    .sort((a, b) => a.EventTime - b.EventTime);
}

function calculateObjectiveTimer({
  gameTime,
  events,
  eventName,
  firstSpawnTime,
  respawnTime,
  canRespawn,
  endTime,
}) {
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
    hasBeenKilled && respawnTime !== undefined
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

function calculateVoidgrubsTimer(gameTime, events) {
  const voidgrubKillEvents = findEvents(events, "HordeKill");
  const killedCount = Math.min(voidgrubKillEvents.length, VOIDGRUB_TOTAL_COUNT);
  const lastKillEvent = voidgrubKillEvents[voidgrubKillEvents.length - 1];

  const firstSpawnTime = FIRST_SPAWN.voidgrubs;
  const endTime = FIRST_SPAWN.herald;

  if (killedCount >= VOIDGRUB_TOTAL_COUNT) {
    return {
      status: "ended",
      isAlive: false,
      canRespawn: false,
      spawnTimeSeconds: firstSpawnTime,
      lastKillTimeSeconds: lastKillEvent?.EventTime,
      remainingSeconds: 0,
      killedCount,
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
      killedCount,
    };
  }

  const remainingSeconds = Math.max(0, Math.floor(firstSpawnTime - gameTime));
  const isAlive = gameTime >= firstSpawnTime;

  return {
    status: isAlive ? "alive" : "waiting",
    isAlive,
    canRespawn: false,
    spawnTimeSeconds: firstSpawnTime,
    lastKillTimeSeconds: lastKillEvent?.EventTime,
    nextSpawnTimeSeconds: firstSpawnTime,
    remainingSeconds,
    killedCount,
  };
}

function getDragonSoulTime(events) {
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

function calculateElderTimer(gameTime, events) {
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

  const firstElderSpawnTime = dragonSoulTime + ELDER_RESPAWN_TIME;

  const nextSpawnTime =
    lastElderKillEvent !== undefined
      ? lastElderKillEvent.EventTime + ELDER_RESPAWN_TIME
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

function calculateObjectives(gameTime, events) {
  const elementalDragonEvents = events.filter(
    (event) => event.EventName !== "DragonKill" || event.DragonType !== "Elder",
  );

  return {
    dragon: calculateObjectiveTimer({
      gameTime,
      events: elementalDragonEvents,
      eventName: "DragonKill",
      firstSpawnTime: FIRST_SPAWN.dragon,
      respawnTime: RESPAWN.dragon,
      canRespawn: true,
    }),

    elder: calculateElderTimer(gameTime, events),

    baron: calculateObjectiveTimer({
      gameTime,
      events,
      eventName: "BaronKill",
      firstSpawnTime: FIRST_SPAWN.baron,
      respawnTime: RESPAWN.baron,
      canRespawn: true,
    }),

    herald: calculateObjectiveTimer({
      gameTime,
      events,
      eventName: "HeraldKill",
      firstSpawnTime: FIRST_SPAWN.herald,
      canRespawn: false,
      endTime: FIRST_SPAWN.baron,
    }),

    voidgrubs: calculateVoidgrubsTimer(gameTime, events),
  };
}

function printObjective(name, objective) {
  console.log(`${name}`);
  console.log(`  상태: ${objective.status}`);
  console.log(`  생성됨: ${objective.isAlive ? "O" : "X"}`);
  console.log(`  리스폰 가능: ${objective.canRespawn ? "O" : "X"}`);
  console.log(`  첫 생성: ${formatTime(objective.spawnTimeSeconds)}`);
  console.log(`  마지막 처치: ${formatTime(objective.lastKillTimeSeconds)}`);
  console.log(`  다음 생성: ${formatTime(objective.nextSpawnTimeSeconds)}`);
  console.log(`  남은 시간: ${formatTime(objective.remainingSeconds)}`);

  if (objective.killedCount !== undefined) {
    console.log(`  처치 수: ${objective.killedCount}/3`);
  }

  console.log("");
}

function runTest(title, gameTime, events) {
  console.log("=".repeat(70));
  console.log(title);
  console.log(`게임 시간: ${formatTime(gameTime)}`);
  console.log("=".repeat(70));

  const objectives = calculateObjectives(gameTime, events);

  printObjective("장로 드래곤", objectives.elder);
  printObjective("전령", objectives.herald);
  printObjective("공허유충", objectives.voidgrubs);
}

const noKillEvents = [];

const voidgrubThreeKills = [
  {
    EventID: 1,
    EventName: "HordeKill",
    EventTime: 8 * 60 + 10,
    KillerName: "MockPlayer",
    KillerTeam: "ORDER",
  },
  {
    EventID: 2,
    EventName: "HordeKill",
    EventTime: 8 * 60 + 20,
    KillerName: "MockPlayer",
    KillerTeam: "ORDER",
  },
  {
    EventID: 3,
    EventName: "HordeKill",
    EventTime: 8 * 60 + 30,
    KillerName: "MockPlayer",
    KillerTeam: "ORDER",
  },
];

const heraldKillEvents = [
  {
    EventID: 1,
    EventName: "HeraldKill",
    EventTime: 16 * 60,
    KillerName: "MockPlayer",
    KillerTeam: "ORDER",
  },
];

const fourDragonEvents = [
  {
    EventID: 1,
    EventName: "DragonKill",
    EventTime: 5 * 60,
    KillerName: "MockPlayer",
    KillerTeam: "ORDER",
  },
  {
    EventID: 2,
    EventName: "DragonKill",
    EventTime: 10 * 60,
    KillerName: "MockPlayer",
    KillerTeam: "ORDER",
  },
  {
    EventID: 3,
    EventName: "DragonKill",
    EventTime: 15 * 60,
    KillerName: "MockPlayer",
    KillerTeam: "ORDER",
  },
  {
    EventID: 4,
    EventName: "DragonKill",
    EventTime: 20 * 60,
    KillerName: "MockPlayer",
    KillerTeam: "ORDER",
  },
];

const elderKillEvents = [
  ...fourDragonEvents,
  {
    EventID: 5,
    EventName: "DragonKill",
    EventTime: 27 * 60,
    KillerName: "MockPlayer",
    KillerTeam: "CHAOS",
    DragonType: "Elder",
  },
];

console.clear();

runTest(
  "테스트 1: 7분 30초, 유충/전령 아직 생성 전",
  7 * 60 + 30,
  noKillEvents,
);

runTest(
  "테스트 2: 14분, 유충 생성됨, 아직 전령 전이라 alive",
  14 * 60,
  noKillEvents,
);

runTest(
  "테스트 3: 15분 1초, 유충 안 먹었지만 전령 시간 지나서 ended",
  15 * 60 + 1,
  noKillEvents,
);

runTest(
  "테스트 4: 유충 3마리 처치, ended",
  9 * 60,
  voidgrubThreeKills,
);

runTest(
  "테스트 5: 19분, 전령 생성됨, 아직 바론 전이라 alive",
  19 * 60,
  noKillEvents,
);

runTest(
  "테스트 6: 20분 1초, 전령 안 먹었지만 바론 시간 지나서 ended",
  20 * 60 + 1,
  noKillEvents,
);

runTest(
  "테스트 7: 전령 처치됨, ended",
  17 * 60,
  heraldKillEvents,
);

runTest(
  "테스트 8: 한 팀이 4용 달성, 장로는 26분에 생성 대기",
  24 * 60,
  fourDragonEvents,
);

runTest(
  "테스트 9: 4용 이후 26분 지남, 장로 alive",
  26 * 60 + 1,
  fourDragonEvents,
);

runTest(
  "테스트 10: 장로 처치 후 6분 뒤 재생성 대기",
  30 * 60,
  elderKillEvents,
);