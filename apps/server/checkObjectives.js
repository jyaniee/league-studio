// 터미널 확인용 코드
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const API = "https://127.0.0.1:2999/liveclientdata";

// ===============================
// 오브젝트 기준 시간
// ===============================

// 드래곤: 첫 생성 5분, 처치 후 5분 뒤 재생성
const FIRST_DRAGON_SPAWN = 5 * 60;
const DRAGON_RESPAWN = 5 * 60;

// 바론: 첫 생성 20분, 처치 후 6분 뒤 재생성
const FIRST_BARON_SPAWN = 20 * 60;
const BARON_RESPAWN = 6 * 60;

// ===============================
// 시간 포맷 함수
// ===============================
function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const min = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

// ===============================
// 특정 이벤트 찾기
// ===============================
function findEvents(events, eventName) {
  return events
    .filter((event) => event.EventName === eventName)
    .sort((a, b) => a.EventTime - b.EventTime);
}

// ===============================
// 오브젝트 타이머 계산
// ===============================
function calculateObjectiveTimer({
  gameTime,
  events,
  eventName,
  firstSpawnTime,
  respawnTime,
}) {
  const killEvents = findEvents(events, eventName);
  const lastKillEvent = killEvents[killEvents.length - 1];

  // 마지막 처치 이벤트가 있으면 처치 시간 + 재생성 시간
  // 없으면 첫 생성 시간
  const nextSpawnTime = lastKillEvent
    ? lastKillEvent.EventTime + respawnTime
    : firstSpawnTime;

  const remainingSeconds = nextSpawnTime - gameTime;
  const isAlive = remainingSeconds <= 0;

  return {
    eventName,
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

// ===============================
// API 호출
// ===============================
async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ===============================
// 메인 실행 함수
// ===============================
async function main() {
  const gameStats = await fetchJson(`${API}/gamestats`);
  const eventData = await fetchJson(`${API}/eventdata`);

  const gameTime = gameStats.gameTime;
  const events = eventData.Events || [];

  const dragon = calculateObjectiveTimer({
    gameTime,
    events,
    eventName: "DragonKill",
    firstSpawnTime: FIRST_DRAGON_SPAWN,
    respawnTime: DRAGON_RESPAWN,
  });

  const baron = calculateObjectiveTimer({
    gameTime,
    events,
    eventName: "BaronKill",
    firstSpawnTime: FIRST_BARON_SPAWN,
    respawnTime: BARON_RESPAWN,
  });

  console.clear();

  console.log("========== 오브젝트 타이머 ==========");
  console.log("현재 게임 시간:", formatTime(gameTime));
  console.log("");

  console.log("[드래곤]");
  console.log("상태:", dragon.status);
  console.log("마지막 처치 시간:", dragon.lastKillTime);
  console.log("다음 생성 예상 시간:", dragon.nextSpawnTime);
  console.log("남은 시간:", dragon.remainingTime);
  console.log("");

  console.log("[바론]");
  console.log("상태:", baron.status);
  console.log("마지막 처치 시간:", baron.lastKillTime);
  console.log("다음 생성 예상 시간:", baron.nextSpawnTime);
  console.log("남은 시간:", baron.remainingTime);
  console.log("");

  console.log("========== 이벤트 목록 ==========");
  console.table(
    events.map((e) => ({
      id: e.EventID,
      name: e.EventName,
      time: formatTime(e.EventTime),
      killer: e.KillerName || "",
      victim: e.VictimName || "",
    }))
  );
}

// ===============================
// 실시간 반복 실행
// ===============================
main().catch((error) => {
  console.error("실행 중 오류 발생:", error.message);
});

setInterval(() => {
  main().catch((error) => {
    console.error("실행 중 오류 발생:", error.message);
  });
}, 1000);