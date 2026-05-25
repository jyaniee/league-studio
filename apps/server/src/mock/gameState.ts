import type { GameState } from "@league-studio/shared-types";
import { calculateObjectives } from "../objectiveTimers";
//가짜 데이터 파일 게임이 안 켜져 있거나 API 연결이 실패했을 때 쓰는 가짜 데이터 파일
let time = 0;

export function getMockGameState(): GameState {
  time += 1;

  const mockEvents = [
    {
      EventID: 1,
      EventName: "DragonKill",
      EventTime: 16 * 60 + 1,
      KillerName: "MockPlayer",
    },
    {
      EventID: 2,
      EventName: "BaronKill",
      EventTime: 20 * 60 + 48,
      KillerName: "MockPlayer",
    },
  ];

   return {
    phase: "in-game",
    gameTime: time,

    blueTeam: {
      side: "blue",
      name: "BLUE",
      logoUrl: undefined,
      kills: Math.floor(time / 5),
      globalGold: undefined,
      towers: 0,
      dragons: [],
      voidgrubs: 0,
    },

    redTeam: {
      side: "red",
      name: "RED",
      logoUrl: undefined,
      kills: Math.floor(time / 7),
      globalGold: undefined,
      towers: 0,
      dragons: [],
      voidgrubs: 0,
    },

    objectives: calculateObjectives(time, mockEvents),

    source: "mock",
    updatedAt: new Date().toISOString(),
  };
}