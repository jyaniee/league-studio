export interface GameState {
  phase: "in-game" | "post-game";
  gameTime: number;
  blueTeamName: string;
  redTeamName: string;
  blueKills: number;
  redKills: number;
}