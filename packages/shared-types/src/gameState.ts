
export interface ObjectiveTimer {
  status: "LIVE" | "대기 중";
  isAlive: boolean;
  lastKillTime: string;
  nextSpawnTime: string;
  remainingTime: string;
  rawRemainingSeconds: number;
}

export interface GameObjectives {
  dragon: ObjectiveTimer;
  baron: ObjectiveTimer;
}

export interface GameState {
  phase: "in-game" | "post-game";
  gameTime: number;
  blueTeamName: string;
  redTeamName: string;
  blueKills: number;
  redKills: number;
  objectives: GameObjectives;
  source: "live-client-api" | "mock";
}
