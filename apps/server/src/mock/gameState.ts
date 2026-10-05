import type { GameState, PlayerState } from "@league-studio/shared-types";
import { calculateObjectives } from "../calculators/objectiveTimers";
//가짜 데이터 파일 게임이 안 켜져 있거나 API 연결이 실패했을 때 쓰는 가짜 데이터 파일
let time = 0;

const bluePlayers: PlayerState[] = [
  {
    position: "TOP",
    championName: "Garen",
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    items: [1054, 2003, null, null, null, null],
    ward: "stealth",
  },
  {
    position: "JUNGLE",
    championName: "LeeSin",
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    items: [1103, null, null, null, null, null],
    ward: "stealth",
  },
  {
    position: "MIDDLE",
    championName: "Ahri",
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    items: [1056, null, null, null, null, null],
    ward: "stealth",
  },
  {
    position: "BOTTOM",
    championName: "Jinx",
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    items: [1055, null, null, null, null, null],
    ward: "stealth",
  },
  {
    position: "UTILITY",
    championName: "Thresh",
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    items: [3850, null, null, null, null, null],
    ward: "stealth",
  },
];

const redPlayers: PlayerState[] = [
  {
    position: "TOP",
    championName: "Aatrox",
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    items: [1054, null, null, null, null, null],
    ward: "oracle",
  },
  {
    position: "JUNGLE",
    championName: "Viego",
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    items: [1103, null, null, null, null, null],
    ward: "stealth",
  },
  {
    position: "MIDDLE",
    championName: "Syndra",
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    items: [1056, null, null, null, null, null],
    ward: "stealth",
  },
  {
    position: "BOTTOM",
    championName: "Aphelios",
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    items: [1055, null, null, null, null, null],
    ward: "farsight",
  },
  {
    position: "UTILITY",
    championName: "Rell",
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    items: [3850, null, null, null, null, null],
    ward: "stealth",
  },
];

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
      players: bluePlayers,
      kills: Math.floor(time / 5),
      globalGold: undefined,
      towers: 0,
      dragons: [],
      voidgrubs: 0,
      heralds: 0,
      barons: 0,
    },

    redTeam: {
      side: "red",
      name: "RED",
      logoUrl: undefined,
      players: redPlayers,
      kills: Math.floor(time / 7),
      globalGold: undefined,
      towers: 0,
      dragons: [],
      voidgrubs: 0,
      heralds: 0,
      barons: 0,
    },

    objectives: calculateObjectives(time, mockEvents),

    source: "mock",
    updatedAt: new Date().toISOString(),
  };
}
