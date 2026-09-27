// checkLiveObjectivesSimple.js
// 실행: node checkLiveObjectivesSimple.js
// 실제 Riot Live Client API만 사용함. mock 없음.

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const API_URL = "https://127.0.0.1:2999/liveclientdata/allgamedata";

const FIRST_SPAWN = {
  dragon: 5 * 60,
  voidgrubs: 8 * 60,
  herald: 15 * 60,
  baron: 20 * 60,
};

const RESPAWN = {
  dragon: 5 * 60,
  elder: 6 * 60,
  baron: 6 * 60,
};

const VOIDGRUB_TOTAL_COUNT = 3;
const DRAGONS_REQUIRED_FOR_SOUL = 4;

async function fetchAllGameData() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Live Client API 요청 실패: ${response.status}`);
  }

  return response.json();
}

function formatTime(seconds) {
  if (seconds === undefined || seconds === null) return "-";

  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const secs = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${secs}`;
}

function teamLabel(team) {
  if (team === "ORDER") return "블루팀";
  if (team === "CHAOS") return "레드팀";
  return "없음";
}

function getPlayerName(player) {
  return (
    player.summonerName ||
    player.riotId ||
    player.riotIdGameName ||
    player.playerName ||
    player.championName
  );
}

function getKillerTeam(event, players) {
  if (!event.KillerName) return undefined;

  const killer = players.find((player) => {
    return (
      getPlayerName(player) === event.KillerName ||
      player.summonerName === event.KillerName ||
      player.championName === event.KillerName ||
      player.riotId === event.KillerName ||
      player.riotIdGameName === event.KillerName
    );
  });

  if (killer?.team === "ORDER" || killer?.team === "CHAOS") {
    return killer.team;
  }

  return undefined;
}

function addKillerTeamToEvents(events, players) {
  return events.map((event) => ({
    ...event,
    KillerTeam: getKillerTeam(event, players),
  }));
}

function getDragonType(event) {
  return (
    event.DragonType ||
    event.DragonForm ||
    event.DragonName ||
    event.MonsterType ||
    event.MonsterSubType
  );
}

function isElderDragonEvent(event) {
  const dragonType = String(getDragonType(event) ?? "").toLowerCase();

  return (
    event.EventName === "ElderKill" ||
    event.EventName === "ElderDragonKill" ||
    dragonType.includes("elder")
  );
}

function isNormalDragonEvent(event) {
  return event.EventName === "DragonKill" && !isElderDragonEvent(event);
}

function getNormalDragonEvents(events) {
  return events
    .filter(isNormalDragonEvent)
    .sort((a, b) => a.EventTime - b.EventTime);
}

function getDragonCounts(events) {
  const dragonEvents = getNormalDragonEvents(events);

  let blue = 0;
  let red = 0;

  for (const event of dragonEvents) {
    if (event.KillerTeam === "ORDER") blue += 1;
    if (event.KillerTeam === "CHAOS") red += 1;
  }

  return { blue, red };
}

function getSoulInfo(events) {
  const dragonEvents = getNormalDragonEvents(events);

  let blue = 0;
  let red = 0;

  for (const event of dragonEvents) {
    if (event.KillerTeam === "ORDER") blue += 1;
    if (event.KillerTeam === "CHAOS") red += 1;

    if (blue >= DRAGONS_REQUIRED_FOR_SOUL) {
      return {
        soulTeam: "ORDER",
        soulTime: event.EventTime,
      };
    }

    if (red >= DRAGONS_REQUIRED_FOR_SOUL) {
      return {
        soulTeam: "CHAOS",
        soulTime: event.EventTime,
      };
    }
  }

  return {
    soulTeam: undefined,
    soulTime: undefined,
  };
}

function getDragonRespawn(gameTime, events) {
  const dragonEvents = getNormalDragonEvents(events);
  const lastDragon = dragonEvents[dragonEvents.length - 1];

  const nextSpawnTime = lastDragon
    ? lastDragon.EventTime + RESPAWN.dragon
    : FIRST_SPAWN.dragon;

  return {
    nextSpawnTime,
    remainingSeconds: Math.max(0, nextSpawnTime - gameTime),
    status: gameTime >= nextSpawnTime ? "생성됨" : "대기 중",
  };
}

function getElderRespawn(gameTime, events) {
  const soulInfo = getSoulInfo(events);

  if (!soulInfo.soulTeam || soulInfo.soulTime === undefined) {
    return {
      status: "비활성",
      soulTeam: undefined,
      soulTime: undefined,
      nextSpawnTime: undefined,
      remainingSeconds: undefined,
    };
  }

  const elderEvents = events
    .filter(isElderDragonEvent)
    .sort((a, b) => a.EventTime - b.EventTime);

  const lastElder = elderEvents[elderEvents.length - 1];

  const firstElderSpawnTime = soulInfo.soulTime + RESPAWN.elder;

  const nextSpawnTime = lastElder
    ? lastElder.EventTime + RESPAWN.elder
    : firstElderSpawnTime;

  return {
    status: gameTime >= nextSpawnTime ? "생성됨" : "대기 중",
    soulTeam: soulInfo.soulTeam,
    soulTime: soulInfo.soulTime,
    nextSpawnTime,
    remainingSeconds: Math.max(0, nextSpawnTime - gameTime),
  };
}

function getHeraldInfo(gameTime, events) {
  const heraldEvents = events
    .filter((event) => event.EventName === "HeraldKill")
    .sort((a, b) => a.EventTime - b.EventTime);

  const heraldKill = heraldEvents[heraldEvents.length - 1];

  if (heraldKill) {
    return {
      status: "먹힘",
      killerTeam: heraldKill.KillerTeam,
      killerName: heraldKill.KillerName,
      nextSpawnTime: undefined,
      remainingSeconds: 0,
      reason: "전령 처치됨",
    };
  }

  if (gameTime >= FIRST_SPAWN.baron) {
    return {
      status: "못 먹음",
      killerTeam: undefined,
      killerName: undefined,
      nextSpawnTime: undefined,
      remainingSeconds: 0,
      reason: "바론 생성 시간 도달",
    };
  }

  if (gameTime >= FIRST_SPAWN.herald) {
    return {
      status: "생성됨",
      killerTeam: undefined,
      killerName: undefined,
      nextSpawnTime: undefined,
      remainingSeconds: 0,
      reason: "전령 살아있음",
    };
  }

  return {
    status: "대기 중",
    killerTeam: undefined,
    killerName: undefined,
    nextSpawnTime: FIRST_SPAWN.herald,
    remainingSeconds: FIRST_SPAWN.herald - gameTime,
    reason: "전령 생성 전",
  };
}

function getVoidgrubInfo(gameTime, events) {
  const hordeEvents = events
    .filter((event) => event.EventName === "HordeKill")
    .sort((a, b) => a.EventTime - b.EventTime);

  const blueCount = hordeEvents.filter(
    (event) => event.KillerTeam === "ORDER",
  ).length;

  const redCount = hordeEvents.filter(
    (event) => event.KillerTeam === "CHAOS",
  ).length;

  const totalCount = Math.min(hordeEvents.length, VOIDGRUB_TOTAL_COUNT);

  const lastKill = hordeEvents[hordeEvents.length - 1];

  if (totalCount >= VOIDGRUB_TOTAL_COUNT) {
    return {
      status: "종료",
      blueCount,
      redCount,
      totalCount,
      lastKillerTeam: lastKill?.KillerTeam,
      lastKillerName: lastKill?.KillerName,
      nextSpawnTime: undefined,
      remainingSeconds: 0,
      reason: "3마리 모두 처치됨",
    };
  }

  if (gameTime >= FIRST_SPAWN.herald) {
    return {
      status: "종료",
      blueCount,
      redCount,
      totalCount,
      lastKillerTeam: lastKill?.KillerTeam,
      lastKillerName: lastKill?.KillerName,
      nextSpawnTime: undefined,
      remainingSeconds: 0,
      reason: "전령 생성 시간 도달",
    };
  }

  if (gameTime >= FIRST_SPAWN.voidgrubs) {
    return {
      status: "생성됨",
      blueCount,
      redCount,
      totalCount,
      lastKillerTeam: lastKill?.KillerTeam,
      lastKillerName: lastKill?.KillerName,
      nextSpawnTime: undefined,
      remainingSeconds: 0,
      reason: "공허유충 살아있음",
    };
  }

  return {
    status: "대기 중",
    blueCount,
    redCount,
    totalCount,
    lastKillerTeam: undefined,
    lastKillerName: undefined,
    nextSpawnTime: FIRST_SPAWN.voidgrubs,
    remainingSeconds: FIRST_SPAWN.voidgrubs - gameTime,
    reason: "공허유충 생성 전",
  };
}

function getBaronRespawn(gameTime, events) {
  const baronEvents = events
    .filter((event) => event.EventName === "BaronKill")
    .sort((a, b) => a.EventTime - b.EventTime);

  const lastBaron = baronEvents[baronEvents.length - 1];

  const nextSpawnTime = lastBaron
    ? lastBaron.EventTime + RESPAWN.baron
    : FIRST_SPAWN.baron;

  return {
    status: gameTime >= nextSpawnTime ? "생성됨" : "대기 중",
    nextSpawnTime,
    remainingSeconds: Math.max(0, nextSpawnTime - gameTime),
    lastKillerTeam: lastBaron?.KillerTeam,
    lastKillerName: lastBaron?.KillerName,
  };
}

function printResult(gameTime, values) {
  console.clear();

  console.log("LeagueStudio 실제 API 오브젝트 확인");
  console.log("=".repeat(80));
  console.log(`게임 시간: ${formatTime(gameTime)}`);
  console.log("");

  console.log("[용 개수]");
  console.log(`블루팀 용 개수: ${values.dragons.blue}`);
  console.log(`레드팀 용 개수: ${values.dragons.red}`);
  console.log("");

  console.log("[전령]");
  console.log(`상태: ${values.herald.status}`);
  console.log(
    `먹은 팀: ${
      values.herald.killerTeam ? teamLabel(values.herald.killerTeam) : "없음"
    }`,
  );
  console.log(`먹은 사람: ${values.herald.killerName ?? "없음"}`);
  console.log(`전령 리스폰/생성 시간: ${formatTime(values.herald.nextSpawnTime)}`);
  console.log(`전령 남은 시간: ${formatTime(values.herald.remainingSeconds)}`);
  console.log(`사유: ${values.herald.reason}`);
  console.log("");

  console.log("[공허유충]");
  console.log(`상태: ${values.voidgrubs.status}`);
  console.log(`블루팀이 먹은 개수: ${values.voidgrubs.blueCount}`);
  console.log(`레드팀이 먹은 개수: ${values.voidgrubs.redCount}`);
  console.log(`전체 먹힌 개수: ${values.voidgrubs.totalCount}/3`);
  console.log(
    `마지막으로 먹은 팀: ${
      values.voidgrubs.lastKillerTeam
        ? teamLabel(values.voidgrubs.lastKillerTeam)
        : "없음"
    }`,
  );
  console.log(`마지막으로 먹은 사람: ${values.voidgrubs.lastKillerName ?? "없음"}`);
  console.log(
    `유충 리스폰/생성 시간: ${formatTime(values.voidgrubs.nextSpawnTime)}`,
  );
  console.log(`유충 남은 시간: ${formatTime(values.voidgrubs.remainingSeconds)}`);
  console.log(`사유: ${values.voidgrubs.reason}`);
  console.log("");

  console.log("[장로]");
  console.log(`상태: ${values.elder.status}`);
  console.log(
    `4용 달성 팀: ${
      values.elder.soulTeam ? teamLabel(values.elder.soulTeam) : "없음"
    }`,
  );
  console.log(`4용 달성 시간: ${formatTime(values.elder.soulTime)}`);
  console.log(`장로 리스폰/생성 시간: ${formatTime(values.elder.nextSpawnTime)}`);
  console.log(`장로 남은 시간: ${formatTime(values.elder.remainingSeconds)}`);
  console.log("");

  console.log("[바론]");
  console.log(`상태: ${values.baron.status}`);
  console.log(`바론 리스폰/생성 시간: ${formatTime(values.baron.nextSpawnTime)}`);
  console.log(`바론 남은 시간: ${formatTime(values.baron.remainingSeconds)}`);
  console.log(
    `마지막으로 먹은 팀: ${
      values.baron.lastKillerTeam
        ? teamLabel(values.baron.lastKillerTeam)
        : "없음"
    }`,
  );
  console.log(`마지막으로 먹은 사람: ${values.baron.lastKillerName ?? "없음"}`);
}

async function check() {
  try {
    const allGameData = await fetchAllGameData();

    const gameTime = allGameData.gameData.gameTime;
    const players = allGameData.allPlayers ?? [];
    const rawEvents = allGameData.events?.Events ?? [];

    const events = addKillerTeamToEvents(rawEvents, players);

    const values = {
      dragons: getDragonCounts(events),
      dragonRespawn: getDragonRespawn(gameTime, events),
      herald: getHeraldInfo(gameTime, events),
      voidgrubs: getVoidgrubInfo(gameTime, events),
      elder: getElderRespawn(gameTime, events),
      baron: getBaronRespawn(gameTime, events),
    };

    printResult(gameTime, values);
  } catch (error) {
    console.clear();
    console.log("LeagueStudio 실제 API 오브젝트 확인");
    console.log("=".repeat(80));
    console.log("실제 Riot Live Client API 연결 실패");
    console.log("");
    console.log("이 파일은 mock 데이터를 사용하지 않음.");
    console.log("게임/관전 중이 아니면 실패하는 게 정상임.");
    console.log("");
    console.log("브라우저에서 아래 주소 확인:");
    console.log("https://127.0.0.1:2999/liveclientdata/allgamedata");
    console.log("");
    console.error(error.message);
  }
}

check();
setInterval(check, 1000);