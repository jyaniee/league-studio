export type  TeamSide = "blue" | "red";

export type GamePhase =
  | "pre-game"
  | "in-game"
  | "post-game";

export type DataSource =
  | "live-client-api"
  | "observer-tool"
  | "mock";

export type ObjectiveTimerStatus =
  | "alive"    // 살아있음
  | "waiting"  // 처치됐고 재생성 대기 중
  | "inactive" // 아직 등장 전이거나 현재 시간대에 비활성
  | "ended"    // 이번 게임에서 더 이상 등장하지 않음
  | "unknown"; // 계산 불가

export interface ObjectiveTimer {
  status: ObjectiveTimerStatus;
  isAlive: boolean;

  canRespawn: boolean; // 오브젝트가 이번 게임에서 다시 등장할 수 있는지 여부(dragon/baron/elder는 상황에 따라 true,
                       // herald/voidgrub은 시간대가 끝나면 false)


  spawnTimeSeconds?: number;  // 옵젝 첫 등장 시간(초)
  lastKillTimeSeconds?: number;   // 옵젝이 마지막으로 처치된 시간(초)
  nextSpawnTimeSeconds?: number;  // 다음 등장 또는 재등장 예정 시간(초)
  remainingSeconds?: number;  // 옵젝이 생성/재생성되기까지 남은 시간(초)
}


/*
export interface ObjectiveTimer {
  status: "LIVE" | "대기 중";
  isAlive: boolean;
  lastKillTime: string;
  nextSpawnTime: string;
  remainingTime: string;
  rawRemainingSeconds: number;
}
*/

export interface GameObjectives {
  dragon: ObjectiveTimer;
  elder: ObjectiveTimer;
  baron: ObjectiveTimer;
  herald: ObjectiveTimer;
  voidgrub: ObjectiveTimer;
}

export interface TeamState {
  side: TeamSide;
  name: string;
  tag?: string;
  logoUrl?: string;
  kills: number;
  globalGold?: number; // 옵저버 툴(OCR)로 수집하기 위해 Optional
  towers: number;
}


export interface GameState {
  phase: GamePhase;
  gameTime: number;

  blueTeam: TeamState;
  redTeam: TeamState;

  objectives?: GameObjectives;

  source: DataSource;

  updatedAt: string; // 이 State가 생성되었을 때의 ISO 타임스탬프
}
