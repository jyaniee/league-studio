import type { GameState } from "@league-studio/shared-types";

let time = 0;

export function getMockGameState(): GameState {
  time += 1;

  return {
    phase: "in-game",
    gameTime: time,
    blueTeamName: "BLUE",
    redTeamName: "RED",
    blueKills: Math.floor(time / 5),
    redKills: Math.floor(time / 7)
  };
}