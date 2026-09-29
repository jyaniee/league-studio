import type { GameState, PlayerState } from "@league-studio/shared-types";
import { calculateObjectives } from "../calculators/objectiveTimers";
//가짜 데이터 파일 게임이 안 켜져 있거나 API 연결이 실패했을 때 쓰는 가짜 데이터 파일
let time = 0;

const mockPlayers: PlayerState[] = [
  {
    side: "blue",
    position: "TOP",
    championKey: "Garen",
    kills: 0,
    deaths: 0,
    assists: 0,
    creepScore: 0,
    items: [
      { itemId: 1054, slot: 0 },
      { itemId: 2003, slot: 1 },
    ],
    trinketItemId: 3340,
  },
  {
    side: "blue",
    position: "JUNGLE",
    championKey: "LeeSin",
    kills: 0,
    deaths: 0,
    assists: 0,
    creepScore: 0,
    items: [{ itemId: 1103, slot: 0 }],
    trinketItemId: 3340,
  },
  {
    side: "blue",
    position: "MIDDLE",
    championKey: "Ahri",
    kills: 0,
    deaths: 0,
    assists: 0,
    creepScore: 0,
    items: [{ itemId: 1056, slot: 0 }],
    trinketItemId: 3340,
  },
  {
    side: "blue",
    position: "BOTTOM",
    championKey: "Jinx",
    kills: 0,
    deaths: 0,
    assists: 0,
    creepScore: 0,
    items: [{ itemId: 1055, slot: 0 }],
    trinketItemId: 3340,
  },
  {
    side: "blue",
    position: "UTILITY",
    championKey: "Thresh",
    kills: 0,
    deaths: 0,
    assists: 0,
    creepScore: 0,
    items: [{ itemId: 3850, slot: 0 }],
    trinketItemId: 3340,
  },
  {
    side: "red",
    position: "TOP",
    championKey: "Aatrox",
    kills: 0,
    deaths: 0,
    assists: 0,
    creepScore: 0,
    items: [{ itemId: 1054, slot: 0 }],
    trinketItemId: 3364,
  },
  {
    side: "red",
    position: "JUNGLE",
    championKey: "Viego",
    kills: 0,
    deaths: 0,
    assists: 0,
    creepScore: 0,
    items: [{ itemId: 1103, slot: 0 }],
    trinketItemId: 3340,
  },
  {
    side: "red",
    position: "MIDDLE",
    championKey: "Syndra",
    kills: 0,
    deaths: 0,
    assists: 0,
    creepScore: 0,
    items: [{ itemId: 1056, slot: 0 }],
    trinketItemId: 3340,
  },
  {
    side: "red",
    position: "BOTTOM",
    championKey: "Aphelios",
    kills: 0,
    deaths: 0,
    assists: 0,
    creepScore: 0,
    items: [{ itemId: 1055, slot: 0 }],
    trinketItemId: 3363,
  },
  {
    side: "red",
    position: "UTILITY",
    championKey: "Rell",
    kills: 0,
    deaths: 0,
    assists: 0,
    creepScore: 0,
    items: [{ itemId: 3850, slot: 0 }],
    trinketItemId: 3340,
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

    players: mockPlayers,

    objectives: calculateObjectives(time, mockEvents),

    source: "mock",
    updatedAt: new Date().toISOString(),
  };
}